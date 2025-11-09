// @ts-nocheck - Deno Edge Function (types are resolved at runtime)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateAnimationModule } from '../_shared/transpiler.ts';

/**
 * CORS headers for handling cross-origin requests
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * CDN Edge Function for serving animation timeline data as JavaScript
 * 
 * Usage: GET /get-animation-cdn?project_id=<uuid>&format=js (default)
 *        GET /get-animation-cdn?project_id=<uuid>&format=json
 * 
 * This function:
 * - Bypasses RLS using service role key
 * - Fetches all animation timelines for a given project
 * - Transpiles timeline data to executable JavaScript (default)
 * - Returns as a cacheable JavaScript module or JSON
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    // Parse URL and get parameters
    const url = new URL(req.url);
    const project_id = url.searchParams.get('project_id');
    const format = url.searchParams.get('format') || 'js'; // default to JavaScript

    // Validate project_id parameter
    if (!project_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing project_id parameter',
          message: 'Please provide a project_id in the query string'
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(project_id)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid project_id format',
          message: 'project_id must be a valid UUID'
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      );
    }

    // Create admin Supabase client using service role key
    // This bypasses Row Level Security (RLS) policies
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Query animation_timelines table for all timelines in this project
    const { data: timelines, error } = await supabaseAdmin
      .from('animation_timelines')
      .select('id, name, timeline_data, created_at, updated_at')
      .eq('project_id', project_id)
      .order('created_at', { ascending: true });

    // Handle database query errors
    if (error) {
      console.error('Database query error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Database query failed',
          message: error.message
        }),
        {
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      );
    }

    // Return empty result if no timelines found
    if (!timelines || timelines.length === 0) {
      if (format === 'json') {
        return new Response(
          JSON.stringify({ 
            project_id,
            timelines: [],
            message: 'No animation timelines found for this project'
          }),
          {
            status: 200,
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=300'
            },
          }
        );
      } else {
        // Return empty JavaScript module
        const emptyModule = `// No animations found for project: ${project_id}\nconsole.warn('[GSAP Animation Module] No animations found for this project.');`;
        return new Response(
          emptyModule,
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/javascript',
              'Cache-Control': 'public, max-age=300'
            },
          }
        );
      }
    }

    // Format: JSON - Return raw timeline data
    if (format === 'json') {
      const response = {
        project_id,
        timelines: timelines.map(timeline => ({
          id: timeline.id,
          name: timeline.name,
          timeline_data: timeline.timeline_data,
          created_at: timeline.created_at,
          updated_at: timeline.updated_at
        })),
        count: timelines.length
      };

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          },
        }
      );
    }

    // Format: JavaScript (default) - Transpile and return executable JS module
    try {
      const jsModule = generateAnimationModule(timelines, project_id);

      return new Response(
        jsModule,
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
            'X-Content-Type-Options': 'nosniff'
          },
        }
      );
    } catch (transpileError) {
      console.error('Transpilation error:', transpileError);
      return new Response(
        JSON.stringify({ 
          error: 'Transpilation failed',
          message: transpileError instanceof Error ? transpileError.message : 'Failed to generate JavaScript'
        }),
        {
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
        }
      );
    }

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
      }
    );
  }
});

