# AgentSecrets

AgentSecrets is a zero-knowledge credential proxy for AI agents. It lets your agent call any authenticated API — Stripe, OpenAI, GitHub, Slack — without the agent ever seeing the actual secret value. The credential lives in your OS keychain and is injected at the HTTP transport layer, never entering the agent's context window, memory, or logs.

> **Core guarantee:** The key value is never passed to, logged by, or accessible to the AI agent at any point in the call lifecycle. Not as an argument. Not in the response. Not in the audit log.

The proxy runs at \`localhost:8765\`. Your code sends key names. The proxy resolves values from the OS keychain and injects them at the transport layer. Your code receives the API response. The value never crossed into your process.

Everything is open source under the MIT license. The CLI, the proxy, the SDK, and the MCP template are all free to use, fork, and self-host.
