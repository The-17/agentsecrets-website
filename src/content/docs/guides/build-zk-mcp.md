# Publishing a Zero-Knowledge MCP

If you have built a Model Context Protocol (MCP) server that connects to a sensitive API, you should publish it as a Zero-Knowledge server so your users don't have to paste API keys into their IDE configs.

## Step 1: Remove your config schema
:::step

Your MCP server should not define environment variables or arguments for credentials in its configuration block. 

Instead, document which key names the user should set in their AgentSecrets CLI.
:::

## Step 2: Use the AgentSecrets SDK
:::step

In your Python MCP server, initialize the AgentSecrets client:

```python
from agentsecrets import AgentSecrets
client = AgentSecrets()
```

Instead of using `httpx` or `requests` manually with `os.getenv`, route your requests through the client:

```python
response = await client.async_call(
    "https://api.your-service.com/data",
    bearer="YOUR_SERVICE_KEY"
)
```
:::

## Step 3: Document the Setup
:::step

In your repository's README, instruct users to:
1. Install `agentsecrets`
2. Run `agentsecrets secrets set YOUR_SERVICE_KEY=value`
3. Add your domain to the allowlist: `agentsecrets workspace allowlist add api.your-service.com`
4. Configure Claude/Cursor to run your script directly, without an `env` block.
:::
