# Storage Modes

AgentSecrets supports two storage modes that determine where secrets live on your machine and how they are read and written by the CLI. You choose a mode when you initialize a project, it is stored in `.agentsecrets/project.json` and does not change unless you reinitialize.

---

## What storage mode controls

The storage mode affects where `secrets pull` writes secrets on your machine, where `secrets push` reads secrets from, and whether a `.env.{environment}` file is created or maintained.

The mode does not affect cloud sync, the proxy, or the zero-knowledge guarantee. Credentials are encrypted client-side before upload in both modes, and the proxy always resolves from the OS keychain regardless of mode.

---

## Mode 1: Keychain only (default and recommended)

In keychain-only mode, secrets live exclusively in your OS keychain. No `.env` files are created or read.

```bash
agentsecrets init --storage-mode 1
```

**How it works:**
- `secrets set` → writes directly to OS keychain
- `secrets push` → reads from OS keychain, encrypts, uploads to cloud
- `secrets pull` → downloads from cloud, decrypts, writes to OS keychain
- `secrets pull` also generates `.env.example` with key names and environment annotations, never values.

Any process running as the same user can read a file on disk. An AI agent with filesystem access can read `.env` files. The OS keychain has a fundamentally different security boundary, other processes cannot read keychain entries without explicit authentication. Keychain-only mode means there is nothing on disk for an agent to find.

Use mode 1 for any project where an AI agent has filesystem access to the project directory, for all production environments, and whenever you want the strongest possible local security boundary.

---

## Mode 2: Keychain and .env file

In mode 2, secrets live in the keychain and are also written to `.env.{environment}` files when you pull.

```bash
agentsecrets init --storage-mode 2
```

**How it works:**
- `secrets set` → writes directly to OS keychain
- `secrets push` → reads from `.env.{current environment}`, falls back to `.env`, encrypts, uploads to cloud
- `secrets pull` → downloads from cloud, decrypts, writes to OS keychain and to `.env.{environment}`
- The `.env` file is a convenience output of pull, the keychain is always the source of truth

Mode 2 exists for frameworks and tools that need to read environment variables at startup and cannot be modified to use the proxy or `agentsecrets env`. If you are using a framework where configuration is read from `.env` files before your code runs and you cannot wrap the process with `agentsecrets env`, mode 2 gives you the cloud sync and team sharing benefits of AgentSecrets while still producing the `.env` files your tooling expects.

**Security considerations:**

Mode 2 creates `.env.{environment}` files on disk after each pull. These files contain plaintext values. Though mode 2 also automatically adds the `.env.{environment}` to your `.gitignore` on first use, ensure you verify this is the case before pushing to the remote repository. Do not use mode 2 in projects where an AI agent has filesystem access to the project directory, and delete the files when they are no longer needed rather than leaving them on disk indefinitely.

---

## Setting your default mode

On first-time setup, `agentsecrets init` prompts you to choose a storage mode and stores your choice as the default for future projects. You can override the default per project with the `--storage-mode` flag.

```bash
agentsecrets init --storage-mode 1
agentsecrets init --storage-mode 2
```

---

## Storage mode and cloud sync

Both modes use the same zero-knowledge cloud sync. Secrets are encrypted client-side before upload regardless of storage mode. The server holds ciphertext in both cases. The difference is only in what happens locally after a pull: mode 1 writes to the keychain only, mode 2 writes to the keychain and to `.env.{environment}` on disk.

---

## Checking your current storage mode

```bash
cat .agentsecrets/project.json
```

The `storage_mode` field shows the current mode for the active project. This file is local to your project directory.

---

## Mode 1 vs Mode 2 Summary

| | Mode 1: Keychain Only | Mode 2: Keychain + .env |
|---|---|---|
| Secrets on disk | Never | Yes — `.env.{environment}` after pull |
| Agent filesystem access risk | None | Present |
| Framework `.env` compatibility | Requires proxy or `agentsecrets env` | Native |
| Recommended for production | Yes | With caution |
| Recommended when agent has filesystem access | Yes | No |
| `.env.example` generated | Yes (names only, no values) | Yes (names only, no values) |