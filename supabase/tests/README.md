# Supabase Integration Tests

This directory contains integration tests for testing Row Level Security (RLS) policies and other Supabase functionality.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Test Environment

Create a `.env.test` file in the project root (copy from `.env.test.example`):

```bash
cp .env.test.example .env.test
```

Edit `.env.test` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ IMPORTANT:** 
- The `SERVICE_ROLE_KEY` bypasses all RLS policies and should **NEVER** be used in client-side code
- This key should **NEVER** be committed to version control
- Only use it in server-side code or tests
- Get it from: Supabase Dashboard → Settings → API → `service_role` key (secret)

### 3. Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Structure

### `rls.test.ts`

Contains integration tests for Row Level Security policies.

#### Helper Functions

- **`createTestUser()`**: Creates a test user with random credentials
  - Returns an authenticated Supabase client
  - Automatically cleaned up after each test
  - Useful for testing authenticated user scenarios

#### Test Clients

- **`adminClient`**: Uses service role key, bypasses RLS
  - Used for test setup and teardown
  - Can create/delete users
  - Should never be used for actual RLS testing

- **`anonClient`**: Uses anon key, respects RLS
  - Used for testing anonymous user access
  - Tests that RLS policies are working correctly

## Writing Tests

### Example: Test RLS Policy

```typescript
it('should allow users to read their own projects', async () => {
  // Create a test user
  const testUser = await createTestUser();

  // Create a project as this user
  const { data: project, error: insertError } = await testUser.client
    .from('projects')
    .insert({ name: 'My Project', data: {} })
    .select()
    .single();

  expect(insertError).toBeNull();
  expect(project).toBeDefined();

  // Verify the user can read their own project
  const { data: projects, error: selectError } = await testUser.client
    .from('projects')
    .select('*')
    .eq('id', project.id);

  expect(selectError).toBeNull();
  expect(projects).toHaveLength(1);
  expect(projects[0].id).toBe(project.id);
});
```

### Example: Test Cross-User Access

```typescript
it('should prevent users from accessing other users projects', async () => {
  // Create two test users
  const user1 = await createTestUser();
  const user2 = await createTestUser();

  // User 1 creates a project
  const { data: project } = await user1.client
    .from('projects')
    .insert({ name: 'User 1 Project', data: {} })
    .select()
    .single();

  // User 2 tries to access User 1's project
  const { data: projects } = await user2.client
    .from('projects')
    .select('*')
    .eq('id', project.id);

  // Should return empty array (no access)
  expect(projects).toHaveLength(0);
});
```

## Cleanup

Test users are automatically cleaned up after each test via the `afterEach` hook. No manual cleanup is required.

## Troubleshooting

### "Missing required Supabase environment variables"

Make sure your `.env.test` file exists and contains all three required variables.

### "Failed to create test user"

Check that your service role key is correct and that your Supabase project is running.

### Tests are slow

Integration tests interact with a real Supabase instance, so they may be slower than unit tests. Consider:
- Running tests in parallel where possible
- Using test database branches (if available)
- Mocking Supabase calls for unit tests

