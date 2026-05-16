# Diffing secrets

```bash
agentsecrets secrets diff
```

Compare your local secrets against what is stored in the cloud, or compare two environments directly.

### Usage
```bash
# Compare local vs. active cloud environment
agentsecrets secrets diff

# Compare two environments
agentsecrets secrets diff --from development --to production
```

### Flags

| Flag | Description |
| :--- | :--- |
| `--from <env>` | Source environment for a cross-environment diff. |
| `--to <env>` | Target environment for a cross-environment diff. |

**What the output shows**

- **In source but missing in target** — present on your machine (or in the source environment), not yet pushed or copied.
- **In target but missing in source** — in the cloud (or target environment), not yet pulled or copied.
- **In both but values differ** — key exists in both places but the values have drifted.
- **In both and identical** — fully synced.

Values are never shown. Only key names and their sync status appear.

```
SECRETS:

  In Local but missing in Development:
    NEW_KEY

  In Development but missing in Local:
    DEPRECATED_KEY

  In both but values differ:
    DATABASE_URL

  In both and identical:
    OPENAI_KEY
    STRIPE_KEY

Run agentsecrets secrets push to upload local changes.
Run agentsecrets secrets pull to sync from cloud.
```

Run `secrets diff` before a deployment, before pushing, or to debug sync issues between environments.

