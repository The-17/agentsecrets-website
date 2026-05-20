# API Architecture

The AgentSecrets backend is designed to be stateless, scalable, and secure. It enforces security boundaries and coordinates data sync while remaining completely blind to the actual secret values.

---

## Request Lifecycle

When a client makes an API call, it goes through the following lifecycle:

```
 Client (CLI/SDK)         Reverse Proxy / Gateway         secretsapi (Django Ninja)
        │                            │                            │
        │─── HTTPS request ─────────>│                            │
        │                            │─── Route request ─────────>│
        │                            │                            │─── 1. Authenticate (JWT/Key)
        │                            │                            │─── 2. Resolve Workspace Context
        │                            │                            │─── 3. Enforce Permissions
        │                            │                            │─── 4. Process DB/Business Logic
        │                            │<── Return JSON payload ────│
        │<── JSON Response ──────────│
```

:::step
1. **Routing**: Incoming requests are routed by path to the appropriate API controller (e.g. `ResolverController` or `WorkspaceController`).
2. **Authentication**: Handled via Django Ninja's middleware. Requests must present a valid JWT or Service Key (see [Authentication](/docs/api/authentication)).
3. **Workspace Resolution**: For workspace-bound resources, the backend extracts the workspace ID from path variables or headers and verifies user membership.
4. **Zero-Knowledge Sync**: For secret payloads, base64-encoded encrypted blobs are fetched or saved directly without processing their contents.
:::

---

## Authentication Model

The API supports three main authentication paths:

:::step
1. **User JWT Authentication**: Used by developers logging in via CLI or Web UI. Access tokens expire after 1 hour; refresh tokens last 6 hours.
2. **Agent Token Authentication**: Used by credential proxies or runtime agents. Leverages short-lived cryptographic tokens issued for a specific agent identity.
3. **Internal Service Key Authentication**: Used for service-to-service communication (e.g., between the proxy and resolver endpoints) authenticated via the `RESOLVER_SERVICE_KEY`.
:::

---

## Zero-Knowledge Enforcement

To ensure zero-knowledge constraints are structurally enforced, the API database schema does not have columns for plaintext values. 

The API layer enforces validation rules:
* Plaintext fields are rejected if sent to the backend.
* Secret payloads must follow a specific schema structure containing `encrypted_value`, `nonce`, and `tag`.
* Symmetric workspace keys are stored encrypted under individual users' public keys. The backend stores these envelopes but does not hold any private key capable of decrypting them.

---

## Rate Limiting

The API implements rate limiting at the gateway and application middleware levels to prevent brute-force attacks and abuse:
* **Public Endpoints** (register, login): Limited to 5 requests per minute per IP.
* **Authenticated Endpoints** (sync, list): Limited to 120 requests per minute per authenticated user/token.
* **Internal Endpoints**: Bypasses general rate limits but is restricted to trusted internal networks or specific service-to-service tokens.
