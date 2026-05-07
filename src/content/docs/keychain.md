# OS Keychain Storage

AgentSecrets stores all credentials in your operating system's native secure credential store.

| Platform | Storage Backend | Encryption |
| :--- | :--- | :--- |
| macOS | macOS Keychain | AES-256-GCM via Secure Enclave |
| Linux | libsecret / Secret Service | GNOME Keyring or KDE Wallet |
| Windows | Credential Manager | DPAPI (user-scoped) |

> Keychain entries are scoped to your user account and cannot be read by other processes without your authentication.
