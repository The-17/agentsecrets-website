# Issuing Cryptographic Tokens

Issued Identity is the highest tier of agent identity in AgentSecrets. It is powered by cryptographically signed, high-entropy tokens that uniquely identify an agent instance to the Credential Proxy. 

By using cryptographic tokens, you ensure that every secret resolution is fully authenticated, audited, and individually revocable.

---

## The token issue command

You generate agent tokens using the AgentSecrets CLI. Generating a token registers the agent identity in the workspace (if it doesn't already exist) and outputs a unique, one-time-visible token value.

:::step
### 1. Run the issue command
Open your terminal and run the `agent token issue` command, passing the name of the agent:

```bash
agentsecrets agent token issue "billing-processor"
```
:::

:::step
### 2. Copy the token value
The command will output the newly generated cryptographic token:

```
Token generated successfully!
Agent:             billing-processor
Token ID:          tok_7f9b8c2d
Value:             agt_ws01hxyz_4kR9mNpQ9aBcDeFgHiJkLmNoPqRsTuVwXyZ

[IMPORTANT]
This token value is shown ONLY ONCE. Copy and store it securely immediately.
The server stores only a cryptographic SHA-256 hash of this token for validation.
It cannot be recovered if lost.
```
:::

:::step
### 3. Store the token securely
Save the token in your production environment variables (`AGENTSECRETS_TOKEN`) or a secure secret manager (e.g. AWS Secrets Manager or Kubernetes Secrets) to inject into your running agent container.
:::

---

## Token format and structure

An AgentSecrets agent token is designed for readability, fast routing, and cryptographic verification:

$$\text{agt\_} + \text{workspace\_prefix} + \text{\_} + \text{cryptographic\_payload}$$

* **`agt_`**: The prefix indicating this is an Agent Token.
* **`ws01hxyz_`**: A short identifier for the workspace that issued the token. This allows the local proxy to instantly route validation requests or identify the correct workspace context without decoding the full payload first.
* **`4kR9mNpQ...`**: A high-entropy, base62-encoded cryptographic payload containing a token UUID and a signature signed by the workspace's private authority key.

When the proxy receives an agent token, it performs two verification steps:
:::step
1. **Signature Check**: It decodes the payload and verifies the cryptographic signature locally using the workspace's public key (retrieved during initialization). This requires zero network roundtrips.
2. **Revocation Check**: It queries its local cache (which synced with the cloud backend) to verify that the token's unique ID (`tok_7f9b8c2d`) has not been revoked.
:::

---

## Using the token in the SDK

To authenticate client calls in the Python SDK, initialize the client by passing the token to the `agent_token` parameter:

```python
from agentsecrets import AgentSecrets

# Initialize with the issued agent token
client = AgentSecrets(
    project="payments-service",
    agent_token="agt_ws01hxyz_4kR9mNpQ9aBcDeFgHiJkLmNoPqRsTuVwXyZ"
)

# Outbound requests will be cryptographically attributed to "billing-processor"
response = client.call(
    url="https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)
```

---

## Using the token with the proxy

If you are using raw HTTP calls directly through the credential proxy, pass the token in the `X-AS-Agent-Token` header:

```bash
curl http://localhost:8765/proxy \
  -H "X-AS-Target-URL: https://api.stripe.com/v1/balance" \
  -H "X-AS-Inject-Bearer: STRIPE_KEY" \
  -H "X-AS-Agent-Token: agt_ws01hxyz_4kR9mNpQ9aBcDeFgHiJkLmNoPqRsTuVwXyZ"
```

If the token is invalid, expired, or has been revoked, the proxy will immediately terminate the call, returning a `401 Unauthorized` status:

```json
{
  "detail": "Invalid or revoked Agent Token signature",
  "code": "agent_unauthorized"
}
```

This failed attempt is recorded in the audit log to alert administrators of potential unauthorized access attempts.
