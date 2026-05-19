# Audit Logs

Centralized audit logging is essential for compliance and security governance. The AgentSecrets API collects redacted access logs sent by local credential proxies, allowing workspace administrators to monitor credential usage.

---

## Log Syncing

The local credential proxy logs every request it intercepts. These logs are stored in a local SQLite database and synchronized to the cloud on-demand or immediately after request execution.

* **Endpoint**: `POST /api/internal/audit/logs/` (or `/api/audit/logs/` for standard client pushes).
* **Security & Redaction**: The proxy redacts all credentials and sensitive authorization headers before transmitting logs to the backend. The API never receives or stores plaintext tokens.
* **Payload Structure**:
  ```json
  {
    "logs": [
      {
        "timestamp": "2026-05-19T22:00:00Z",
        "agent_id": "claude-assistant",
        "url": "https://api.stripe.com/v1/charges",
        "method": "POST",
        "status_code": 200,
        "environment": "development"
      }
    ]
  }
  ```

---

## Accessing Audit Logs

Administrators can retrieve, filter, and export synced audit logs from the cloud.

* **List Logs**: `GET /api/audit/logs/`
  * Supports filters for `project_id`, `environment`, `agent_id`, and date ranges.
* **Log Detail**: `GET /api/audit/logs/{log_id}/`
* **Log Summary**: `GET /api/audit/summary/` (Returns aggregated metrics, e.g., total requests per day, most active agents).
* **Export Logs (CSV)**: `GET /api/audit/export/` (Generates a CSV download for external SIEM integration).
