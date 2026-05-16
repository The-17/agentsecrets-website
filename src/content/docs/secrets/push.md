# Pushing to Cloud Sync

```bash
agentsecrets secrets push
```

## What push does

`push` reads your local secrets for the active environment, encrypts each value client-side using your workspace key, and uploads the encrypted blobs to the cloud. The server receives ciphertext it cannot decrypt. Your workspace key never leaves your machine.
Push is how your secrets become available to teammates and to your other machines.

### What happens
- **Keychain mode (StorageMode 1)**: reads all keys from your OS keychain and pushes them.
- **Standard mode (StorageMode 2)**: reads your .env file and pushes all entries.

If the cloud contains keys that are absent locally, the CLI shows a diff and asks whether you want to delete them from the cloud, keep them, or cancel. Use `--force` to skip this prompt.

### Example
```bash
# Onboard a new project: push your existing .env once, then delete it
agentsecrets secrets push
```

## How encryption works before leaving your machine

Before any secret leaves your machine, the CLI retrieves the value from the OS keychain, encrypts it using AES-256-GCM with a key derived via Argon2id from your workspace key, generates a fresh nonce for each encryption operation, and uploads the ciphertext, nonce, and authentication tag together as a single blob. The plaintext value and the workspace key are never transmitted.


## Pushing a specific environment

Push operates on the active environment only. To push a specific environment:

```bash
agentsecrets environment switch development
agentsecrets secrets push
```
