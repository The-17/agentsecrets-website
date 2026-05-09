# agentsecrets env

`agentsecrets env` wraps any process and injects secrets as environment variables into the child process at spawn time. The parent process never sees the values. When the child process exits, the values are gone.

```bash
agentsecrets env -- stripe mcp
agentsecrets env -- node server.js
agentsecrets env -- python manage.py runserver
agentsecrets env -- npm run dev
agentsecrets env -- celery -A myapp worker
agentsecrets env -- pytest
```

## When to use this

Use `agentsecrets env` for tools and SDKs that read from environment variables rather than making direct HTTP calls — the Stripe CLI, Django's database configuration, Redis clients, any tool that reads `os.environ` at startup.

For AI agents and HTTP-based workflows, prefer `agentsecrets call` or the SDK's `client.call()` because they provide the full zero-knowledge guarantee. With `agentsecrets env`, the credential value exists in the child process environment for the duration of the process. It does not exist in the parent process, it is not written to disk, and it is not accessible to other processes — but the subprocess does hold the value. This is significantly safer than a shared `.env` file and eliminates the risk of an AI agent finding credentials on disk, but it is a different guarantee from transport-layer injection.

## Using with Claude Desktop MCP configs

For MCP servers that read credentials from environment variables:

```json
{
  "mcpServers": {
    "stripe": {
      "command": "agentsecrets",
      "args": ["env", "--", "stripe", "mcp"]
    }
  }
}
```

No `env` block in the config. No plaintext token in `claude_desktop_config.json`.
