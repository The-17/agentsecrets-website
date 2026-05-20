# Environments

Every AgentSecrets project has three built-in environments: `development`, `staging`, and `production`. They exist from the moment a project is created, empty until secrets are added. Environments are a first-class concept — the proxy, sync, and all secrets commands are environment-aware by default.

---

## Why environments exist

Different environments need different credential values. Your development Stripe key should be a test key. Your production Stripe key should be a live key. If those two values could ever be confused, you either charge real money in testing or test against live data in production.

AgentSecrets makes this confusion structurally impossible. The same key name in different environments is a different keychain entry. The proxy resolves the right one based on the active environment. Switching environments is one command — nothing else needs to change.

---

## Development, staging, and production as first-class concepts

The three environments are not user-defined labels — they are built-in. Every project has all three from the start. This design choice is intentional: it removes the question "how should I name my environments?" and ensures the tooling can make sensible defaults (development is the default active environment, `environment merge` prompts for new values when moving to production, and so on).

You cannot add custom environments or rename the three built-in ones. If your workflow has more stages, map them to the three built-in environments or use separate projects.

---

## How the active environment affects the proxy

The active environment determines which keychain entries the proxy reads when resolving a key name. When you run `agentsecrets proxy start`, the proxy reads the active environment from your project config. Every request it handles resolves secrets for that environment.

Changing the active environment and restarting the proxy changes which credentials are injected without changing any code.

---

## Environment resolution order

When AgentSecrets needs to determine the active environment, it checks in this order:

:::step
1. `AGENTSECRETS_ENV` environment variable — highest priority, intended for CI/CD pipelines
2. `.agentsecrets/project.json` in the current directory — per-project, set by `agentsecrets environment switch` from that project root
3. Global config `selected_environment` — fallback across all projects
4. `development` — hardcoded default if none of the above is set
:::

Each project directory can pin its own environment. Running `agentsecrets environment switch production` from a project directory writes to that project's `project.json`, not globally. A different terminal window working in a different project directory is unaffected.

---

## Environment-specific secrets

Secrets are always stored per environment. Setting a secret sets it in the active environment only:

```bash
agentsecrets environment switch development
agentsecrets secrets set STRIPE_KEY=sk_test_...

agentsecrets environment switch production
agentsecrets secrets set STRIPE_KEY=sk_live_...
```

These are two independent keychain entries. To set the same value across all three environments at once:

```bash
agentsecrets secrets set ANALYTICS_KEY=value --all-envs
```

---

## Cross-environment visibility

`agentsecrets secrets list` shows coverage across all three environments so you can spot gaps without switching context:

```
Environment: development

KEY              DEV    STAGING    PROD
STRIPE_KEY        ✓       ✓         ✓
OPENAI_KEY        ✓       ✓         ✗   ← missing in production
DATABASE_URL      ✓       ✗         ✗   ← missing in staging and production
```

To see exactly what is missing between two environments:

```bash
agentsecrets secrets diff --from development --to production
# In development but missing in production:
#   OPENAI_KEY
#   DATABASE_URL
```
