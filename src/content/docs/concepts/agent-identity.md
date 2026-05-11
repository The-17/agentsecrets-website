# Agent Identity

In a single-agent workflow, knowing that a call was made is usually enough. In a multi-agent workflow — where multiple agents run simultaneously, share the same secrets, and make overlapping calls — you need to know which agent made each specific call.

Agent identity lets you attribute every proxied call to a specific agent, filter audit logs by agent, and revoke access for one agent without affecting any others.

---

## Why agent identity matters

Consider a production environment with three agents: one processing payments, one sending emails, one generating reports. All three share the same workspace and have access to the same secrets. Something goes wrong — a large number of unexpected API calls appear in the audit log.

Without agent identity, you know what was called and when, but not which agent made the calls. With issued identity, every log entry is attributed to a specific agent. You can immediately see which agent made the unexpected calls, revoke its token without touching the others, and continue operating while you investigate.

---

## The three identity levels

AgentSecrets supports three levels of agent identity with increasing strength of attribution and control.

### Anonymous

The default. Calls are made and logged without any agent attribution. The audit log records that a call happened, but not which agent made it. Suitable for single-agent setups, scripts and one-off tools, and development.

The risk in a multi-agent system: anonymous calls create coverage gaps. You cannot attribute incidents to specific agents, and you cannot revoke access for one agent without stopping them all. Find anonymous calls in the audit log with:

```bash
agentsecrets log list --identity anonymous
```

### Declared identity

The agent declares its name at initialization. The name is recorded in every audit log entry for that agent's calls. There is no cryptographic verification — if an agent claims to be `"billing-processor"`, it is taken at its word.

```python
from agentsecrets import AgentSecrets

client = AgentSecrets(agent_id="billing-processor")
```

Declared identity is suitable for multi-agent systems where audit log clarity matters but you trust the agents running and do not need per-token revocation.

### Issued identity

The agent is issued a cryptographically signed token. The proxy verifies the token on every call. Attribution is cryptographic — a call attributed to `"billing-processor"` can only have come from a process holding that token.

```bash
# Issue a token
agentsecrets agent token issue "billing-processor"
# → agt_ws01hxyz_4kR9mNpQ...
# Shown once — store it securely immediately
```

```python
client = AgentSecrets(agent_token="agt_ws01hxyz_4kR9mNpQ...")
```

Use issued identity for production multi-agent systems, agents with access to sensitive secrets, and any situation where you need to revoke a single agent's access immediately.

---

## How identity flows into the audit log

Every proxy call produces an audit log entry. The identity fields in that entry depend on the identity level used:

| Identity level | `agent_id` field | `agent_identity_level` field |
|---|---|---|
| Anonymous | `null` | `"anonymous"` |
| Declared | `"billing-processor"` | `"declared"` |
| Issued | `"billing-processor"` | `"issued"` |

For issued identity, the log entry is cryptographically tied to the specific token used. If that token is later revoked, the historical entries remain — you can still see what that agent did before revocation.

---

## Token-based identity explained

Issued tokens are cryptographically signed at the workspace level. When the proxy receives a request with an agent token, it verifies the token's signature before processing the request. Invalid or revoked tokens are rejected immediately — the proxy returns 401 and logs the attempt.

Tokens are individual. Revoking one token has no effect on other tokens issued to the same agent or to different agents:

```bash
# Issue multiple tokens for the same agent (e.g., multiple instances)
agentsecrets agent token issue "billing-processor"
# → agt_ws01hxyz_token1...

agentsecrets agent token issue "billing-processor"
# → agt_ws01hxyz_token2...

# Revoke one — the other continues working
agentsecrets agent token revoke <token-id> --agent="billing-processor"
```

This makes it safe to rotate access for a single agent instance without disrupting others.

---

## Choosing an identity level

| Situation | Recommended level |
|---|---|
| Single agent, development | Anonymous |
| Multiple agents, want audit clarity | Declared |
| Production, sensitive secrets | Issued |
| Need to revoke one agent immediately | Issued |
| Compliance, cryptographic attribution required | Issued |
