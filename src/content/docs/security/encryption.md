# Encryption Model

AgentSecrets uses a strict **End-to-End Encryption (E2EE)** model. The central sync servers are completely blind to your data.

## Cryptographic Primitives

- **Encryption Algorithm:** AES-256-GCM (Galois/Counter Mode)
- **Key Derivation:** Argon2id (for password-based keys)
- **Key Exchange:** ECDH over Curve25519 (for team sharing)

## How it works

When you create a workspace, the CLI generates a symmetric **Workspace Master Key**. This key never leaves your local machine.

### Pushing Secrets
When you run `agentsecrets secrets push`:
:::step
1. The CLI serializes your environment variables into a JSON object.
2. It encrypts the entire JSON payload using the Workspace Master Key via AES-256-GCM.
3. The resulting ciphertext, along with an authentication tag and nonce, is uploaded to the AgentSecrets API.
:::

The server stores the blob. It cannot read the JSON keys, the values, or the number of secrets.

### Team Sharing
When you invite a team member to a workspace, they generate an ECDH keypair. You retrieve their public key, encrypt the Workspace Master Key using their public key, and send the encrypted key to the server. When they accept the invite, their local CLI decrypts the Workspace Master Key using their private key.

> [WARNING]
> Because the server does not hold the keys, **there is no password reset**. If every admin in a workspace loses their local machine and config file, the workspace data is permanently unrecoverable. Keep backups of your `~/.agentsecrets/config.json`.
