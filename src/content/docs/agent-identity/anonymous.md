# Anonymous Agents

By default, any request made through the AgentSecrets Credential Proxy that does not explicitly declare an agent name or present a cryptographic agent token is treated as **Anonymous**. 

While anonymous calls are fast to set up and ideal for initial prototyping, running anonymous agents in a production environment introduces significant security and operational risks.

---

## What anonymous means

When the proxy intercepts a request (for example, to `https://api.stripe.com/v1/balance`) and resolves a secret (like `STRIPE_KEY`), it checks the local workspace context to verify that the request is authorized. 

If no identity is declared, the proxy will complete the call, but it logs the caller identity as `null` with an identity level of `"anonymous"`. 

This means:
* The proxy knows *which* credential was resolved.
* The proxy knows *what* domain was called.
* The proxy **does not know** which specific agent, script, or workflow triggered the call.

---

## Risks of anonymous agents in production

Operating autonomous AI agents without identity declarations exposes production environments to several hazards:

:::step
1. **Undetectable Prompt Injections**: If an LLM is manipulated via prompt injection to exfiltrate data, the malicious outbound API call will appear in your logs as `anonymous`. You will have no way of knowing which agent was compromised or which user prompt initiated the breach.
2. **Lack of Granular Control**: You cannot apply per-agent Access Control Lists (ACLs). An anonymous agent that only needs access to a weather API will also be able to request your Stripe or database credentials if they are present in the same workspace.
3. **No Isolated Revocation**: If you detect an anomaly from a single running script, you cannot terminate its access independently. You must stop the entire local proxy or revoke the workspace-wide service key, causing a full outage for all other running agents.
4. **Compliance Violations**: Security frameworks (such as SOC 2 or ISO 27001) require clear audit trails and attribution for non-human entity actions. Anonymous agent calls violate the core principle of non-repudiation.
:::

---

## How to find anonymous calls in the audit log

To secure your workflows, you must first identify where anonymous calls are happening. You can query the audit logs for these coverage gaps using the CLI or the REST API.

### Using the CLI
Run the `logs` command with the `--identity anonymous` filter to view all unattributed calls:

```bash
agentsecrets proxy logs --identity anonymous --last 10
```

This returns a table of calls lacking identity markers:

```
TIME      RESULT  METHOD  URL                           KEY         AUTH    STATUS  REASON  IDENTITY
14:23:01  * OK    GET     api.stripe.com/v1/balance     STRIPE_KEY  bearer  200     -       anonymous
14:24:12  * OK    POST    api.sendgrid.com/v3/mail      SENDGRID    bearer  200     -       anonymous
```

### Using the REST API
Workspace administrators can fetch anonymous logs programmatically to feed into SIEM platforms:

```http
GET /api/audit/logs/?identity_level=anonymous HTTP/1.1
Host: api.agentsecrets.com
Authorization: Bearer <your_jwt_token>
```

---

## Moving from anonymous to declared

Transitioning your agents from anonymous to declared is a simple process that immediately improves visibility.

:::step
### 1. Identify client initializations
Locate where the `AgentSecrets` SDK or proxy endpoints are called in your codebase.
:::

:::step
### 2. Declare the Agent ID
Modify the initialization to pass an `agent_id` representing the specific agent's role:

```python
# Before (Anonymous)
from agentsecrets import AgentSecrets
client = AgentSecrets()

# After (Declared)
from agentsecrets import AgentSecrets
client = AgentSecrets(agent_id="email-dispatcher")
```
:::

:::step
### 3. Verify in the logs
Restart your agent, run a test call, and check that the identity level has successfully upgraded to `"declared"`:

```bash
agentsecrets proxy logs --last 1
```
:::

> [WARNING]
> While Declared Identity resolves visibility issues, it does not prevent identity spoofing. An agent or process can easily claim to be any identity. For production environments, you should migrate to cryptographically verified **Issued Identity** (see [Issuing Cryptographic Tokens](./tokens-issue.md)).
