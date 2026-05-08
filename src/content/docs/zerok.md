## Zero-Knowledge Design

The cloud sync feature lets you share credentials across machines and teammates. It is designed so the server structurally cannot read your secrets.

### Encryption scheme

Before any secret leaves your machine, it is encrypted with X25519 key exchange (NaCl SealedBox), AES-256-GCM symmetric encryption, and Argon2id key derivation. The encryption key — your workspace key — lives only in your OS keychain and is never sent to the server.

| Layer | Implementation |
|---|---|
| Key exchange | X25519 (NaCl SealedBox) |
| Secret encryption | AES-256-GCM |
| Key derivation | Argon2id |
| Key storage | OS keychain |
| Transport | HTTPS / TLS |
| Server storage | Encrypted blobs only |

### What the server stores

```json
{
  "id": "entry_9xKp",
  "project": "my-agent",
  "environment": "production",
  "key_name": "STRIPE_KEY",
  "ciphertext": "gAAAAABl7...EncryptedBlob...",
  "nonce": "Zx9k...",
  "tag": "aB3c..."
}
```

The server does not store the plaintext value, the decryption key, or any key derivation material. Without your workspace key, the ciphertext is noise.

### Policy versus structure

A policy-based guarantee says "we do not log credential values." The system could log them. Whether it does depends on configuration and discipline. A structural guarantee says the log schema has no value field. The system cannot log a credential value regardless of configuration or intent.

AgentSecrets makes the zero-knowledge guarantee structural at every layer. The proxy returns only the API response. The SDK has no `get()` method. The audit log has no value field. The mock testing client records no values. You cannot accidentally break this guarantee by misconfiguring something — there is nowhere for the value to go.
