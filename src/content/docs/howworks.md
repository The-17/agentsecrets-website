# How It Works

Every AgentSecrets call flows through five stages. At no point does the secret value enter the agent's context, filesystem, or any log.

### Stage 1 — Agent request
The agent (Claude, your script, any MCP client) calls \gentsecrets call\ or \client.call()\ and passes the key name — e.g. \STRIPE_KEY\ — not the value. The proxy address is localhost:8765.

### Stage 2 — OS keychain lookup
The proxy looks up the encrypted entry in the OS keychain (macOS Keychain, Linux Secret Service, or Windows Credential Manager) and decrypts it in-process only.

### Stage 3 — Transport injection
The decrypted value is injected directly into the outbound HTTP request at the transport layer.

\\\mermaid
graph TD
    A[AI Agent] -->|Key Name| B[AgentSecrets Proxy]
    B -->|Fetch| C[OS Keychain]
    C -->|Secret Value| B
    B -->|Inject & Forward| D[API Provider]
    D -->|Response| B
    B -->|Scrub & Return| A
\\\

### Stage 4 — Domain allowlist check
Before forwarding the request, the proxy verifies the target domain is on the workspace allowlist.

### Stage 5 — Response, redaction, and audit
The API response is returned. The proxy scans it for any pattern matching the injected credential value. If found, it is replaced with \[REDACTED_BY_AGENTSECRETS]\.
