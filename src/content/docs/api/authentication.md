# Authentication

All requests to the AgentSecrets API (except for user registration, login, and token refresh) must be authenticated. The API implements JSON Web Tokens (JWT) and static service keys to authorize clients.

---

## Token Types

The backend supports three categories of tokens:

### 1. User Session Tokens
* **Who uses it**: Human developers via the CLI or web dashboard.
* **Format**: Standard JWT containing the user's UUID, email, and permissions.
* **Lifecycle**: Access token expires in 1 hour; Refresh token expires in 6 hours.
* **Storage**: Saved locally on the developer's machine inside `~/.agentsecrets/token.json`.

### 2. Agent Tokens
* **Who uses it**: Credential proxies, MCP servers, or background runners.
* **Format**: Cryptographically signed agent tokens representing a specific declared identity.
* **Lifecycle**: Configurable lifecycle (e.g., 24 hours up to 30 days) and scope. Can be revoked at any time.

### 3. Service Keys
* **Who uses it**: Internal backend-to-backend resolver components.
* **Format**: High-entropy static bearer keys configured in the environment (`RESOLVER_SERVICE_KEY`).

---

## Including Tokens in Requests

To authenticate a request, include the token in the `Authorization` header as a Bearer token:

```http
Authorization: Bearer <your_jwt_or_agent_token>
```

> [!NOTE]
> For internal resolver calls, the backend accepts `Authorization: Bearer <resolver_service_key>` or matches the service key against a custom internal header, falling back to User JWT authentication if service key validation is not enforced.

---

## Expiry and Refresh Flow

To prevent developers from being logged out during long-running tasks or background syncing (such as the proxy daemon syncing audit logs to the cloud), the CLI API client implements an automatic retry mechanism.

1. **401 Detection**: If an API request to a private endpoint fails with a `401 Unauthorized` status (indicating the Access Token has expired), the client pauses.
2. **Dynamic Refresh**: The client issues a `POST` request to `/api/auth/refresh/` using the stored Refresh Token.
3. **Save and Retry**: If the refresh is successful, the new Access and Refresh tokens are persisted to `~/.agentsecrets/token.json` and the failed request is re-built and executed exactly once with the new token.
4. **Concurrency Protection**: The refresh flow is locked using a mutex (`refreshMu`) to ensure that multiple parallel asynchronous requests do not cause a "refresh storm" by hitting the refresh endpoint concurrently.

---

## Revocation

Tokens can be revoked in three ways:

* **Logout**: Running `agentsecrets logout` calls the `/api/auth/logout/` endpoint, blacklisting the active refresh token.
* **Agent Revocation**: Through the workspaces dashboard or CLI:
  ```bash
  agentsecrets agent token revoke <token_id>
  ```
* **Password Change**: Changing your master password automatically invalidates all existing active user sessions.
