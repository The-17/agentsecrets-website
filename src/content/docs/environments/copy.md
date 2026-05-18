# Copying an Environment

## The copy command

```bash
agentsecrets environment copy <source> <destination>
```

Copy duplicates all secrets from one environment into another. Unlike `merge`, copy transfers both key names and values exactly as they exist in the source environment.

---


## When to use copy

Copy is useful when a destination environment should begin as an exact clone of another environment.

Common use cases:
- creating staging from development
- bootstrapping production from staging
- resetting a test environment
- synchronizing environments during early project setup

Example:

```text
development → staging
```

Both environments end up containing the same keys and values.


## Running a copy

```bash
agentsecrets environment copy development staging
```

This will copy all the keys from the development environment to the staging environment. If any keys already exist in the staging environment, you are prompted to confirm before overwriting:

```
This will overwrite 8 existing secrets in staging. Continue? (y/n):
```

Typing `y` proceeds with the copy. Anything else cancels the operation.

---

## What is copied
- Key names
- Encrypted values


### What is NOT copied:
- Domain allowlist (workspace-scoped)
- project configuration
- environment selection state
- `.agentsecrets/project.json`
- global CLI configuration

Only environment-scoped secrets are transferred.


## Overwrite behavior

If a key already exists in the destination environment, the copied value replaces it.

Example:

```text
development → STRIPE_KEY=sk_test_abc
staging     → STRIPE_KEY=old_value
```

After copy:

```text
staging → STRIPE_KEY=sk_test_abc
```

This operation affects all matching keys automatically.


## Copy vs merge

Use `copy` when the destination should become an exact duplicate.
Use `merge` when the destination should keep its own environment-specific values.

Typical guidance:
| Command | Behavior |
| --- | --- |
| `copy` | Same keys, same values |
| `merge` | Same keys, different values |


## Typical setup workflow

```bash
agentsecrets environment copy development staging
agentsecrets environment switch staging
agentsecrets secrets pull
```

This creates a staging environment identical to development as a starting point.