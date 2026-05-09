# Governance Audit Log

Every AgentSecrets proxy call is logged. The standard proxy log (`agentsecrets proxy logs`) shows recent calls from the local proxy. The governance log (`agentsecrets log`) shows the full backend log with complete context.

## What the governance log records

Every entry captures:

- Timestamp
- Agent identity and identity level
- Active environment at time of call
- Credential reference (key name, never value)
- Injection style
- Target domain and full URL
- HTTP method
- Response status code
- Duration in milliseconds
- Whether response redaction occurred
- Domain allowlist snapshot — the exact state of the allowlist at the moment of the call, not the current state

The allowlist snapshot is important for forensics. If the allowlist changes after an incident, historical entries still show what was authorized at the time of the call. The governance log is forensically complete.

## Querying the governance log

```bash
# Stream live log
agentsecrets log list --tail

# Filter by agent
agentsecrets log list --agent billing-processor

# Find anonymous calls — gaps in identity coverage
agentsecrets log list --identity anonymous

# Aggregate statistics for the last 7 days
agentsecrets log summary --since 7d

# Export for compliance review
agentsecrets log export --format csv --since 30d

# Inspect a specific entry in full detail
agentsecrets log detail <entry-id>
```

## What is never in the log

There is no value field in the audit log schema. It is not a field that is populated with empty strings or null, the field does not exist. You cannot accidentally log a credential value by misconfiguring the verbosity level or enabling debug mode. The schema makes it structurally impossible.
