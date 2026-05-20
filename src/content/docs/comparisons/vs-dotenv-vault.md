# AgentSecrets vs dotenv-vault

`dotenv-vault` is a tool created by the original maintainers of `dotenv`. It solves the problem of sharing `.env` files across a team by encrypting the `.env` file locally and syncing it to a centralized vault.

## The `.env` Paradigm and AI

`dotenv-vault` fundamentally relies on `.env` files. It decrypts secrets and writes them to a local `.env` file, which is then loaded into your application's process memory (e.g., via `require('dotenv').config()`).

For AI agents, this is extremely dangerous. Any secret loaded via `.env` is fully accessible to the runtime. If a LangChain agent is instructed by a malicious prompt to dump its environment variables, every secret in the `.env` file is exposed.

## The Zero-Knowledge Shift

AgentSecrets completely eliminates `.env` files for sensitive credentials.

When you use AgentSecrets:
:::step
1. Secrets are stored in your OS Keychain (not a plaintext file).
2. They are synced securely across your team using End-to-End Encryption.
3. They are injected into API requests via a local proxy, meaning they **never enter process memory**.
:::

### Migration

If you are currently using `dotenv-vault`, migrating to AgentSecrets is easy. See our [Migrating from dotenv-vault](/docs/migrate-from-dotenv-vault) guide for a single-command import process.
