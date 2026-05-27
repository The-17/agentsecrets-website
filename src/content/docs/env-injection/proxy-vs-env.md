# Proxy Injection vs. Environment Injection

AgentSecrets supports two primary integration models for securing credentials: **Local Proxy Interception** and **Startup Environment Injection**. While both models store secrets securely in the local OS Keychain and sync them via end-to-end encryption, they enforce different security boundaries at runtime.

---

## Side-by-Side Comparison

| Feature | Local Proxy Interception (Mode 1) | Startup Environment Injection (Mode 2) |
|---|---|---|
| **Mechanism** | Intercepts HTTP/HTTPS requests at the network transport layer | Spawns a child process with temporary environment variables in RAM |
| **Plaintext in RAM** | Structurally absent from the target process memory | Exists in process environment variables (`process.env` / `os.environ`) |
| **Prompt Injection Protection** | **Complete** (agent has no access to the credential value) | **None** (agent can inspect environment variables) |
| **Integration Complexity** | Requires routing requests through the proxy (via SDK or proxy port) | Zero code changes required (prefix execution command) |
| **Outgoing Domain Allowlist** | Enforced at the network boundary | Enforced only if proxy routing is also configured |
| **Client Code Compatibility** | Requires HTTP clients to support proxy configuration or headers | Works natively with all existing tools and libraries |

---

## Zero-Knowledge Tradeoffs

### The Proxy Model (Mode 1)
In the proxy model, secrets never touch your application process memory. Your code refers to credentials by their name reference (e.g. `STRIPE_KEY` or `OPENAI_KEY`). 

The proxy intercepts outbound network calls, validates that the target domain is on the allowlist, retrieves the value from the keychain in its own isolated process space, injects the key into the HTTP headers, and forwards the call.

- **Advantage**: Absolute security boundary. Even if the application process is compromised or hijacked by malicious code, the plaintext secrets cannot be read because they do not exist within that process.
- **Tradeoff**: Outbound HTTP traffic must be configured to pass through the local proxy endpoint (`localhost:8765`).

### The Environment Model (Mode 2)
Using `agentsecrets env -- <command>`, AgentSecrets reads requested keys from the OS Keychain, resolves their values, and injects them as standard system environment variables when launching the target process.

- **Advantage**: Perfect compatibility. Any legacy CLI, tool, or server can run immediately without code changes.
- **Tradeoff**: Secrets live in the target process RAM for the duration of the execution. If an AI agent has the ability to run shell scripts, read system environment blocks, or execute arbitrary code, it can extract the plaintext keys.

---

## When Environment Injection is Appropriate

Use `agentsecrets env` when:

1. **Running legacy CLI tools**: Traditional scripts and services that require environment variables and cannot be configured to use HTTP proxies.
2. **Local test execution**: Running tests via `agentsecrets env -- npm test` or `agentsecrets env -- pytest` where prompt injection is not a risk.
3. **Internal developer workflows**: Securing database passwords and credentials on developer machines without writing plaintext `.env` files to disk.

---

## When the Proxy is Required

Use the local proxy or SDK when:

1. **Running autonomous AI agents**: Any agent that processes user-generated queries, handles files, or uses tools dynamically.
2. **Handling untrusted code or plugins**: If your application loads third-party plugins, packages, or LLM-assisted runtimes.
3. **Enforcing network egress policies**: Restricting outgoing requests to allowed domains, preventing compromised packages from exfiltrating data.
