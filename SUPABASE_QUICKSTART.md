# Supabase Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Get Credentials from Supabase

```
🌐 https://app.supabase.com
   ↓
📁 Your Project
   ↓
⚙️  Settings > API
   ↓
📋 Copy these two values:
```

- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIs...` (very long string)

### 2. Create `.env` File

Create a file named `.env` in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key-here
```

### 3. Configure MCP in Cursor

#### Find the MCP Config File:

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Mac:**
```
~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

#### Add This Configuration:

Open the file above and paste:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "--project-url",
        "https://your-actual-project-id.supabase.co",
        "--anon-key",
        "your-actual-anon-key-here"
      ]
    }
  }
}
```

**Important:** Replace `your-actual-project-id.supabase.co` and `your-actual-anon-key-here` with your real values from Step 1.

### 4. Restart Cursor

1. **Quit Cursor completely** (File > Exit or Cmd/Ctrl+Q)
2. Reopen Cursor
3. Done! ✅

---

## 💻 Using Supabase in Your Code

The Supabase client is already configured. Just import and use:

```typescript
import { supabase } from './utils';

// Query data
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('your_table')
  .insert({ name: 'John', email: 'john@example.com' });

// Update data
const { data, error } = await supabase
  .from('your_table')
  .update({ name: 'Jane' })
  .eq('id', 1);

// Delete data
const { data, error } = await supabase
  .from('your_table')
  .delete()
  .eq('id', 1);

// Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123'
});
```

---

## 🔍 Verify Setup

### Check if `.env` is working:

```bash
# Start dev server
npm run dev

# If you see errors about missing Supabase URL/key, check your .env file
```

### Check if MCP is working:

1. In Cursor, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "MCP"
3. You should see MCP-related commands
4. Check **View** > **Output** > Select "MCP" from dropdown
5. Look for "Supabase server started" message

---

## ❓ Troubleshooting

### Error: "Missing Supabase environment variables"

- Check that `.env` file exists in project root
- Check that variables start with `VITE_`
- Restart your dev server

### MCP Server Not Starting

- Verify your credentials are correct (no typos)
- Make sure you copied the full anon key (it's very long)
- Check that Node.js is installed: `node --version`
- Try closing Cursor completely and reopening

### Still Having Issues?

See the detailed guide: [MCP_SETUP.md](./MCP_SETUP.md)

---

## 📚 Next Steps

- [Supabase Documentation](https://supabase.com/docs)
- [GSAP GUI Editor README](./README.md)
- [Supabase JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)

---

**Need help?** Create an issue on the GitHub repository.






