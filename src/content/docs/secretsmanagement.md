# Secrets Management

### Storing secrets

```bash
agentsecrets secrets set STRIPE_KEY=sk_live_...
agentsecrets secrets set OPENAI_KEY=sk-proj-...

# Set the same value across all three environments simultaneously
agentsecrets secrets set ANALYTICS_KEY=value --all-envs
```

### Listing secrets

Key names only. Never values.

```bash
agentsecrets secrets list
```

Output shows cross-environment coverage:

```
Environment: development

KEY             DEV   STAGING   PROD
STRIPE_KEY       ✓       ✓        ✓
OPENAI_KEY       ✓       ✓        ✗
DATABASE_URL     ✓       ✗        ✗
```

### Syncing with the cloud

```bash
# Push local secrets to cloud (encrypted before upload)
agentsecrets secrets push

# Pull cloud secrets to local OS keychain
agentsecrets secrets pull

# See what is out of sync
agentsecrets secrets diff

# Cross-environment diff
agentsecrets secrets diff --from development --to production
```

### Deleting secrets

```bash
agentsecrets secrets delete OLD_KEY
```

Deleting from the active environment only. To delete from all environments, switch environments and delete separately, or use `agentsecrets environment clean` to remove all secrets in the current environment.

---

## Secrets Drift Detection

`agentsecrets secrets diff` compares your local keychain against the cloud for the active environment and reports what is out of sync.

```bash
agentsecrets secrets diff

# LOCAL ONLY:  NEW_KEY
# REMOTE ONLY: DEPRECATED_KEY
# DIFFERS:     DATABASE_URL (remote is newer)
```

Local-only means the secret exists in your keychain but has not been pushed to cloud. Remote-only means it exists in cloud but you have not pulled it. Differs means the encrypted blob in cloud is newer than what you have locally.

Running `agentsecrets secrets pull` resolves all three states.
