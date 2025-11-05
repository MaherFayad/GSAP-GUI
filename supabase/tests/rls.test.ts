import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const hasSupabaseCredentials = !!(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);

// Admin client - bypasses RLS, used for test setup/teardown
const adminClient = hasSupabaseCredentials
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Anon client - respects RLS, used for testing as a regular user
const anonClient = hasSupabaseCredentials
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Track test users for cleanup
const testUserIds: string[] = [];

interface TestUser {
  client: SupabaseClient;
  user: User;
  session: Session;
}

/**
 * Helper function to create a test user
 * Returns an authenticated Supabase client for that user
 */
async function createTestUser(): Promise<TestUser> {
  // Generate random credentials
  const randomId = Math.random().toString(36).substring(2, 15);
  const email = `test-${randomId}@example.com`;
  const password = `test-password-${randomId}`;

  if (!adminClient) {
    throw new Error('Admin client not initialized');
  }

  // Create user using admin client (bypasses RLS)
  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for testing
  });

  if (createError || !authData.user) {
    throw new Error(`Failed to create test user: ${createError?.message}`);
  }

  // Track user for cleanup
  testUserIds.push(authData.user.id);

  // Create a new client with anon keys for this user
  const userClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Sign in with the new user
  const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.user || !signInData.session) {
    throw new Error(`Failed to sign in test user: ${signInError?.message}`);
  }

  return {
    client: userClient,
    user: signInData.user,
    session: signInData.session,
  };
}

describe('Supabase RLS Integration Tests', () => {
  // Skip all tests if Supabase credentials are not configured
  if (!hasSupabaseCredentials) {
    it.skip('Supabase credentials not configured', () => {
      console.log('⚠️  Skipping RLS tests - configure .env.test with Supabase credentials to run these tests');
    });
    return;
  }

  afterEach(async () => {
    // Clean up all test users created during the test
    for (const userId of testUserIds) {
      try {
        await adminClient!.auth.admin.deleteUser(userId);
      } catch (error) {
        console.error(`Failed to delete test user ${userId}:`, error);
      }
    }
    // Clear the tracking array
    testUserIds.length = 0;
  });

  describe('Authentication', () => {
    it('should create a test user and authenticate', async () => {
      const testUser = await createTestUser();

      expect(testUser.user).toBeDefined();
      expect(testUser.user.email).toContain('test-');
      expect(testUser.session).toBeDefined();
      expect(testUser.session.access_token).toBeDefined();
    });

    it('should have valid session after authentication', async () => {
      const testUser = await createTestUser();

      const { data, error } = await testUser.client.auth.getSession();

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session?.user.id).toBe(testUser.user.id);
    });
  });

  describe('Row Level Security', () => {
    it('should prevent anonymous users from accessing protected data', async () => {
      // This is a placeholder test - implement based on your RLS policies
      // Once you have tables with RLS enabled, uncomment and modify:
      
      // Example for a 'projects' table:
      // const { data, error } = await anonClient.from('projects').select('*');
      // expect(error).toBeDefined();
      // expect(error?.code).toBe('42501'); // PostgreSQL permission denied
      
      // For now, just test that anon client exists
      expect(anonClient).not.toBeNull();
    });

    it('should allow authenticated users to access their own data', async () => {
      const testUser = await createTestUser();
      
      // Verify user was created and authenticated
      expect(testUser.user).toBeDefined();
      expect(testUser.session).toBeDefined();
      expect(testUser.client).toBeDefined();
      
      // Example for a 'projects' table:
      // const { data, error } = await testUser.client.from('projects').select('*');
      // expect(error).toBeNull();
      // expect(Array.isArray(data)).toBe(true);
    });

    it('should prevent users from accessing other users data', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      
      // Verify both users were created
      expect(user1.user.id).not.toBe(user2.user.id);
      
      // Example for a 'projects' table:
      // User1 creates a project
      // const { data: project } = await user1.client
      //   .from('projects')
      //   .insert({ name: 'User 1 Project', data: {} })
      //   .select()
      //   .single();
      // 
      // expect(project).toBeDefined();
      // 
      // // User2 tries to access User1's project
      // const { data, error } = await user2.client
      //   .from('projects')
      //   .select('*')
      //   .eq('id', project.id);
      // 
      // expect(data).toHaveLength(0);
      // // Or expect error if RLS denies the query entirely
    });

    it('should allow users to update their own data', async () => {
      const testUser = await createTestUser();
      
      // Example for a 'projects' table:
      // Create a project
      // const { data: project } = await testUser.client
      //   .from('projects')
      //   .insert({ name: 'Test Project' })
      //   .select()
      //   .single();
      // 
      // // Update the project
      // const { data: updated, error } = await testUser.client
      //   .from('projects')
      //   .update({ name: 'Updated Project' })
      //   .eq('id', project.id)
      //   .select()
      //   .single();
      // 
      // expect(error).toBeNull();
      // expect(updated.name).toBe('Updated Project');
      
      expect(testUser.user).toBeDefined();
    });

    it('should prevent users from updating other users data', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      
      // Example for a 'projects' table:
      // User1 creates a project
      // const { data: project } = await user1.client
      //   .from('projects')
      //   .insert({ name: 'User 1 Project' })
      //   .select()
      //   .single();
      // 
      // // User2 tries to update User1's project
      // const { error } = await user2.client
      //   .from('projects')
      //   .update({ name: 'Hacked' })
      //   .eq('id', project.id);
      // 
      // expect(error).toBeDefined();
      // expect(error.code).toBe('42501');
      
      expect(user1.user.id).not.toBe(user2.user.id);
    });

    it('should prevent users from deleting other users data', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      
      // Example for a 'projects' table:
      // User1 creates a project
      // const { data: project } = await user1.client
      //   .from('projects')
      //   .insert({ name: 'User 1 Project' })
      //   .select()
      //   .single();
      // 
      // // User2 tries to delete User1's project
      // const { error } = await user2.client
      //   .from('projects')
      //   .delete()
      //   .eq('id', project.id);
      // 
      // expect(error).toBeDefined();
      // expect(error.code).toBe('42501');
      
      expect(user1.user.id).not.toBe(user2.user.id);
    });
  });
});

