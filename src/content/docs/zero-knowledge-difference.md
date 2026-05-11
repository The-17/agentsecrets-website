# The Zero-Knowledge Difference

Most secrets tools solve the wrong problem for AI agents. They secure credentials at rest, but the moment a credential is retrieved for use, that protection ends. AgentSecrets solves a different problem: keeping the value out of agent context entirely, not just storing it safely.


## The common pattern and why it fails

The standard approach to secrets management looks like this:

```
Secure store → agent retrieves sk_live_51H... → value enters agent memory
                                               → prompt injection can reach it
                                               → malicious plugin can read it
                                               → LLM trace captures it
                                               → log verbosity exposes it
```

Whether the secure store is a `.env` file, HashiCorp Vault, AWS Secrets Manager, or a leasing system, if the agent retrieves the value, the value is in agent context. That is the moment of exposure, and it exists regardless of how well the credential was stored beforehand.

This is not a flaw in those tools. They were built for applications, not agents. Applications do exactly what their code says. An agent processing untrusted content can be instructed to do things its code never intended.

## Runtime retrieval vs transport-layer injection

**Runtime retrieval** — the common pattern:

```python
# The agent fetches the credential value
token = secrets_manager.get("STRIPE_KEY")
# token is now "sk_live_51H..." — in memory, accessible, extractable

response = requests.get(
    "https://api.stripe.com/v1/balance",
    headers={"Authorization": f"Bearer {token}"}
)
```

Once `token` holds the value, it can be accessed by any tool, plugin, or dependency running in the same process. It can be logged, extracted by prompt injection, or captured in an LLM trace.

**Transport-layer injection** — the AgentSecrets model:

```python
# The agent passes a key name — never a value
response = client.call(
    "https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)
# The proxy resolved the value, injected it, and returned the API response.
# "sk_live_51H..." never existed in this process.
```

The proxy receives the key name, resolves the value from the OS keychain in its own process, injects it directly into the outbound HTTP request at the transport layer, and returns only the API response. The value never crossed into the calling process.

---

## Why secure storage is not enough

Secure storage protects credentials from external attackers. Transport-layer injection protects credentials from the runtime environment itself, including the AI agent running inside it.

The threat model for AI agents includes:

- **Prompt injection**: malicious content in an email, document, or web page that instructs the agent to exfiltrate credentials
- **Malicious tools or plugins**: a dependency in the same process that reads memory or environment variables
- **LLM traces and observability tools**: platforms that capture inputs and outputs for debugging, which may capture credential values passed as arguments
- **Verbose logging**: debug modes that log function arguments, HTTP headers, or environment state

None of these threats are addressed by secure storage alone. All of them are addressed by keeping the value out of agent context entirely.

---

## The architectural guarantee

AgentSecrets makes the zero-knowledge guarantee structural, not policy-based.

A policy-based guarantee says "we do not log credential values." The system could log them. Whether it does depends on configuration and discipline. A structural guarantee means the audit log schema has no value field, the SDK has no `get()` method, and the proxy returns only the API response. You cannot accidentally break this guarantee by misconfiguring something because the architecture has no path for the value to travel anywhere it should not be.
