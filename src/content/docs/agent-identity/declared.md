# Declared Identity

Declared Identity is the first level of active agent attribution in AgentSecrets. It allows you to tag outbound API calls with a descriptive agent name (e.g., `invoice-generator` or `slack-notifier`). 

This name is recorded in the audit logs, providing immediate transparency into which agent is using which secrets.

---

## Setting a declared identity

You can configure a declared identity using the Python SDK, custom HTTP request headers, the CLI, or environment variables.

### 1. Python SDK
Pass the `agent_id` parameter when initializing the `AgentSecrets` client:

```python
from agentsecrets import AgentSecrets

client = AgentSecrets(
    project="payments-service",
    agent_id="invoice-generator"
)
```

### 2. HTTP Proxy Headers
If you are calling the credential proxy directly via HTTP, include the `X-AS-Agent-ID` header:

```bash
curl http://localhost:8765/proxy \
  -H "X-AS-Target-URL: https://api.stripe.com/v1/invoices" \
  -H "X-AS-Inject-Bearer: STRIPE_KEY" \
  -H "X-AS-Agent-ID: invoice-generator"
```

### 3. CLI Calls
Pass the `--agent-id` flag when making test calls with `agentsecrets call`:

```bash
agentsecrets call \
  --url https://api.stripe.com/v1/invoices \
  --bearer STRIPE_KEY \
  --agent-id invoice-generator
```

### 4. Environment Variables
If neither the SDK parameter nor the header is provided, the proxy and SDK fall back to checking the environment variable:

```bash
export AGENTSECRETS_AGENT_ID="invoice-generator"
```

This is particularly useful in containerized environments (like Kubernetes or Docker) where you can dynamically inject the container name or pod UUID as the agent identity.

---

## What declared identity enables

Declaring agent identities is highly recommended for multi-agent workflows, as it unlocks crucial debugging and auditing tools:

* **Clear Audit Logs**: In the cloud dashboard or CLI logs, the caller column will show the designated ID instead of `anonymous`.
* **Targeted Log Querying**: You can filter logs by agent name to analyze historical behavior:
  ```bash
  agentsecrets proxy logs --agent invoice-generator
  ```
* **No Network Overheads**: Because declared identities do not require cryptographic handshakes or remote verification lookups against the AgentSecrets servers, they add zero latency to your proxy calls.

---

## Limitations vs cryptographic tokens

While declared identities improve log readability, they do not provide cryptographic security. Before choosing declared identity for production workloads, you must understand its limitations:

:::step
1. **Vulnerable to Spoofing**: Declared identity is based entirely on self-reporting. If an agent is compromised via prompt injection, or if an unauthorized script runs on the host machine, it can claim to be `"invoice-generator"` to hide its activities or impersonate a high-privilege service.
2. **No Dynamic Revocation**: Because declared identities are hardcoded or set in environment variables, you cannot block a compromised agent remotely. You must modify the source code, change the environment variables, or restart the container to remove its access.
3. **No Granular Access Controls (ACLs)**: The proxy cannot enforce rules like *"Only allow the invoice-generator to use the Stripe secret."* Because identity is not verified, applying rules based on declared names is unsafe. The proxy will treat all declared identities on a host as having access to the host's active secrets pool.
:::

> [NOTE]
> For production environments requiring strict security, data isolation, and the ability to instantly lock down specific agents, use **Issued Identity** with cryptographic tokens. Learn more in the [Issuing Cryptographic Tokens](./tokens-issue.md) guide.
