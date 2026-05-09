# Agent Identity

In a single-agent workflow, the audit log is enough to understand what happened. In a multi-agent workflow, where multiple agents may be running different tasks simultaneously, possibly sharing the same secrets, you need to know which agent made a specific call. Agent identity solves this.

AgentSecrets supports three identity levels.

## Anonymous

This is the default. Calls are logged and attributed to no specific agent. Useful for single-agent setups or scripts where identity tracking is not needed.

## Declared identity

The agent declares its name at initialization. The name is recorded in every audit log entry.

```python
from agentsecrets import AgentSecrets

client = AgentSecrets(agent_id="billing-processor")
```

```bash
# Filter audit log by agent
agentsecrets log list --agent billing-processor

# Find calls with no identity set — useful for finding coverage gaps
agentsecrets log list --identity anonymous
```

## Issued identity

The agent is issued a cryptographically signed token. The proxy verifies the token on every call. Tokens can be revoked individually without affecting other agents or tokens.

```bash
# Issue a token for an agent
agentsecrets agent token issue "billing-processor"
# → agt_ws01hxyz_4kR9mNpQ...

# List active tokens for an agent
agentsecrets agent token list "billing-processor"

# Revoke a specific token
agentsecrets agent token revoke <token-id> --agent="billing-processor"
```

```python
client = AgentSecrets(agent_token="agt_ws01hxyz_4kR9mNpQ...")
```

Every call made with an issued token is cryptographically attributable to that token. Revoking the token immediately prevents any further calls using it. Other agents and tokens are unaffected.

## Choosing an identity level

Use anonymous for scripts and single-agent setups. Use declared identity when you have multiple agents and want audit log clarity without the overhead of token management. Use issued identity when you need revocation capability or cryptographic attribution, for example, when an agent has access to sensitive secrets and you want to be able to cut off access immediately if something goes wrong.
