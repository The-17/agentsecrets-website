# Migrating from HashiCorp Vault / AWS Secrets Manager

Vault and AWS Secrets Manager are good tools for application secrets management. If you are already using one of them, AgentSecrets is not a replacement for your entire secrets infrastructure. It is purpose-built for the specific problem of AI agent credential access. This guide explains the difference and how to run both alongside each other.

---

## Key differences in the model

Vault and AWS Secrets Manager follow the retrieve-and-use model: your application requests a credential value at runtime, receives it, and uses it. This works well when your application is trusted code doing predictable things.

The retrieve-and-use model breaks down when the "application" is an AI agent:

| | Vault / AWS Secrets Manager | AgentSecrets |
|---|---|---|
| How the credential is used | Retrieved as a value, passed to the API call | Key name passed to proxy, value injected at transport layer |
| Value in agent memory | Yes — after retrieval | Never |
| Prompt injection risk | Present — agent holds the value | Eliminated — agent never receives it |
| Audit log contains value | Possible in verbose/debug modes | Structurally impossible — no value field in schema |
| Built for | Application code | AI agents |

If your AI agent currently calls Vault or AWS Secrets Manager to retrieve credentials before making API calls, the retrieved value is in agent context. AgentSecrets eliminates that retrieval step.

---

## What to move and what to keep

You do not need to move everything.

**Keep in Vault / AWS Secrets Manager:**
- Application secrets used by non-agent code (database passwords, service account keys, infrastructure credentials)
- Secrets consumed by CI/CD pipelines in non-agent workflows
- Any credential your existing application code retrieves and uses directly

**Move to AgentSecrets:**
- API credentials that AI agents need to call external services (Stripe, OpenAI, GitHub, SendGrid, etc.)
- Credentials used by MCP servers and AI tools
- Any credential where you want a zero-knowledge guarantee at the agent layer

---

## Step-by-step migration for agent credentials

**1. Identify which credentials your agents use**

List the credentials your agents currently retrieve from Vault or AWS Secrets Manager to make API calls.

**2. Store them in AgentSecrets**

```bash
agentsecrets secrets set STRIPE_KEY=sk_live_...
agentsecrets secrets set OPENAI_KEY=sk-proj-...
agentsecrets secrets set GITHUB_TOKEN=ghp_...
```

**3. Authorize the domains your agents call**

```bash
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.openai.com
agentsecrets workspace allowlist add api.github.com
```

**4. Update your agent code**

Before (retrieving from Vault):
```python
import hvac
import requests

vault_client = hvac.Client()
secret = vault_client.secrets.kv.read_secret_version(path="stripe")
stripe_key = secret["data"]["data"]["key"]

response = requests.get(
    "https://api.stripe.com/v1/balance",
    headers={"Authorization": f"Bearer {stripe_key}"}
)
```

After (using AgentSecrets):
```python
from agentsecrets import AgentSecrets

client = AgentSecrets()

response = client.call(
    "https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)
```

**5. Start the proxy and test**

```bash
agentsecrets proxy start
# Run your updated agent code and verify it works
agentsecrets proxy logs --last 10
```

---

## Running both in parallel during transition

You do not need to migrate everything at once. Your application code can continue using Vault or AWS Secrets Manager while your agent code uses AgentSecrets:

```python
# Application code — still using Vault
db_password = vault_client.get_secret("DATABASE_PASSWORD")

# Agent code — using AgentSecrets
agent_client = AgentSecrets()
response = agent_client.call("https://api.stripe.com/v1/balance", bearer="STRIPE_KEY")
```

Both run in the same codebase without conflict. Migrate agent credentials to AgentSecrets incrementally as you update each agent's code.