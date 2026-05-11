# Overview

AgentSecrets is zero-knowledge secrets management and credential infrastructure for the AI era. It covers the full credentials lifecycle for AI agents and AI-assisted development workflows — storing secrets, syncing across environments and teams, detecting drift, switching environments, making authenticated API calls, auditing every call — without a credential value ever entering agent context.

> The core guarantee: the credential value is never passed to, logged by, or accessible to the AI agent at any point in the call lifecycle. Not as an argument. Not in the response. Not in the audit log.


## The problem AgentSecrets solves

Every secrets tool built before the agentic era was designed around a reasonable assumption: the application retrieving credentials is trusted. Store the credential securely, retrieve it at runtime, and use it. That model worked because applications do exactly what their code says.

AI agents are different. A coding assistant reading your codebase can also read your `.env` file. An agent deployed into production processes untrusted content and can be redirected by instructions embedded in that content — prompt injection. The moment a credential value exists anywhere in the agent's context, whether in memory, in a file it can read, or in an environment variable it can access, it is reachable.

AgentSecrets removes the value from that space entirely. The agent passes a key name. The proxy resolves the real value from the OS keychain and injects it at the transport layer. The agent receives the API response. The value existed in memory for the milliseconds required to make the HTTP request and nowhere else.

## How it fits into your stack

AgentSecrets sits between your AI agent and the APIs it calls. It does not replace your existing secrets manager for your application code — it is purpose-built for the agent credential problem specifically.

```
Your AI Agent
     │
     │  passes key name only
     ▼
AgentSecrets Proxy (localhost:8765)
     │
     │  resolves value from OS keychain
     │  injects at transport layer
     ▼
External API (Stripe, OpenAI, etc.)
     │
     │  returns API response only
     ▼
Your AI Agent receives the response
     (never the credential value)
```

The proxy is local. The credential never leaves your machine as plaintext. The agent receives the API response and nothing else.

## License

MIT. The CLI, proxy, Python SDK, and MCP template are free to use, fork, and modify. See the [repository](https://github.com/The-17/agentsecrets) for the full license.
