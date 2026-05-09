# MCP / Claude Desktop

The MCP integration lets Claude Desktop and Cursor call any authenticated API through AgentSecrets. Claude passes a key name. It never sees the credential value.

## Auto-install (recommended)

```bash
agentsecrets mcp install
```

This detects your Claude Desktop or Cursor installation, writes the MCP config automatically, and confirms what was written.

```
✓ Detected Claude Desktop at ~/Library/Application Support/Claude
✓ Written to claude_desktop_config.json
✓ Restart Claude Desktop to activate
```

Restart Claude Desktop after running this.

## What gets written

```json
{
  "mcpServers": {
    "agentsecrets": {
      "command": "/usr/local/bin/agentsecrets",
      "args": ["mcp", "serve"]
    }
  }
}
```

No `env` block. No credential values. The binary path is the only thing in the config.

## Manual config

If you prefer to edit `claude_desktop_config.json` yourself:

```json
{
  "mcpServers": {
    "agentsecrets": {
      "command": "/usr/local/bin/agentsecrets",
      "args": ["mcp", "serve"]
    }
  }
}
```

Find the config file at:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

## Available MCP tools

| Tool | Description |
|---|---|
| `api_call` | Make an authenticated HTTP request. Pass key name, URL, method, and optional body. Returns the API response. The value is never passed. |
| `list_keys` | List available key names in the current project and environment. Names only, never values. |
| `check_status` | Returns current workspace, project, environment, proxy status, and last sync time. |

There is no `get_secret` tool. There is no way for Claude to retrieve a credential value through this integration. `list_keys` returns names. `api_call` performs injection. Those are the only credential-related operations available.

## Using AgentSecrets with Claude

Once the MCP server is active, Claude can make authenticated API calls by name:

```
You: Check my Stripe balance
Claude: [calls api_call with bearer="STRIPE_KEY", url="https://api.stripe.com/v1/balance"]
Claude: Your current balance is $4,200.00 available.
```

Claude saw the balance. It never saw `sk_live_51H...`.
