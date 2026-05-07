# Zero-Knowledge Design

The cloud sync feature lets you share credentials across machines and teammates. It is designed so the server structurally cannot decrypt your secrets.

### Encryption scheme
Before any secret leaves your machine, it is encrypted using X25519 key exchange, AES-256-GCM, and Argon2id.

| Layer | Implementation |
| :--- | :--- |
| Key exchange | X25519 (NaCl SealedBox) |
| Secret encryption | AES-256-GCM |
| Key derivation | Argon2id |
| Key storage | OS keychain |

### What the server sees
The server stores only ciphertext blobs.

\\\json
{
  
