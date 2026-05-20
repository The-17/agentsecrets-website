# Building a Zero-Knowledge MCP Server

The Model Context Protocol (MCP) is an open standard that allows LLMs (like Claude Desktop or Cursor) to execute tools on your local machine. However, standard MCP setups pose a significant security risk: they require API credentials to be written in plaintext inside JSON configuration files or passed directly in process memory where the LLM can extract them.

By combining MCP with AgentSecrets, you can build **Zero-Knowledge MCP Servers** where credentials never enter the LLM's context, the configuration files, or even the memory of the MCP process.

---

## What zero-knowledge MCP means

In a traditional MCP server setup, the configuration file looks like this:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-stripe"],
      "env": {
        "STRIPE_API_KEY": "sk_live_plaintext_api_key_exposed_here"
      }
    }
  }
}
```

This exposes your API key to:
- The configuration file on disk.
- The process environment variable space of the MCP server.
- The LLM itself, which can read the environment variables or command args if it gets compromised or hijacked.

In a **Zero-Knowledge MCP** architecture:
- No environment variables are defined in the MCP config.
- The LLM only passes the **key reference name** (e.g., `"STRIPE_KEY"`) as a tool argument.
- The MCP server uses the AgentSecrets SDK to send requests to the local proxy daemon.
- The proxy daemon resolves and injects the credential value at the transport layer.
- The LLM receives only the clean API response (e.g., Stripe's JSON response), never the credential value itself.

---

## Using the ZK MCP Template

We provide a starter template using FastMCP and Python to help you build and deploy zero-knowledge tools in seconds.

### 1. Clone the template repository
:::step
```bash
git clone https://github.com/The-17/zero-knowledge-mcp
cd zero-knowledge-mcp
```
:::

### 2. Install dependencies
:::step
The template uses `uv` for lightning-fast Python dependency management. Run:

```bash
make install
# Or manually install with uv:
uv sync
```
:::

### 3. Store credentials and allowlist the target API
:::step
Before running the server, save your credentials in your local OS Keychain and authorize the target domain:

```bash
# Store the Stripe key locally
agentsecrets secrets set STRIPE_KEY=sk_live_...

# Authorize the proxy to make calls to api.stripe.com
agentsecrets workspace allowlist add api.stripe.com
```
:::

---

## Scaffold walkthrough

The cloned project directory contains the following core files:

```text
zero-knowledge-mcp/
├── pyproject.toml        # Python package definitions
├── Makefile              # Helper scripts for installation
├── src/
│   └── server.py         # FastMCP Server containing tool definitions
└── README.md             # Integration instructions
```

---

## Wiring AgentSecrets into your MCP server

Here is how to write a zero-knowledge tool inside `src/server.py` using `mcp.server.fastmcp` and the `agentsecrets` SDK:

```python
from mcp.server.fastmcp import FastMCP
from agentsecrets import AgentSecrets, AgentSecretsError

# Initialize FastMCP Server
mcp = FastMCP("stripe-zero-knowledge")

# Initialize the AgentSecrets client
client = AgentSecrets()

@mcp.tool()
async def get_stripe_balance(key_name: str = "STRIPE_KEY") -> str:
    """
    Fetch Stripe balance without exposing the API key to the LLM.
    
    Args:
        key_name (str): The reference name of the Stripe credential stored in the keychain.
    """
    try:
        # Route the request through the local proxy. 
        # The key name "STRIPE_KEY" is resolved and injected dynamically.
        response = client.call(
            "https://api.stripe.com/v1/balance",
            bearer=key_name
        )
        
        # Return only the body of the response to the LLM
        return response.body
        
    except AgentSecretsError as e:
        return f"Error resolving credential or executing call: {str(e)}"

if __name__ == "__main__":
    mcp.run()
```

Notice that the tool definition takes `key_name` as a string parameter. The LLM can see this parameter and can change it if needed (e.g. to `STRIPE_KEY_STAGING`), but the LLM is physically incapable of extracting the key value because the Python code itself never has access to it.

---

## Ensuring no credential values enter any config file

Configure Claude Desktop or Cursor to load the zero-knowledge MCP server by editing your configuration file:

- **macOS Claude Desktop Config**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows Claude Desktop Config**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the server definition using `uv` to execute the Python script:

```json
{
  "mcpServers": {
    "stripe-zk-mcp": {
      "command": "uv",
      "args": [
        "run",
        "--path",
        "/absolute/path/to/zero-knowledge-mcp/src/server.py"
      ]
    }
  }
}
```

> [IMPORTANT]
> Ensure `/absolute/path/to/...` is replaced with the true absolute path to your `server.py` file. There is no `env` block in this configuration. The environment remains clean and secure.

---

## Publishing your MCP server

Because Zero-Knowledge MCP servers do not bundle or configure hardcoded keys, publishing them is incredibly safe:

:::step
1. **Publish to GitHub/npm/PyPI**: You can push your MCP repository to a public GitHub repository. It contains no `.env` files, no hardcoded strings, and no production credentials.
2. **Standardized Consuming**: Other developers or servers using your MCP server only need to install the package and run:
   ```bash
   agentsecrets secrets set STRIPE_KEY=their_own_stripe_key
   agentsecrets workspace allowlist add api.stripe.com
   ```
   The published MCP server will automatically hook into their local AgentSecrets proxy, keeping their keys secure on their local machines.
:::
