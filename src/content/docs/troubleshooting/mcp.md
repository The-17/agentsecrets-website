---
title: Troubleshooting MCP Integration
description: Learn how to resolve common issues with the AgentSecrets Model Context Protocol (MCP) server for Claude and Cursor.
---

# Troubleshooting MCP Integration

AgentSecrets provides a native [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server, enabling AI assistants like Claude Desktop and Cursor to make authenticated API calls securely without accessing raw credentials.

## MCP Server Not Installing

When running `agentsecrets mcp install`, the CLI modifies your local MCP configuration file (e.g., `claude_desktop_config.json`). If this fails:

:::step
1. **Unsupported AI Assistant:** Ensure you are using a supported AI assistant that reads standard MCP config paths.
2. **File Permissions:** Check if the CLI has write access to your AI assistant's configuration directory.
3. **Manual Installation:** You can manually add the AgentSecrets MCP server to your config file:
   ```json
   "mcpServers": {
     "agentsecrets": {
       "command": "agentsecrets",
       "args": ["mcp", "serve"]
     }
   }
   ```
:::

## Agent Can't See the Tools

Once installed, the AgentSecrets MCP server exposes two primary tools to the AI:
- `list_secrets`: Allows the agent to see which keys are available (names only, no values).
- `api_call`: Routes requests through the zero-knowledge proxy engine.

If the agent claims it doesn't have these tools:
:::step
1. Completely restart your AI assistant (e.g., quit and reopen Claude Desktop).
2. Ensure the `agentsecrets` binary is in your system's `$PATH` so the AI assistant can execute the `"command": "agentsecrets"` instruction.
:::

## "api_call" Tool Failing

If the agent uses `api_call` but receives an error:

- **Domain Blocked:** The agent attempted to contact a domain not in your workspace allowlist. You must add it: `agentsecrets workspace allowlist add <domain>`.
- **Invalid Secret Name:** The agent tried to inject a secret that doesn't exist. Tell the agent to use the `list_secrets` tool to verify available key names first.

> [TIP]
> Every MCP call uses the exact same internal proxy engine as the HTTP proxy. You can debug MCP requests by viewing the proxy audit logs:
> ```bash
> agentsecrets proxy logs --last 5
> ```
> Look for entries where `"agent_id": "mcp"`.

## Redacted Responses

If an external API echoes back the injected credential in its response body, the AgentSecrets MCP server automatically replaces the value with `[REDACTED_BY_AGENTSECRETS]` before the response reaches the agent. This is a deliberate security feature to prevent secret leakage via adversarial API responses.
