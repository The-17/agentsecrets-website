# Security FAQ

Frequently asked questions about the AgentSecrets cryptographic model, threat resistance, and runtime architecture.

## What if the proxy process itself is compromised?

If an attacker gains local code execution and compromises the running local proxy daemon, they can access any credential currently loaded in the proxy's memory or retrieve keys from the local OS Keychain (assuming the proxy process has permission). 

However, because the proxy runs on the local loopback address (`localhost:8765`), compromising it requires local shell access on your host machine. The proxy does not listen to external network interfaces, meaning it cannot be compromised remotely unless the attacker has already breached your machine or has hijacked the AI agent to exploit an SSRF vulnerability (which is protected by Layer 1's domain allowlist).

## What if someone steals my session token?

CLI session tokens generated via `agentsecrets login` are used solely to push and pull encrypted ciphertext blobs to and from the cloud synchronization server. 

If an attacker steals your session token, they can download your encrypted project files. However, **they cannot decrypt them**. Decryption requires the symmetric Workspace Master Key, which is generated locally and stored exclusively in your secure OS Keychain. It is never uploaded to the cloud sync servers.

## Why is the OS keychain better than an environment variable?

Environment variables (like those in `.env` files) are globally accessible to any process spawned within that shell environment. They are written to memory in plaintext, printed in process logs, and can be read by any dependency, script, or AI tool running in your workspace.

By contrast, the OS Keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) encrypts secrets at rest using the operating system's hardware-backed cryptographic modules. Applications must be explicitly authorized to query it, and values are only read on demand, rather than being loaded permanently into the shell's env block.

## What if a malicious tool makes its own network calls, bypassing the proxy?

If a compromised library or prompt-injected agent attempts to bypass the local proxy by making direct HTTP calls to an external server (e.g., using python's `urllib` directly instead of the configured client), the call will go through, but **it will not have the API keys**. 

Because the real API keys do not exist in the agent's environment or code variables, the agent's bypass call will lack authentication headers and will fail at the destination server. The agent must use the proxy to get the keys injected; there is no other way to authenticate.

## Can the AgentSecrets server read my secrets?

**No.** AgentSecrets uses End-to-End Encryption (E2EE) powered by AES-256-GCM. 

When you push secrets:
:::step
1. The CLI encrypts the secrets locally using your Workspace Master Key.
2. The ciphertext is sent to the server.
3. The server stores only the encrypted bytes.
:::

Because the Workspace Master Key is never shared with the server, the server has no technical means of decrypting your secrets.

## What happens if cloud sync is unavailable?

The proxy resolves credentials from your local machine's keychain. If the AgentSecrets cloud sync server is down, you cannot push or pull updates, but **the local proxy will continue to work perfectly offline**.

## Is zero-knowledge a marketing term or a technical guarantee?

It is a **technical guarantee**. Every cryptographic operation (encryption, decryption, key derivation) occurs entirely client-side inside the compiled CLI binary. The server acts strictly as a mailbox for ciphertext blobs and encrypted team key shares. 

You can audit this behavior by inspecting the open-source CLI codebase or tracing your machine's outbound network traffic.

## Has AgentSecrets been independently audited?

AgentSecrets is currently undergoing an audit by a third-party security firm specializing in applied cryptography. See our [Third-Party Audit](/docs/security/audit-status) page for details.

## What happens to my secrets if I stop using AgentSecrets?

Your secrets are yours. You can export them at any time to standard `.env` formats:
```bash
agentsecrets secrets export --format dotenv
```
If you delete your account, all ciphertext blobs and workspace metadata are immediately and permanently erased from our sync servers.

## Does AgentSecrets work offline?

Yes. Once your secrets are pulled, the CLI and proxy operate fully offline without calling home.

## Can I self-host AgentSecrets?

Yes. The backend sync server is open-core, and self-hosting templates (Docker Compose) are available in our primary GitHub repository.

## What is the difference between agentsecrets call and the HTTP proxy?

- `agentsecrets call` is a manual CLI command to run a single request with injected credentials.
- The **HTTP Proxy** is a persistent background daemon that transparently intercepts all outbound HTTP traffic from your SDKs (like OpenAI or Stripe) using native routing configuration.

## How do I report a security vulnerability?

Please refer to our [Reporting Vulnerabilities](/docs/security/reporting) guide. Do not open public issues.
