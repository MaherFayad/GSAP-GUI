import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Admin client - bypasses RLS, used for test setup/teardown
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client - respects RLS, used for testing as a regular user
const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
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
  afterEach(async () => {
    // Clean up all test users created during the test
    for (const userId of testUserIds) {
      try {
        await adminClient.auth.admin.deleteUser(userId);
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
      // TODO: Add your RLS tests here
      // Example:
      // const { data, error } = await anonClient.from('projects').select('*');
      // expect(error).toBeDefined();
    });

    it('should allow authenticated users to access their own data', async () => {
      // TODO: Add your RLS tests here
      // Example:
      // const testUser = await createTestUser();
      // const { data, error } = await testUser.client.from('projects').select('*');
      // expect(error).toBeNull();
    });

    it('should prevent users from accessing other users data', async () => {
      // TODO: Add your RLS tests here
      // Example:
      // const user1 = await createTestUser();
      // const user2 = await createTestUser();
      // 
      // // User1 creates a project
      // const { data: project } = await user1.client.from('projects').insert({...}).select().single();
      // 
      // // User2 tries to access User1's project
      // const { data, error } = await user2.client.from('projects').select('*').eq('id', project.id);
      // expect(data).toHaveLength(0);
    });
  });
});

