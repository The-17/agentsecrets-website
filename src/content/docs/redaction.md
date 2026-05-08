# Response Redaction

The proxy scans every API response for patterns matching the injected credential value. If it finds a match, it replaces it with `[REDACTED_BY_AGENTSECRETS]` before the response reaches your code and adds `X-AS-Redacted: true` to the response headers.

This defends against credential echo exfiltration: an attack where a compromised or malicious API reflects the credential back in its response body, putting it into agent context where it can be read, logged, or extracted.

The redaction event is logged as `credential_echo` in the audit log. The value that was echoed is not logged, only the fact that an echo occurred, the key name, and the endpoint.

```bash
# A redacted call appears in logs like this
agentsecrets proxy logs --last 5

# 14:23:01  GET  api.stripe.com/v1/balance  STRIPE_KEY  200  credential_echo  245ms
```
