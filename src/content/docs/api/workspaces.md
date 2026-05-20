# Workspaces & Teams

At the API layer, a **Workspace** is the primary tenant boundary. It coordinates team members, defines domain allowlists, and houses the encrypted keys required to access project secrets.

---

## Workspace Model

Each workspace consists of:
* A unique UUID identifier.
* A human-readable name.
* A membership list (associating users with specific roles).
* An authorized domain allowlist.

---

## Workspace Membership

Users join a workspace through an invitation system. Because AgentSecrets is zero-knowledge, inviting a member requires more than just database updates: the invitee must be granted access to the **Workspace Key** (used to decrypt secrets) without the backend ever seeing it.

### Invitation Process

```
Inviting User                   API (secretsapi)                 Invited User
      │                                │                              │
      │── 1. GET user public key ─────>│                              │
      │<── Returns public key ─────────│                              │
      │                                │                              │
      │── 2. Encrypt WS Key local ─────│                              │
      │      with Invitee's Pub Key    │                              │
      │                                │                              │
      │── 3. POST /api/workspaces/ ───>│                              │
      │      {invites: [...]}          │                              │
      │                                │── 4. Save Invite Envelopes ─>│
      │                                │                              │
```

:::step
1. **Public Key Retrieval**: The inviter's client calls `/api/users/{email}/public-key/` to fetch the invitee's public key.
2. **Local Encryption**: The inviter's client decrypts the workspace key locally (requiring the inviter's password), and encrypts it using the invitee's public key.
3. **Submission**: The encrypted workspace key envelope and role are sent to the backend.
4. **Acceptance**: When the invitee accepts and logs in, their client retrieves the encrypted envelope, decrypts it using their private key, and stores the workspace key locally.
:::

---

## Batch Invitations (v1.3.2+)

To simplify onboarding, the API support bulk invitations in a single request:

* **Endpoint**: `POST /api/workspaces/{workspace_id}/members/`
* **Payload Structure**:
  ```json
  {
    "invites": [
      {
        "email": "dev1@company.com",
        "role": "member",
        "encrypted_workspace_key": "base64_blob_1..."
      },
      {
        "email": "dev2@company.com",
        "role": "admin",
        "encrypted_workspace_key": "base64_blob_2..."
      }
    ]
  }
  ```
* **Performance**: The CLI fetches public keys for all invitees concurrently before assembling this batch payload, significantly reducing invite latency.

---

## Roles and Permissions

The API enforces role-based access control (RBAC):
* **Owner/Admin**: Full permissions. Can add/remove members, promote/demote users, configure allowlists, delete projects, and sync secrets.
* **Member**: Read and write access to secrets. Cannot manage workspace settings, members, or allowlists.

---

## Domain Allowlist

The credential proxy checks authorized domains before injecting credentials.
* **Get Allowlist**: `GET /api/workspaces/{workspace_id}/allowlist/`
* **Add Domains**: `POST /api/workspaces/{workspace_id}/allowlist/` (Requires Admin authentication)
* **Remove Domain**: `DELETE /api/workspaces/{workspace_id}/allowlist/{domain}/`
* **Blocked Log**: `POST /api/workspaces/{workspace_id}/allowlist/log/` (Submits blocked request attempts for audit logs).
