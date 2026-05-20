# The Proxy Model

The local proxy is the core of AgentSecrets. Everything else — the CLI, the SDK, the MCP integration, `agentsecrets env` — either manages the credentials the proxy uses or wraps the proxy for specific workflows. Understanding how the proxy works makes the rest of AgentSecrets easier to reason about.

---

## What a credential proxy is

A credential proxy is a local HTTP server that sits between your agent and the APIs it calls. Instead of your agent making authenticated requests directly, it routes requests through the proxy with a key name. The proxy resolves the value, injects it into the outbound request, and returns only the API response.

The agent never performs authentication directly. The proxy performs authentication on its behalf, without the agent ever seeing the credential that was used.

---

## How transport-layer injection works

Transport-layer injection means the credential value is added to the HTTP request at the point of transmission, after the request has left the calling process and before it reaches the target API.

The sequence:

:::step
1. Your agent sends a request to `localhost:8765` with a key name in an injection header
2. The proxy validates the target domain against the allowlist
3. The proxy retrieves the key name from the request header
4. The proxy looks up the corresponding value in the OS keychain
5. The proxy decrypts the value in its own process memory
6. The proxy constructs the outbound HTTP request with the decrypted value injected in the appropriate position (bearer token, header, query param, etc.)
7. The proxy sends the request to the target API
8. The proxy receives the response, scans it for credential echoes, and redacts if found
9. The proxy returns the API response to the caller and writes an audit log entry
:::

At no point does the decrypted value travel back through the proxy to the calling process. It flows only forward — from the proxy into the outbound request.

---

## The request lifecycle step by step

```
Agent / calling code
  │
  │  POST localhost:8765/proxy
  │  X-AS-Target-URL: https://api.stripe.com/v1/balance
  │  X-AS-Inject-Bearer: STRIPE_KEY
  │
  ▼
AgentSecrets Proxy
  │
  ├─ [1] Check target domain against allowlist
  │       api.stripe.com → authorized → continue
  │       (if not authorized → 403, log attempt, stop)
  │
  ├─ [2] Parse injection header
  │       X-AS-Inject-Bearer: STRIPE_KEY
  │       injection style: bearer
  │       key name: STRIPE_KEY
  │
  ├─ [3] OS keychain lookup
  │       workspace:project:environment:STRIPE_KEY
  │       → retrieve encrypted blob
  │       → decrypt in-process
  │       → value: sk_live_51H... (in proxy memory only)
  │
  ├─ [4] Construct outbound request
  │       GET https://api.stripe.com/v1/balance
  │       Authorization: Bearer sk_live_51H...
  │       (value injected directly — never returned to caller)
  │
  ├─ [5] Forward to target API
  │
  ├─ [6] Receive response
  │       Scan body for credential echo patterns
  │       If found → replace with [REDACTED_BY_AGENTSECRETS]
  │
  ├─ [7] Write audit log entry
  │       timestamp, agent identity, environment, key name,
  │       endpoint, status, duration, allowlist snapshot
  │       (no value field)
  │
  └─ [8] Return API response to caller
           {"object": "balance", "available": [...]}
           (the API response — not the credential)

Agent / calling code receives the API response
```

---

## What the agent sees at each step

| Step | What the agent holds |
|------|---------------------|
| Before the call | Key name: `"STRIPE_KEY"` |
| During the proxy request | Key name in request header |
| While proxy resolves | Nothing, the proxy is handling this independently |
| After the call | API response: `{"object": "balance", ...}` |

The agent never holds `sk_live_51H...`. At no point in this sequence does the value enter the agent's process.

---

## Proxy vs retrieval — side by side

| | Retrieval model | Proxy model |
|---|---|---|
| Agent holds credential value | Yes, after retrieval | Never |
| Value in calling process memory | Yes | No |
| Prompt injection can access value | Yes | No |
| Plugin/tool in same process can access | Yes | No |
| Value can appear in logs/traces | Yes | No |
| Audit log contains value | Possible | Structurally impossible |

---

## The six injection styles

The proxy supports six ways to inject credentials into an outbound request, covering all common API authentication patterns:

| Style | Injects as | Use for |
|-------|-----------|---------|
| Bearer | `Authorization: Bearer <value>` | OAuth tokens, most modern APIs |
| Basic | `Authorization: Basic base64(value)` | HTTP Basic Auth |
| Custom header | `{Header-Name}: <value>` | SendGrid, Twilio, custom APIs |
| Query parameter | `?{param}=<value>` in URL | Google Maps, older REST APIs |
| JSON body | `{"path": "<value>"}` in request body | Token exchange, custom auth flows |
| Form field | `field=<value>` in form body | OAuth 2.0 form flows |

See [Auth Injection Styles](/docs/proxy/injection-styles) for full documentation and examples of each.