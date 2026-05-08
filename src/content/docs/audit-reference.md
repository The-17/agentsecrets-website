# Audit Log Schema

Every proxy call produces one audit log entry. The schema is the same for the local proxy log and the global backend log.

```json
{
  "timestamp": "2026-03-20T14:22:01.334Z",
  "resolution_path": "local",
  "workspace_id": "ws_01HABC...",
  "project_id": "proj_01HDEF...",
  "environment": "production",
  "agent_id": "billing-processor",
  "agent_identity_level": "declared",
  "credential_ref": "STRIPE_KEY",
  "injection_style": "bearer",
  "target_domain": "api.stripe.com",
  "target_url": "https://api.stripe.com/v1/balance",
  "method": "GET",
  "status_code": 200,
  "duration_ms": 245,
  "redacted": false,
  "credential_echo": false,
  "allowlist_snapshot": {
    "domains": ["api.stripe.com", "api.openai.com"],
    "captured_at": "2026-03-20T14:22:01.330Z"
  },
  "error": null
}
```

## Field reference

| Field | Type | Description |
|---|---|---|
| `timestamp` | ISO 8601 | UTC timestamp of the call |
| `resolution_path` | string | `local` for local proxy calls |
| `workspace_id` | string | Workspace the call was made in |
| `project_id` | string | Project the credential belongs to |
| `environment` | string | Active environment at time of call |
| `agent_id` | string or null | Agent name if declared or issued identity was used |
| `agent_identity_level` | string | `anonymous`, `declared`, or `issued` |
| `credential_ref` | string | Key name of the credential used |
| `injection_style` | string | `bearer`, `basic`, `header`, `query`, `body_field`, `form_field` |
| `target_domain` | string | Domain of the target API |
| `target_url` | string | Full URL of the request |
| `method` | string | HTTP method |
| `status_code` | int | HTTP status code returned by the API |
| `duration_ms` | int | Total request duration including injection |
| `redacted` | bool | True if a credential echo was found and scrubbed in the response |
| `credential_echo` | bool | Same as `redacted` — included for filter compatibility |
| `allowlist_snapshot` | object | The domain allowlist at the exact moment of the call |
| `error` | string or null | Error message if the call failed at the proxy level |

There is no `value` field. The field does not exist in the schema — it is not null, not empty, not redacted. It does not exist.

---

## Architecture

### Component overview

```
┌─────────────────────────────────────────────────────┐
│                  AI Agent / User                    │
└─────────────────────┬───────────────────────────────┘
                      │ key name
                      ▼
┌─────────────────────────────────────────────────────┐
│              AgentSecrets CLI / SDK                 │
│                                                     │
│  Manages secrets lifecycle                          │
│  Communicates with proxy                            │
│  Never reads keychain directly                      │
└─────────────────────┬───────────────────────────────┘
                      │ localhost:8765
                      ▼
┌─────────────────────────────────────────────────────┐
│              Local Proxy                            │
│                                                     │
│  Validates domain allowlist                         │
│  Reads from OS keychain                             │
│  Injects at transport layer                         │
│  Scans response for credential echoes               │
│  Writes audit log entry                             │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────────┐
│   OS Keychain    │   │        Target API             │
│                  │   │   api.stripe.com              │
│  Encrypted       │   │   api.openai.com              │
│  User-scoped     │   │   any authorized domain       │
└──────────────────┘   └──────────────────────────────┘
```

### Cloud sync architecture

```
Your machine
┌─────────────────────────────────────────────────────┐
│  CLI generates encryption keys                      │
│  Private key → OS keychain                          │
│  Public key → sent to server                        │
│                                                     │
│  agentsecrets secrets set KEY=value                 │
│    → encrypts with workspace key (from keychain)    │
│    → uploads ciphertext                             │
│    → server stores encrypted blob                   │
│                                                     │
│  agentsecrets secrets pull                          │
│    → downloads encrypted blob                       │
│    → decrypts with workspace key (from keychain)    │
│    → writes to OS keychain                          │
└─────────────────────────────────────────────────────┘

Server

