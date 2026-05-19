# API Reference

This reference documents the JSON endpoints exposed by the AgentSecrets backend API.

---

## Endpoint Index

| Group | Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---|:---|
| **Auth** | `POST` | `/api/auth/register/` | Register a new user | No |
| | `POST` | `/api/auth/login/` | User login (returns access/refresh JWT) | No |
| | `POST` | `/api/auth/refresh/` | Refresh expired access JWT | No |
| | `POST` | `/api/auth/logout/` | Blacklist current refresh token | Yes |
| **Secrets**| `GET` | `/api/secrets/{project_id}/` | List encrypted secret envelopes | Yes |
| | `POST` | `/api/secrets/` | Create/sync encrypted secrets | Yes |
| | `DELETE`| `/api/secrets/{project_id}/{environment}/{key}/` | Delete a specific secret | Yes |
| **Workspaces**| `GET` | `/api/workspaces/` | List workspaces | Yes |
| | `POST` | `/api/workspaces/` | Create a workspace | Yes |
| | `POST` | `/api/workspaces/{workspace_id}/members/` | Invite workspace member(s) (bulk) | Yes (Admin) |
| | `GET` | `/api/workspaces/{workspace_id}/allowlist/` | Get domain allowlist | Yes |
| | `POST` | `/api/workspaces/{workspace_id}/allowlist/` | Add domain(s) to allowlist | Yes (Admin) |
| **Projects**| `GET` | `/api/projects/` | List projects in workspace | Yes |
| | `POST` | `/api/projects/` | Create a project | Yes |
| **Agents** | `POST` | `/api/workspaces/{workspace_id}/agents/` | Register an agent identity | Yes |
| | `POST` | `/api/workspaces/{workspace_id}/agents/{reg_id}/tokens/` | Issue a cryptographic agent token | Yes |
| **Audit** | `POST` | `/api/internal/audit/logs/` | Sync proxy logs to cloud | Yes |
| | `GET` | `/api/audit/logs/` | Retrieve synced audit logs | Yes |

---

## Error Handling

On error, the API returns a structured JSON payload with the appropriate HTTP status code:

```json
{
  "detail": "Detailed error message explanation",
  "code": "error_code_identifier"
}
```

### Common Status Codes:
* `400 Bad Request`: Missing parameters, malformed JSON, or validation failure.
* `401 Unauthorized`: Missing, expired, or invalid authorization credentials.
* `403 Forbidden`: Authenticated, but lacking sufficient permissions (e.g. Member trying to perform Admin-only invite).
* `404 Not Found`: The requested resource (workspace, project, user, environment) does not exist.
* `429 Too Many Requests`: Triggered by rate-limiting rules.
