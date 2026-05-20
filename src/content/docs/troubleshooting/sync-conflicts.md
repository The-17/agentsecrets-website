---
title: Resolving Secret Sync Conflicts
description: How to manage, debug, and resolve cryptographic synchronization conflicts between your local keychain and the AgentSecrets cloud.
---

# Resolving Secret Sync Conflicts

AgentSecrets relies on an end-to-end encrypted synchronization model. Your secrets are encrypted locally and synced to the cloud (SecretsAPI). Occasionally, if multiple team members edit the same secret simultaneously, or if you work offline, you may encounter a sync conflict.

## How Synchronization Works

AgentSecrets synchronizes your active environment (`development`, `staging`, or `production`) with the cloud. 
- The local state is stored in your OS keychain.
- The cloud state acts as the source of truth for your team.
- The proxy maintains a **continuous 10-second background sync cycle** that automatically pulls down cryptographic revocations.

> [NOTE]
> All cloud sync operations use `pkg/crypto`. AgentSecrets never uploads plaintext secrets; everything is encrypted with your workspace's master key before leaving your machine.

## Identifying Sync Conflicts

If your local environment diverges from the cloud, the CLI will alert you during a push or pull operation. You might also notice discrepancies when running:
```bash
agentsecrets secrets list
```
This command shows key names and their current sync status (e.g., `Synced`, `Pending Push`, `Conflict`).

## Forcing a Manual Sync

If you suspect your local proxy hasn't picked up a recently updated or revoked key, you can force an immediate cryptographic revocation sync:
```bash
agentsecrets proxy sync
```
This command instantly updates your local proxy's cached state. If a teammate compromised or revoked a key globally, this ensures your proxy will immediately blackhole outbound calls using that key.

## Resolving Push/Pull Conflicts

When running `agentsecrets secrets push` or `secrets pull`, you might encounter a version mismatch:

:::step
1. **Pulling Remote Changes:** If the remote version is newer, pulling will safely update your local keychain.
   ```bash
   agentsecrets secrets pull
   ```
2. **Pushing Local Changes:** If you modified a secret locally but another teammate pushed a newer version, your push will be rejected. You must pull the latest changes first, re-apply your update locally, and then push.
:::

> [CAUTION]
> Avoid manually deleting keys from the OS keychain directly via macOS Keychain Access or Windows Credential Manager. Always use `agentsecrets secrets delete` to ensure the deletion and revocation are cryptographically synced to the cloud.
