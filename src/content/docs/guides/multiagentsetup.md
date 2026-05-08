# Multi-Agent Setup with Agent Identity

This guide covers running multiple agents simultaneously where you need to know which agent made which call.

## Choosing an identity level

For a team running three to five agents with different responsibilities, declared identity is usually sufficient. Use issued identity when you need the ability to revoke individual agent access without redeploying or when regulatory requirements demand cryptographic attribution.

## Declared identity setup

```python
from agentsecrets import AgentSecrets

# Each agent declares its own identity
billing_client = AgentSecrets(
    project="payments-service",
    agent_id="billing-processor"
)

research_client = AgentSecrets(
    project="research-pipeline",
    agent_id="research-agent"
)

publishing_client = AgentSecrets(
    project="content-pipeline",
    agent_id="publishing-agent"
)
```

Now when you look at the audit log, you can see exactly which agent called what:

```bash
agentsecrets log list --agent billing-processor
agentsecrets log list --agent research-agent

# Find any calls without identity
agentsecrets log list --identity anonymous
```

## Issued identity setup

```bash
# Issue tokens for each agent
agentsecrets agent token issue "billing-processor"
# → agt_ws01hxyz_billing...

agentsecrets agent token issue "research-agent"
# → agt_ws01hxyz_research...

# List active tokens
agentsecrets agent token list "billing-processor"
```

```python
billing_client = AgentSecrets(
    project="payments-service",
    agent_token="agt_ws01hxyz_billing..."
)

research_client = AgentSecrets(
    project="research-pipeline",
    agent_token="agt_ws01hxyz_research..."
)
```

## Revoking access to a specific agent

```bash
# Get the token ID
agentsecrets agent token list "billing-processor"

# Revoke it
agentsecrets agent token revoke <token-id> --agent="billing-processor"
```

The billing processor can no longer make proxy calls. All other agents are unaffected. No redeployment needed.