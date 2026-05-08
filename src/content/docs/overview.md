# Overview

AgentSecrets is zero-knowledge secrets management and credential infrastructure for the AI era. It covers the full credentials lifecycle for AI agents and AI-assisted development workflows — storing secrets, syncing across environments and teams, detecting drift, switching environments, making authenticated API calls, auditing every call — without a credential value ever entering agent context.

> The core guarantee: the credential value is never passed to, logged by, or accessible to the AI agent at any point in the call lifecycle. Not as an argument. Not in the response. Not in the audit log.

## Why AgentSecrets Exists

Every secrets tool built before the agentic era was designed around a reasonable assumption: the application retrieving credentials is trusted. Store the credential securely, retrieve it at runtime, and use it. That model worked because applications do exactly what their code says.

AI agents are different. A coding assistant reading your codebase can also read your `.env` file. An agent deployed into production processes untrusted content and can be redirected by instructions embedded in that content. The moment a credential value exists anywhere in the agent's context — in memory, in a file it can access, in an environment it can read — it is reachable by prompt injection, malicious plugins, and LLM traces.

AgentSecrets removes the value from that space entirely. The agent passes a key name, the proxy resolves the real value from the OS keychain and injects it at the transport layer, then the agent receives the API response. The value existed in memory for the milliseconds required to make the call and nowhere else.

## What It Includes

**CLI**: Manages the full credentials lifecycle: secrets, environments, workspaces, projects, agent identity, audit logs, and the local proxy.

**Local proxy**: Runs at `localhost:8765`. Receives requests with injection headers, resolves values from the OS keychain, injects at the transport layer, returns only the API response.

**Zero-knowledge cloud sync**: Encrypted sync across machines and teammates. The server stores ciphertext it cannot decrypt. Your workspace key never leaves your machine.

**Environments**: Development, staging, and production as first-class concepts. One command switches the active environment. The proxy, push, pull, and diff all adjust automatically.

**Agent identity**: Three identity levels for multi-agent workflows. Every call logged against the agent that made it. Individual token revocation without touching anything else.

**Governance audit log**: Every call logged with key name, endpoint, environment, agent identity, status, and the domain allowlist state at the exact moment of execution. No value field exists in the log schema.

**Python SDK**: `pip install agentsecrets`. No `get()` method. The only operations available keep the value out of calling code.

**MCP server**: First-class integration for Claude Desktop and Cursor. One command configures it. No credential values in any config file.

**OpenClaw integration**: Native exec provider for OpenClaw's SecretRef system. Credentials resolve at execution time through the AgentSecrets binary.

**`agentsecrets env`** — wraps any process and injects secrets as environment variables at spawn time. Nothing written to disk.

## License

MIT. The CLI, proxy, Python SDK, and MCP template are free to use, fork, and modify. See the [repository](https://github.com/The-17/agentsecrets) for the full license.
