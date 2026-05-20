# Zero-Knowledge MCP

The Zero-Knowledge MCP (Model Context Protocol) Server allows AI assistants (like Claude Desktop or Cursor) to execute tools that communicate with external APIs **without ever exposing the API credentials to the AI agent or its context**.

## The Problem with Current MCP Servers

Most MCP servers configure their credentials via environment variables within the configuration file itself:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_actual_token_here"
      }
    }
  }
}
```

When configured this way, the credential value is present in the configuration file, injected into process memory, and completely accessible to the AI model. A prompt injection attack or a compromised tool dependency could easily exfiltrate this key.

## The Zero-Knowledge Approach

By routing requests through the AgentSecrets local proxy, the MCP server itself becomes completely credentialless.

```json
{
  "mcpServers": {
    "zero-knowledge-mcp": {
      "command": "python",
      "args": ["/absolute/path/to/zero-knowledge-mcp/server.py"]
    }
  }
}
```

Notice the complete absence of an `env` block. The agent passes only a **key name** (e.g., `GITHUB_TOKEN`). The local AgentSecrets proxy resolves the actual value from the OS keychain and injects it at the transport layer before the request reaches GitHub.

## Getting Started

:::step
1. **Install AgentSecrets** and log in:
   ```bash
   agentsecrets init
   ```
2. **Clone the ZK MCP repository**:
   ```bash
   git clone https://github.com/The-17/zero-knowledge-mcp
   cd zero-knowledge-mcp
   make install
   ```
3. **Store your credentials**:
   ```bash
   agentsecrets secrets set GITHUB_TOKEN=ghp_your_token
   ```
4. **Allowlist the target domains**:
   ```bash
   agentsecrets workspace allowlist add api.github.com
   ```
5. **Start the Proxy**:
   ```bash
   agentsecrets proxy start
   ```
:::

You can now use Claude or Cursor to securely query GitHub without exposing your token to the LLM.

## Building Custom Tools

Creating a zero-knowledge tool is as simple as defining the tool using the AgentSecrets Python SDK:

```python
from agentsecrets import AgentSecrets

client = AgentSecrets()

async def fetch_github_repos():
    # The actual token is injected by the proxy. 
    # Your code only uses the reference key.
    response = await client.async_call(
        "https://api.github.com/user/repos",
        bearer="GITHUB_TOKEN"
    )
    return response.json()
```

> [TIP]
> For a full tutorial, check out the [Zero-Knowledge MCP Repository](https://github.com/The-17/zero-knowledge-mcp).
