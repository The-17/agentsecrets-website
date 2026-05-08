# Storage modes

AgentSecrets supports two storage modes. You have the option choose the mode when you initialize a project.


**Storage mode 1: keychain only (default and recommended)**

Secrets live in the OS keychain. No `.env` files are created or read. `secrets pull` writes to the keychain. `secrets push` reads from the keychain. This is the recommended mode for any project where an AI agent has filesystem access, because there is nothing on disk for it to find.

```bash
agentsecrets init --storage-mode 1
```


**Storage mode 2: keychain and .env**

Secrets live in the keychain and are also written to `.env.{environment}` files on `secrets pull`. `secrets push` reads from `.env.{environment}` or falls back to `.env`. This mode exists for frameworks and tools that need environment variables at startup and cannot use the proxy.

```bash
agentsecrets init --storage-mode 2
```

The storage mode is set at project initialization and stored in `.agentsecrets/project.json`. It does not change after init unless you reinitialize the project.

On first-time setup, `agentsecrets init` asks which mode you prefer and stores that as your default for future projects. You can override the default per project with the `--storage-mode` flag.
