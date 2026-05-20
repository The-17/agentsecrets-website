# Using AgentSecrets with Cursor

Cursor has built-in support for MCP (Model Context Protocol) servers. By using the [Zero-Knowledge MCP](/docs/ecosystem/zk-mcp), you can allow Cursor's agent to use tools that require authenticated API access **without ever pasting your API keys into Cursor**.

## Setup Instructions

:::step
1. Ensure the AgentSecrets CLI is installed and running (`agentsecrets proxy start`).
2. Add your credentials to AgentSecrets via the CLI (`agentsecrets secrets set STRIPE_KEY=sk_test_...`).
3. Clone and install the `zero-knowledge-mcp` on your local machine.
:::

### Configuring Cursor

:::step
1. Open Cursor Settings (`Cmd/Ctrl + Shift + J`).
2. Navigate to **Features > MCP Servers**.
3. Click **Add New MCP Server**.
4. Set the name to `AgentSecrets ZK-MCP`.
5. Set the type to `command`.
6. Enter the command to start your ZK-MCP server. Because Cursor doesn't activate virtual environments automatically, you must use the absolute path to your environment's Python executable.
:::

```bash
/absolute/path/to/zero-knowledge-mcp/.venv/bin/python /absolute/path/to/zero-knowledge-mcp/server.py
```

> [NOTE]
> Do **not** add any environment variables in the Cursor settings menu. The entire point of the ZK-MCP is that the server runs without credentials in its environment.

## Verifying the Connection

Once added, Cursor should show a green dot next to the server name, indicating it has successfully connected. 

You can test it by opening the Cursor Chat or Composer and typing:
> "Can you use the tool to list my public GitHub repositories?"

Cursor will call the tool, passing the key name. The local AgentSecrets proxy will intercept the network request, attach the real token from your OS Keychain, and return the response to Cursor. Cursor receives the data, but never sees the token.
