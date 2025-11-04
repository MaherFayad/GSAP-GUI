# Testing Setup Complete ✅

## What Was Created

### 1. Test Infrastructure

#### `supabase/tests/rls.test.ts`
The main integration test file with:
- **Admin Client**: Uses service role key, bypasses RLS for test setup/teardown
- **Anon Client**: Uses public anon key, respects RLS for testing
- **`createTestUser()` Helper**: Creates authenticated test users with random credentials
- **Automatic Cleanup**: `afterEach` hook deletes test users automatically
- **Example Tests**: Authentication and RLS policy test templates

### 2. Configuration Files

#### `vitest.config.ts`
- Vitest configuration with React support
- Node test environment
- Path aliases configured
- Include/exclude patterns set

#### `package.json` (Updated)
Added test scripts:
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:run": "vitest run"
}
```

Added dependencies:
- `vitest`: ^2.1.8
- `@vitest/ui`: ^2.1.8

### 3. Environment Setup

#### `env.test.template`
Template file for test environment variables with:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

#### `.gitignore` (Updated)
Added `.env.test` to prevent committing sensitive test credentials

### 4. Documentation

#### `supabase/tests/README.md`
Comprehensive testing guide with:
- Setup instructions
- Test structure explanation
- Example test patterns
- Troubleshooting tips

#### `README.md` (Updated)
Added Testing section in Quick Start with commands and setup steps

## How to Use

### Step 1: Install Dependencies

```bash
npm install
```

This will install Vitest and related testing packages.

### Step 2: Configure Test Environment

```bash
# Copy the template
cp env.test.template .env.test
```

Edit `.env.test` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `VITE_SUPABASE_SERVICE_ROLE_KEY`

⚠️ **NEVER commit the service role key to version control!**

### Step 3: Run Tests

```bash
# Watch mode (recommended for development)
npm test

# Run once (for CI/CD)
npm run test:run

# With UI (interactive)
npm run test:ui
```

## Writing Your First Test

Open `supabase/tests/rls.test.ts` and replace the TODO comments with actual tests:

```typescript
describe('Projects RLS', () => {
  it('should allow users to create projects', async () => {
    const testUser = await createTestUser();

    const { data, error } = await testUser.client
      .from('projects')
      .insert({ name: 'Test Project', data: {} })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe('Test Project');
  });

  it('should prevent users from deleting other users projects', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    // User 1 creates a project
    const { data: project } = await user1.client
      .from('projects')
      .insert({ name: 'User 1 Project', data: {} })
      .select()
      .single();

    // User 2 tries to delete User 1's project
    const { error } = await user2.client
      .from('projects')
      .delete()
      .eq('id', project.id);

    expect(error).toBeDefined();
    expect(error.code).toBe('42501'); // PostgreSQL permission denied
  });
});
```

## Test Helpers

### `createTestUser()`

Creates a fully authenticated test user:

```typescript
const testUser = await createTestUser();
// testUser.client - authenticated Supabase client
// testUser.user - user object with id, email, etc.
// testUser.session - session with access_token
```

**Auto-cleanup**: Users are automatically deleted after each test.

### `adminClient`

Bypasses all RLS policies (use sparingly, only for setup/teardown):

```typescript
// Create test data as admin
await adminClient.from('projects').insert({
  id: 'test-id',
  user_id: testUser.user.id,
  name: 'Test Project'
});
```

### `anonClient`

Tests anonymous (unauthenticated) access:

```typescript
// Should fail if RLS is configured correctly
const { data, error } = await anonClient.from('projects').select('*');
expect(error).toBeDefined();
```

## Best Practices

1. **Test RLS Policies**: Ensure users can only access their own data
2. **Test Cross-User Access**: Verify users can't access other users' data
3. **Test Anonymous Access**: Ensure unauthenticated requests are blocked
4. **Use Descriptive Names**: Make test names clear and specific
5. **Keep Tests Isolated**: Each test should be independent
6. **Clean Up**: Let `afterEach` handle cleanup automatically

## Troubleshooting

### Tests Hang or Timeout

Make sure your `.env.test` file exists and has valid credentials.

### "Permission Denied" Errors

Check that your service role key is correct. This key should bypass all RLS.

### Tests Pass Locally But Fail in CI

Ensure your CI environment has access to `.env.test` (use secrets/environment variables).

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env.test` with your Supabase credentials
3. ✅ Run tests: `npm test`
4. ✅ Write tests for your RLS policies
5. ✅ Add tests to your CI/CD pipeline

## Learn More

- [Vitest Documentation](https://vitest.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/database/testing)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- See `supabase/tests/README.md` for more examples

---

**Happy Testing! 🧪**

