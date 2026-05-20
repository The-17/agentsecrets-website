# Migrating from HashiCorp Vault / AWS Secrets Manager

This guide walks you through migrating credentials from HashiCorp Vault or AWS Secrets Manager to AgentSecrets. You can run both in parallel during transition or completely migrate your workflow to AgentSecrets to take advantage of zero-knowledge local encryption and runtime boundary injection.

---

## Key differences in the model

Vault and AWS Secrets Manager follow the retrieve-and-use model: your application requests a credential value at runtime, receives it, and uses it. This works well when your application is trusted code doing predictable things.

The retrieve-and-use model breaks down when the "application" is an AI agent or when developers want to eliminate plaintext secrets from process memory:

| | Vault / AWS Secrets Manager | AgentSecrets |
|---|---|---|
| How the credential is used | Retrieved as a value, passed to the API call | Key name passed to proxy, value injected at transport layer |
| Value in agent memory | Yes — after retrieval | Never |
| Prompt injection risk | Present — agent holds the value | Eliminated — agent never receives it |
| Audit log contains value | Possible in verbose/debug modes | Structurally impossible — no value field in schema |
| Built for | Application code | AI agents & zero-knowledge dev environments |

If your AI agent currently calls Vault or AWS Secrets Manager to retrieve credentials before making API calls, the retrieved value is in agent context. AgentSecrets eliminates that retrieval step.

---

## Transition strategies

You can choose the level of migration that matches your infrastructure needs:

### Option A: Complete Migration
Move all application and agent secrets to AgentSecrets, utilizing the local OS Keychain for storage and `--storage-mode` flags to manage execution environments. This completely eliminates plaintext secrets in config files or environment variables on developer machines.

### Option B: Parallel Run
Keep infrastructure credentials (like database passwords) in your existing manager while routing external API credentials (such as Stripe, OpenAI, or GitHub keys) through AgentSecrets to protect executing processes and AI agents from credential leakage.


---

## Step-by-step migration for agent credentials

### 1. Identify which credentials your agents use

:::step
List the credentials your agents currently retrieve from Vault or AWS Secrets Manager to make API calls.
:::

### 2. Store them in AgentSecrets

:::step

```bash
agentsecrets secrets set STRIPE_KEY=sk_live_...
agentsecrets secrets set OPENAI_KEY=sk-proj-...
agentsecrets secrets set GITHUB_TOKEN=ghp_...
```
:::

### 3. Authorize the domains your agents call

:::step

```bash
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.openai.com
agentsecrets workspace allowlist add api.github.com
```
:::

### 4. Update your agent code

:::step

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

:::

### 5. Start the proxy and test

:::step

```bash
agentsecrets proxy start
# Run your updated agent code and verify it works
agentsecrets proxy logs --last 10
```

:::


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