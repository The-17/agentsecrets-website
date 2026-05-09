# Environments

Every project has three built-in environments: `development`, `staging`, and `production`. They exist from the moment the project is created, empty until secrets are added.

```bash
agentsecrets environment switch production
agentsecrets environment list

#   development   12 secrets
#   staging        8 secrets
#   production    12 secrets   ← active
```

The active environment determines which secrets the proxy resolves, which cloud blobs are synced, and which `.env` file is read or written in storage mode 2. Switching environments is one command. Everything downstream adjusts automatically.

## Environment resolution order

When any command needs to know the active environment, it checks in this order:

1. `AGENTSECRETS_ENV` environment variable — highest priority, for CI/CD pipelines
2. `.agentsecrets/project.json` environment field — per-directory, set by `agentsecrets environment switch` from that project root
3. Global config `selected_environment` — fallback across all projects
4. `development` — hardcoded default if none of the above is set

This means each project directory can pin its own environment. Running `agentsecrets environment switch production` from a project directory writes to that project's `project.json`, not globally. A different terminal window in a different project directory is unaffected.

## Cross-environment operations

```bash
# Copy all secrets from development to staging with the same values
agentsecrets environment copy development staging

# Prompt for new values for each key when moving to production
# (useful when production keys differ from staging keys)
agentsecrets environment merge staging production

# See which keys exist in development but are missing in production
agentsecrets secrets diff --from development --to production

# In development but missing in production:
#   OPENAI_KEY
#   DATABASE_URL
```

## The secrets list coverage view

`agentsecrets secrets list` shows key coverage across all three environments so you can spot gaps without switching context:

```
Environment: development

KEY             DEV   STAGING   PROD
STRIPE_KEY       ✓       ✓        ✓
OPENAI_KEY       ✓       ✓        ✗   ← missing in production
DATABASE_URL     ✓       ✗        ✗   ← missing in staging and production
```
