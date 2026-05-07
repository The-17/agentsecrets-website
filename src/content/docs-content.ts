export const DOCS_CONTENT: Record<string, string> = {
  overview: `
# AgentSecrets

AgentSecrets is a zero-knowledge credential proxy for AI agents. It lets your agent call any authenticated API — Stripe, OpenAI, GitHub, Slack — without the agent ever seeing the actual secret value. The credential lives in your OS keychain and is injected at the HTTP transport layer, never entering the agent's context window, memory, or logs.

> **Core guarantee:** The key value is never passed to, logged by, or accessible to the AI agent at any point in the call lifecycle. Not as an argument. Not in the response. Not in the audit log.

The proxy runs at \`localhost:8765\`. Your code sends key names. The proxy resolves values from the OS keychain and injects them at the transport layer. Your code receives the API response. The value never crossed into your process.

Everything is open source under the MIT license. The CLI, the proxy, the SDK, and the MCP template are all free to use, fork, and self-host.
  `,

  howworks: `
# How It Works

Every AgentSecrets call flows through five stages. At no point does the secret value enter the agent's context, filesystem, or any log.

### Stage 1 — Agent request
The agent (Claude, your script, any MCP client) calls \`agentsecrets call\` or \`client.call()\` and passes the key name — e.g. \`STRIPE_KEY\` — not the value. The proxy address is localhost:8765.

### Stage 2 — OS keychain lookup
The proxy looks up the encrypted entry in the OS keychain (macOS Keychain, Linux Secret Service, or Windows Credential Manager) and decrypts it in-process only.

### Stage 3 — Transport injection
The decrypted value is injected directly into the outbound HTTP request at the transport layer.

\`\`\`mermaid
graph TD
    A[AI Agent] -->|Key Name| B[AgentSecrets Proxy]
    B -->|Fetch| C[OS Keychain]
    C -->|Secret Value| B
    B -->|Inject & Forward| D[API Provider]
    D -->|Response| B
    B -->|Scrub & Return| A
\`\`\`

### Stage 4 — Domain allowlist check
Before forwarding the request, the proxy verifies the target domain is on the workspace allowlist.

### Stage 5 — Response, redaction, and audit
The API response is returned. The proxy scans it for any pattern matching the injected credential value. If found, it is replaced with \`[REDACTED_BY_AGENTSECRETS]\`.
  `,

  keychain: `
# OS Keychain Storage

AgentSecrets stores all credentials in your operating system's native secure credential store.

| Platform | Storage Backend | Encryption |
| :--- | :--- | :--- |
| macOS | macOS Keychain | AES-256-GCM via Secure Enclave |
| Linux | libsecret / Secret Service | GNOME Keyring or KDE Wallet |
| Windows | Credential Manager | DPAPI (user-scoped) |

> Keychain entries are scoped to your user account and cannot be read by other processes without your authentication.
  `,

  quickstart: `
# Getting Started

Install AgentSecrets, store your first secret, and make your first zero-knowledge API call.

### 1. Install the CLI
The CLI manages your credentials, runs the local proxy, and handles workspace and project context.

\`\`\`bash
$ brew install The-17/tap/agentsecrets

# Also available via:
$ npm install -g @the-17/agentsecrets
$ pip install agentsecrets-cli
$ go install github.com/The-17/agentsecrets/cmd/agentsecrets@latest

$ agentsecrets --version
\`\`\`

### 2. Initialize
Creates your account, generates your encryption keys locally, and sets up your first workspace.
\`\`\`bash
$ agentsecrets init
\`\`\`

### 3. Create a project
Projects partition your secrets within a workspace.
\`\`\`bash
$ agentsecrets project create my-agent
$ agentsecrets project use my-agent
\`\`\`

### 4. Store your credentials
The value goes directly to the OS keychain.
\`\`\`bash
$ agentsecrets secrets set STRIPE_KEY=sk_live_...
$ agentsecrets secrets set OPENAI_KEY=sk-proj-...
\`\`\`

### 5. Authorize your domains
Every domain your agent calls must be explicitly authorized.
\`\`\`bash
$ agentsecrets workspace allowlist add api.stripe.com
$ agentsecrets workspace allowlist add api.openai.com
\`\`\`

### 6. Start the proxy
The proxy runs on \`localhost:8765\`.
\`\`\`bash
$ agentsecrets proxy start
\`\`\`

### 7. Make your first call
The proxy resolves the key from the OS keychain and injects it at the transport layer.
\`\`\`bash
$ agentsecrets call \\
    --url https://api.stripe.com/v1/balance \\
    --bearer STRIPE_KEY
\`\`\`
  `,

  zerok: `
# Zero-Knowledge Design

The cloud sync feature lets you share credentials across machines and teammates. It is designed so the server structurally cannot decrypt your secrets.

### Encryption scheme
Before any secret leaves your machine, it is encrypted using X25519 key exchange, AES-256-GCM, and Argon2id.

| Layer | Implementation |
| :--- | :--- |
| Key exchange | X25519 (NaCl SealedBox) |
| Secret encryption | AES-256-GCM |
| Key derivation | Argon2id |
| Key storage | OS keychain |

### What the server sees
The server stores only ciphertext blobs.

\`\`\`json
{
  "id": "entry_9xKp",
  "project": "my-agent",
  "key_name": "STRIPE_KEY",
  "ciphertext": "gAAAAABl7...EncryptedBlob...",
  "nonce": "Zx9k...",
  "tag": "aB3c..."
}
\`\`\`

> **Policy vs. structure:** A structural guarantee says the log struct has no value field. The system cannot log a credential value regardless of configuration or intent.
  `,

  allowlist: `
# Domain Allowlist

The proxy is deny-by-default. Before injecting any credential, the proxy checks the target domain against the workspace allowlist.

### What this closes
* **SSRF:** If an attacker tricks your app into calling their server, the proxy blocks it.
* **Prompt Injection:** If a malicious response tries to exfiltrate keys, the proxy blocks the outbound request.

### Managing the allowlist
\`\`\`bash
$ agentsecrets workspace allowlist add api.stripe.com
$ agentsecrets workspace allowlist list
\`\`\`
  `,

  redaction: `
# Response Body Redaction

The proxy scans every API response for patterns matching the injected credential value. If found, it replaces it with \`[REDACTED_BY_AGENTSECRETS]\`.

This defends against **credential echo exfiltration** — an attack where a compromised API reflects the credential back in its response.

> The redaction event is logged as \`credential_echo\` in the audit log. The value itself is never logged.
  `,

  mcp: `
# MCP / Claude Desktop

The Model Context Protocol (MCP) server is the primary way to use AgentSecrets with Claude Desktop and other MCP clients.

### Installation
\`\`\`bash
$ agentsecrets mcp install
\`\`\`

### Manual Config
If you prefer to edit your \`claude_desktop_config.json\` manually:

\`\`\`json
{
  "mcpServers": {
    "agentsecrets": {
      "command": "agentsecrets",
      "args": ["mcp", "start"]
    }
  }
}
\`\`\`

### Capabilities
The MCP server provides the following tools to Claude:
- \`agentsecrets_call\`: Makes a zero-knowledge HTTP call.
- \`agentsecrets_status\`: Checks the proxy and keychain state.
- \`agentsecrets_allowlist_status\`: Checks if a domain is authorized.
  `,

  "proxy-int": `
# HTTP Proxy Integration

You can use AgentSecrets as a standard HTTP/HTTPS proxy. This is compatible with any language or tool that supports \`HTTPS_PROXY\`.

### Usage
\`\`\`bash
$ export HTTPS_PROXY=http://localhost:8765
$ curl https://api.stripe.com/v1/balance \\
    -H "Authorization: Bearer STRIPE_KEY"
\`\`\`

### How it resolves
The proxy intercepts the request, identifies the \`STRIPE_KEY\` placeholder, resolves the actual value from the OS keychain, and forwards the request to Stripe.
  `,

  "sdk-int": `
# Python SDK

The Python SDK provides a clean, typed interface for making zero-knowledge calls from your agentic workflows.

### Installation
\`\`\`bash
$ pip install agentsecrets
\`\`\`

### Usage
\`\`\`python
from agentsecrets import Client

client = Client()

# The key name is passed, not the value.
# The SDK handles the localhost:8765 proxy handshake.
response = client.call(
    url="https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)

print(response.json())
\`\`\`
  `,

  "env-int": `
# agentsecrets env

The \`env\` command lets you run any process with secrets injected directly into its environment variables from the OS keychain.

### Usage
\`\`\`bash
$ agentsecrets env run -- npm start
\`\`\`

> **Note:** Use this only for legacy applications. For maximum security, use the \`proxy\` or \`mcp\` methods which never expose secrets to the process environment.
  `,

  "openclaw-i": `
# OpenClaw Integration

AgentSecrets is the default credential provider for **OpenClaw**, the open-source CLI for Claude.

### Setup
In your \`openclaw.toml\`:
\`\`\`toml
[credentials]
provider = "agentsecrets"
\`\`\`

Now, when you use tools in OpenClaw, it automatically routes credential lookups through your local AgentSecrets proxy.
  `,

  "cli-full": `
# CLI Reference

| Command | Description |
| :--- | :--- |
| \`init\` | Initialize account and local keys |
| \`proxy start\` | Start the local zero-knowledge proxy |
| \`secrets set\` | Store a secret in the OS keychain |
| \`secrets push\` | Sync encrypted secrets to the cloud |
| \`mcp install\` | Install the MCP server for Claude |
| \`status\` | Check system and keychain health |
  `,

  "sdk-ref": `
# SDK Reference

### \`Client\`
The main entry point for the SDK.

- \`call(url, method="GET", bearer=None, headers=None, body=None)\`
- \`status()\`
- \`get_allowlist()\`
  `,
};
