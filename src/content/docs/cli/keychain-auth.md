---
title: "Keychain Auth Integration"
description: "How AgentSecrets integrates with the operating system keychain to securely persist authentication state without relying on plaintext files."
---

# Keychain Auth Integration

Starting with **v2.0.0**, `agentsecrets` integrates directly with your operating system's native keychain (such as macOS Keychain, Windows Credential Manager, or Linux Secret Service) to securely persist your authentication tokens.

## Why Keychain Auth?

Before v2.0.0, authentication tokens might be stored in a plaintext configuration file (e.g., `~/.config/agentsecrets/auth.json`). While convenient, this meant any process running as your user could read the token.

By moving to a keychain-based approach:
- **Tokens are encrypted at rest** by the OS.
- **Access is managed** by the OS (e.g., prompting for your password if a new binary requests access).
- **No plaintext credentials** exist on disk.

## How It Works

When you run `agentsecrets login`:
1. The CLI authenticates you with the AgentSecrets cloud.
2. The returned authentication token is handed to a background daemon (`keychain-auth`).
3. The daemon securely stores the token in the OS keychain.
4. Subsequent commands (like `agentsecrets env` or `agentsecrets push`) communicate with this daemon via a secure Unix domain socket (or named pipe on Windows) to retrieve the token temporarily in memory.

## Platforms Supported

- **macOS**: Apple Keychain
- **Windows**: Windows Credential Manager
- **Linux**: Secret Service API (GNOME Keyring, KWallet), or an encrypted fallback if no Secret Service is available.

## Troubleshooting

If you encounter a `401 Unauthorized` or experience issues with the keychain-auth daemon:
1. Try running `agentsecrets login` again to refresh the token and re-initialize the daemon.
2. Ensure you have the necessary OS permissions for the keychain (e.g., unlocked GNOME keyring on Linux).
3. If the daemon process is hung, you can manually kill the `keychain-auth` process and run `agentsecrets login` to restart it.
