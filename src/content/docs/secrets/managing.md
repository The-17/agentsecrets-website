# Managing Secrets

Secrets are named credentials stored in your OS keychain, scoped to a project and environment. This page covers the day-to-day operations: setting, listing, and deleting secrets.

---

## Setting a secret

```bash
agentsecrets secrets set KEY_NAME=value
```

The value goes directly to the OS keychain for the active workspace, project, and environment. It is never written to disk in plaintext and never sent to the AgentSecrets server in plaintext.

Set multiple secrets at once:

```bash
agentsecrets secrets set STRIPE_KEY=sk_live_... OPENAI_KEY=sk-proj-... GITHUB_TOKEN=ghp_...
```

Set the same value across all three environments simultaneously:

```bash
agentsecrets secrets set ANALYTICS_KEY=value --all-envs
```

This prompts for confirmation before writing to all three environments.

---

## Listing secrets

```bash
agentsecrets secrets list
```

Lists key names only, never values. The output shows cross-environment coverage so you can see which keys are missing in which environments without switching context:

```
Environment: development

KEY             DEV   STAGING   PROD
STRIPE_KEY       ✓       ✓        ✓
OPENAI_KEY       ✓       ✓        ✗  ← missing in production
DATABASE_URL     ✓       ✗        ✗  ← missing in staging and production
```


## Deleting a secret

```bash
agentsecrets secrets delete KEY_NAME
```

Removes the secret from the active environment only. This is permanent. To delete from all environments, switch and delete for each:

```bash
agentsecrets environment switch development
agentsecrets secrets delete OLD_KEY

agentsecrets environment switch staging
agentsecrets secrets delete OLD_KEY

agentsecrets environment switch production
agentsecrets secrets delete OLD_KEY
```

Or use `agentsecrets environment clean` to remove all secrets in the current environment at once.

---

## Naming conventions and best practices

Key names are uppercase strings with underscores as separators. This matches the convention used by most external API providers and environment variable standards.

Good names:
```
STRIPE_KEY
OPENAI_API_KEY
GITHUB_TOKEN
SENDGRID_API_KEY
DATABASE_URL
```

Keep names consistent across environments. If `STRIPE_KEY` is the name in development, it should be `STRIPE_KEY` in staging and production too. The cross-environment coverage view in `secrets list` relies on matching names — inconsistent naming creates false gaps.

Use names that identify the service. `API_KEY` is ambiguous when you have ten secrets. `STRIPE_LIVE_KEY` is not.

Do not encode the environment in the key name. You do not need `STRIPE_KEY_PRODUCTION` — the active environment context already scopes which value is resolved.