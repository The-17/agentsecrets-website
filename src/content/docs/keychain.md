# OS Keychain

AgentSecrets stores credentials in your operating system's native secure credential store, not in a file, not in a database, definitely not in an environment variable.

| Platform | Storage Backend | Encryption |
|---|---|---|
| macOS | macOS Keychain (Security framework) | AES-256-GCM via Secure Enclave |
| Linux | libsecret / Secret Service API | GNOME Keyring or KDE Wallet |
| Windows | Windows Credential Manager | DPAPI (user-scoped) |

Keychain entries are scoped to your user account. Other processes running as the same user cannot read them without your authentication. This is a fundamentally different security boundary from a `.env` file or an environment variable, which any process running as the same user can read freely.

### Keychain key format

AgentSecrets stores each secret under a compound key that includes workspace, project, environment, and secret name:

```bash
workspace_id:project_id:environment:key_name
```

For example, a secret named `STRIPE_KEY` in the `production` environment of project `payments-service` in workspace `ws_01HABC` is stored as:

```
ws_01HABC:proj_01HDEF:production:STRIPE_KEY
```

This means the same key name in different environments is stored as a separate keychain entry. Switching environments switches which entry the proxy reads. There is no risk of a development credential being resolved when you are running in production context.
