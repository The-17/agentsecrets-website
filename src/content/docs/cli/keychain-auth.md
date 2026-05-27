---
title: "keychain-auth Subsystem"
description: "How the keychain-auth daemon secures the operating system keychain against process impersonation and rogue scripts."
---

# keychain-auth Subsystem

The `keychain-auth` daemon is the capability-bounding security subsystem of AgentSecrets. Rather than just acting as a bridge to the operating system's native keychain (such as macOS Keychain, Windows Credential Manager, or Linux Secret Service), it enforces strict **Process Identity Verification** and **Anti-Impersonation**.

---

## The Security Problem it Solves

In standard secrets managers, keychain access is wide open to any process running under your user session. If a user is logged in, any random shell script, third-party dependency, or rogue tool can invoke the secrets CLI or query the keychain directly to retrieve raw values.

AgentSecrets blocks this vector structurally via `keychain-auth`:
- **Cryptographic Binary Validation**: Before resolving any credential from the OS keychain, the `keychain-auth` daemon validates the cryptographic hash and executable path of the calling CLI binary.
- **Rogue Script Prevention**: If a malicious script attempts to call `agentsecrets secrets list` or impersonate the CLI, the daemon detects the hash mismatch and denies the request immediately.
- **Isolated Process Space**: All cryptographic decryption operations are isolated inside the daemon's RAM, completely hidden from other running processes.

---

## How It Works

Every credential request is guarded by a multi-stage validation handshake:

1. **Request Interception**: The AgentSecrets CLI or proxy daemon requests key resolution.
2. **Process Hash Attestation**: The request is routed to `keychain-auth` via a secure, local Unix domain socket (or named pipe on Windows).
3. **Identity Verification**: The daemon checks the caller's process ID (PID), traces the execution path back to the disk binary, and compares its cryptographic signature and hash against authorized records.
4. **Key Decryption**: Only if the binary identity is validated does the daemon fetch the encrypted Workspace Key, decrypt the requested secret locally, and inject it temporarily at the transport boundary.

---

## Supported Keychain Backends

AgentSecrets leverages native OS cryptographic storage APIs:
- **macOS**: Apple Keychain Service
- **Windows**: Windows Credential Manager & Data Protection API (DPAPI)
- **Linux**: Secret Service API (GNOME Keyring / KWallet) with a fallback to local, client-side encrypted storage if no graphical keyring is available.

---

## Troubleshooting

If you experience connection errors or handshake failures with the `keychain-auth` daemon:

1. **Verify Daemon Status**: Check if the background service is running:
   ```bash
   agentsecrets proxy status
   ```
2. **Restart the Subsystem**: If the daemon hangs or permissions change, restart it to re-initialize the socket connections:
   ```bash
   agentsecrets proxy stop
   agentsecrets proxy start
   ```
3. **Unlock Keyring (Linux)**: On headless Linux or CI environments, ensure your GNOME Keyring is unlocked, or set the environment storage mode to use local client-side encrypted vaults.
