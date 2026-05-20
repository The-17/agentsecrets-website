# Secrets & Sync

The core function of the AgentSecrets API is to coordinate secret synchronization across developers. Because of the zero-knowledge constraint, the API does not handle plaintext secret values. Instead, it acts as a storage layer for **Encrypted Secret Envelopes**.

---

## The Zero-Knowledge Envelope Model

When you set a secret locally, your client encrypts both the key name and the secret value before sending it to the backend.

```
Plaintext Secret                    Local Encryption (AES-GCM)                API JSON Payload
  Key:   STRIPE_KEY   ─────────►    Workspace Symmetric Key    ─────────►    {
  Value: sk_live_...                (Decrypted from user key)                 "encrypted_key": "abc...",
                                                                              "encrypted_value": "xyz...",
                                                                              "nonce": "123...",
                                                                              "tag": "456..."
                                                                             }
```

The database stores the following fields for each secret:
* `project_id`: UUID of the project.
* `environment`: The target environment (e.g. `development`).
* `encrypted_key`: Base64-encoded encrypted key name.
* `encrypted_value`: Base64-encoded encrypted secret value.
* `nonce`: AES-GCM nonce (unique per secret).
* `tag`: AES-GCM authentication tag.
* `version`: Incremental version number for conflict resolution.

---

## Synchronization Flow

Secret syncing is done on-demand or through background integration triggers:

### Pushing Secrets
:::step
1. The local CLI reads the environment secrets and identifies changes (additions, deletions, updates).
2. It encrypts all modified secrets.
3. The CLI issues a `POST /api/secrets/` with a list of encrypted envelopes.
4. The backend updates the database records and increments the version metadata.
:::

### Pulling Secrets
:::step
1. The local CLI calls `GET /api/secrets/{project_id}/` (optionally specifying environment).
2. The backend returns all encrypted envelopes.
3. The CLI decrypts the envelopes locally using the stored Workspace Key and updates the local SQLite cache or project `.env` templates.
:::
