# HTTP Proxy

The HTTP proxy mode starts a local server at `localhost:8765`. Any agent, script, framework, or tool that makes HTTP calls can route requests through it. This is the integration path for LangChain, CrewAI, AutoGen, and any other framework where you control the HTTP client.

### Starting the proxy

```bash
agentsecrets proxy start

# Custom port
agentsecrets proxy start --port 9000

# Check proxy status
agentsecrets proxy status

# Stop the proxy
agentsecrets proxy stop
```

### Making requests through the proxy

Send your request to the proxy URL with the target URL and injection headers:

```bash
curl http://localhost:8765/proxy \
  -H "X-AS-Target-URL: https://api.stripe.com/v1/balance" \
  -H "X-AS-Inject-Bearer: STRIPE_KEY"
```

The proxy resolves `STRIPE_KEY` from the OS keychain, injects it as `Authorization: Bearer sk_live_...` in the outbound request, forwards to `api.stripe.com`, and returns the response to your curl command. The value never appeared in your terminal.

### Injection headers reference

| Header | Injects as | Use for |
|---|---|---|
| `X-AS-Inject-Bearer: KEY_NAME` | `Authorization: Bearer value` | OAuth tokens, API tokens (Stripe, OpenAI, GitHub) |
| `X-AS-Inject-Basic: KEY_NAME` | `Authorization: Basic base64(value)` | HTTP Basic Auth (Jira, legacy REST APIs) |
| `X-AS-Inject-Header-{Name}: KEY_NAME` | `{Name}: value` | Custom header APIs (SendGrid, Twilio) |
| `X-AS-Inject-Query-{param}: KEY_NAME` | `?{param}=value` in URL | Query parameter APIs (Google Maps) |
| `X-AS-Inject-Body-{path}: KEY_NAME` | `{"path": "value"}` in JSON body | Token exchange, custom auth |
| `X-AS-Inject-Form-{field}: KEY_NAME` | `field=value` in form body | OAuth form flows |

Multiple injection headers can be combined in a single request for APIs that require more than one credential:

```bash
curl http://localhost:8765/proxy \
  -H "X-AS-Target-URL: https://api.example.com/data" \
  -H "X-AS-Inject-Bearer: AUTH_TOKEN" \
  -H "X-AS-Inject-Header-X-Org-ID: ORG_SECRET"
```

### Proxy security

The proxy has several security measures built in:

**Session token** — generated at proxy startup, required on every request. Blocks rogue processes on the same machine from using the proxy.

**SSRF protection** — requests to private IP ranges (`10.x`, `172.16-31.x`, `192.168.x`), localhost, and non-HTTPS targets are blocked.

**Redirect stripping** — if the target API redirects your request, injection headers are not forwarded to the redirect target.

**Uniform errors** — the proxy returns identical error responses whether a secret exists or not, preventing secret enumeration attacks.

### Viewing proxy logs

```bash
agentsecrets proxy logs
agentsecrets proxy logs --last 20
agentsecrets proxy logs --watch          # tail in real time
agentsecrets proxy logs --secret STRIPE_KEY   # filter by key name
agentsecrets proxy logs --env production       # filter by environment
```

Output:
```
14:23:01  GET  api.stripe.com/v1/balance    STRIPE_KEY  200  245ms
14:31:45  POST api.stripe.com/v1/charges    STRIPE_KEY  200  412ms
14:31:46  POST api.openai.com/v1/chat/...   OPENAI_KEY  200  1203ms
```

Key names. Endpoints. Status codes. Durations. No values.
