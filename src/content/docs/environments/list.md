# Listing Environments and Viewing Coverage

## The list command

```bash
agentsecrets environment list
```

Lists all environments for the active project, their secret counts, and the currently active environment.

Example output:

```text
development   12 secrets   ← active
staging        8 secrets
production    12 secrets
```

## What the output shows

The command displays:

- all three built-in environments
- the number of secrets stored in each environment
- which environment is currently active

Secret counts are fetched live from the API across all environments in parallel. This gives a quick operational overview of environment readiness without switching context.


## Understanding environment coverage


`agentsecrets secrets list` shows key coverage across all three environments alongside the secrets in the active environment:

```
Environment: development

Key              DEV  STAGING  PROD
DATABASE_URL      *      *      *
OPENAI_KEY        *      *      -
SENDGRID_KEY      *      -      -
STRIPE_KEY        *      *      *

Showing cached keys. Use --remote for latest from cloud.
```

Each row is a key name. Each column is an environment.

## Reading the coverage table

Coverage symbols:

| Symbol | Meaning |
| --- | --- |
| `*` | Key exists in that environment |
| `-` | Key is missing from that environment |

Example:

```text
OPENAI_KEY        *        *         -
```

This means development and staging have the key, but production does not.

## Identifying deployment gaps

Missing keys in staging or production usually indicate incomplete environment setup.

Example:

```text
SENDGRID_KEY      *        -         -
```

This means deployment workflows depending on `SENDGRID_KEY` will fail in staging and production until the secret is configured there. The coverage view makes these gaps visible immediately without requiring environment switching.


## Using diff for detailed comparison

For a more detailed comparison between two environments:

```bash
agentsecrets secrets diff --from development --to production
```

Example output:

```text
In development but missing in production:
  OPENAI_KEY
  DATABASE_URL
```

This is useful before deployments, environment promotion, or production rollouts.

## Typical verification workflow

```bash
agentsecrets environment list
agentsecrets secrets list
agentsecrets secrets diff --from staging --to production
```

This sequence verifies:
- which environment is active
- overall secret coverage
- exactly which keys are missing before deployment