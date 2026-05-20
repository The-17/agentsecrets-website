# agentsecrets environment: Switch and manage environments

Environments define how AgentSecrets stores, resolves, and injects secrets across the CLI. Every secrets operation runs against an environment, whether explicitly specified or automatically inferred from context.

The CLI is environment-aware by default.

---

## The active environment

At any moment, AgentSecrets has one active environment for the current project:

- `development`
- `staging`
- `production`

Most commands operate against the active environment automatically:

```bash
agentsecrets secrets set OPENAI_KEY=...
agentsecrets secrets get OPENAI_KEY
agentsecrets proxy start
```

These commands use the currently active one.

---

## Switching environments

Use `environment switch` to change the active environment for the current project:

```bash
agentsecrets environment switch staging
```

This updates the project's local configuration so future commands run against that environment automatically.

You can verify the current environment with:

```bash
agentsecrets environment list
```
or
```bash
agentsecrets status
```

---

## Environment-aware secret storage

Secrets with the same key name are isolated per environment. This means:

```text
# development
OPENAI_KEY=sk_test_...

# production
OPENAI_KEY=sk_live_...
```

are treated as completely separate entries. Changing environments changes which value the CLI reads, updates, syncs, and injects.


---

## How the proxy uses environments

The proxy always resolves secrets from the active environment.

If the active environment is `staging`, every secret request handled by the proxy resolves against staging values.

Switching environments changes runtime credential injection without changing application code.

---

## Environment resolution

When the CLI needs to determine which environment to use, it resolves in this order:

:::step
1. `AGENTSECRETS_ENV` environment variable
2. Project configuration
3. Global configuration
4. `development`
:::

This allows CI pipelines, local projects, and interactive sessions to coexist without conflicting state.

---

## Cross-environment workflows

AgentSecrets includes commands designed for comparing and managing environment coverage.

Examples:

```bash
agentsecrets secrets diff --from development --to production
```

```bash
agentsecrets secrets list
```

These commands help identify missing keys before deployment.

---

## Default behavior

New projects always start in the `development` environment.

All three environments exist immediately when a project is created, even before any secrets are added. No additional setup is required before using environment-aware commands.
