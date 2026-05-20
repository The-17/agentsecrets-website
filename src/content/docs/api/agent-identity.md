# Agent Identity

In agentic workflows, it is critical to distinguish between actions taken by human developers and actions taken by AI agents. The API provides endpoints to declare agent identities, issue cryptographically scoped agent tokens, and audit their execution.

---

## Agent Registration

Before an AI agent can execute tools or requests under its own name, it must be registered within a workspace:

* **Endpoint**: `POST /api/workspaces/{workspace_id}/agents/`
* **Payload**:
  ```json
  {
    "name": "Claude-Codebase-Assistant",
    "description": "Local development agent running Claude Code",
    "project_id": "optional_project_uuid"
  }
  ```
* **Response**: Returns a unique `registration_id`.

---

## Token Issuance & Lifecycle

Once registered, the CLI can request a cryptographic token for that agent. This token is used to authenticate the local proxy when running tasks on behalf of that agent.

* **Issue Token**: `POST /api/workspaces/{workspace_id}/agents/{registration_id}/tokens/`
* **List Tokens**: `GET /api/workspaces/{workspace_id}/agents/{registration_id}/tokens/`
* **Revoke Token**: `DELETE /api/workspaces/{workspace_id}/agents/{registration_id}/tokens/{token_id}/`

---

## Auditing by Identity

When the credential proxy forwards requests to external APIs, it signs the audit log with the active token:
:::step
1. The proxy matches the requests to the current active agent.
2. The proxy sends the audit log containing the `agent_id` or token signature to the backend: `/api/internal/audit/logs/`.
3. The workspace administrator can view precisely which agent used which credentials, and quickly revoke access for compromised or misbehaving agents without affecting other teammates.
:::
