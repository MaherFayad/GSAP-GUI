# Supabase MCP Server Setup Guide

This guide will help you set up the Supabase Model Context Protocol (MCP) server in Cursor.

## What is MCP?

Model Context Protocol (MCP) allows AI assistants like Cursor to directly interact with external services like Supabase, providing enhanced context and capabilities for database operations, authentication, and more.

## Prerequisites

- Cursor IDE installed
- A Supabase project (create one at https://app.supabase.com)
- Node.js and npm installed

## Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Navigate to **Settings** > **API**
4. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## Step 2: Set Up Project Environment Variables

Create a `.env` file in your project root for your application code:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important:** Never commit your `.env` file to version control. It's already added to `.gitignore`.

## Step 3: Configure MCP Server in Cursor

The MCP server configuration is separate from your project's `.env` file.

### Finding the MCP Configuration File

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

### Option A: Direct Configuration (Recommended)

1. Open Cursor Settings (`Ctrl+,` or `Cmd+,`)
2. Go to **Features** > **Model Context Protocol**
3. Click **"Edit Config"** or manually open the config file above
4. Add this configuration with your **actual credentials**:

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

**Example with real values:**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "--project-url",
        "https://abcdefghijk.supabase.co",
        "--anon-key",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzY1NzQwMDAsImV4cCI6MTk1MjE1MDAwMH0.example-signature"
      ]
    }
  }
}
```

🔒 **Security Note:** The MCP config file is stored locally on your machine and is NOT part of your git repository. It's safe to put credentials here.

### Option B: Using System Environment Variables (Advanced)

If you prefer not to store credentials in the config file, set system-wide environment variables:

**Windows PowerShell (Run as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable('SUPABASE_URL', 'https://your-project.supabase.co', 'User')
[System.Environment]::SetEnvironmentVariable('SUPABASE_ANON_KEY', 'your-anon-key', 'User')
```

**Mac/Linux (Add to ~/.bashrc, ~/.zshrc, or ~/.profile):**
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

Then use this config (with environment variable references):
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "$SUPABASE_URL",
        "SUPABASE_ANON_KEY": "$SUPABASE_ANON_KEY"
      }
    }
  }
}
```

### Option C: Global Installation (Optional)

Install the MCP server globally for faster startup:

```bash
npm install -g @modelcontextprotocol/server-supabase
```

Then use this simpler configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "mcp-server-supabase",
      "args": [
        "--project-url",
        "https://your-project.supabase.co",
        "--anon-key",
        "your-anon-key-here"
      ]
    }
  }
}
```

## Step 4: Restart Cursor

**Important:** After configuring the MCP server:

1. **Close Cursor completely** (not just the window, but quit the application)
2. Reopen Cursor
3. Wait a few seconds for the MCP server to initialize

## Step 5: Verify Connection

To verify the MCP server is working:

1. Open the Command Palette:
   - Windows/Linux: `Ctrl + Shift + P`
   - Mac: `Cmd + Shift + P`
2. Type "MCP" and look for MCP-related commands
3. You should see the Supabase server listed as active

Alternatively, check the Cursor output logs:
- Go to **View** > **Output**
- Select "MCP" from the dropdown
- Look for "Supabase server started" or similar messages

## Using the Supabase Client in Code

The Supabase client is already set up in your project:

```typescript
import { supabase } from '@/utils';

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Example: Insert data
const { data, error } = await supabase
  .from('your_table')
  .insert({ column: 'value' });

// Example: Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

## Troubleshooting

### MCP Server Not Starting

- Ensure Node.js is installed and accessible from the command line
- Check that your Supabase credentials are correct
- Try using the absolute path to `npx` in the configuration

### Environment Variables Not Loading

- Make sure the `.env` file is in the project root
- Restart your development server after changing `.env`
- Verify the variable names start with `VITE_` (required by Vite)

### Connection Errors

- Verify your Supabase project is active
- Check that the project URL and anon key are correct
- Ensure you have network connectivity

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [MCP Documentation](https://modelcontextprotocol.io)
- [GSAP GUI Editor README](./README.md)

---

**Need help?** Create an issue on the project repository.

