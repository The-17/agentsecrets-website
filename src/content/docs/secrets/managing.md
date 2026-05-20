# agentsecrets secrets: Manage your credentials

The `agentsecrets secrets` commands let you store, retrieve, sync, and audit credentials for your active project. Every value is encrypted client-side with AES-256-GCM before it leaves your machine. The server only stores ciphertext it structurally cannot decrypt. Your agents reference key names; they never hold the values.

---

## Secret workflow

Most workflows follow the same lifecycle:

:::step
1. Set a secret
2. The value is encrypted locally
3. The encrypted blob syncs to the cloud
4. The proxy resolves the value at runtime
5. Agents reference the key name, not the value
:::

Secrets are always scoped to:
- a project
- an environment
- a key name

The same key name can exist with different values across `development`, `staging`, and `production`.

## Setting a secret
Store or update one or more secrets use the `secrets set` command. Values are encrypted locally before being sent to the cloud.

### Usage

```bash
agentsecrets secrets set KEY_NAME=value
```

Set multiple secrets at once:

```bash
agentsecrets secrets set STRIPE_KEY=sk_live_... OPENAI_KEY=sk-proj-... GITHUB_TOKEN=ghp_...
```

Set the same value across all three environments simultaneously:

```bash
agentsecrets secrets set ANALYTICS_KEY=value --all-envs
```

This prompts for confirmation before writing to all three environments.

### What happens internally
:::step
1. The CLI reads your workspace encryption key from `~/.agentsecrets/config.json`.
2. Encrypts each value locally using `AES-256-GCM`.
3. Sends the encrypted blob to the AgentSecrets API, the server stores the blob only.
4. If your storage mode is Keychain, also writes the value to your OS keychain.
:::


### Flags
| Flag | Description |
| --- | --- |
| `--all-envs` | Set the secret in all three environments (development, staging, production) simultaneously. Prompts for confirmation. |

---


## Listing secrets

```bash
agentsecrets secrets list
```

Lists key names only, never values. The output shows cross-environment coverage so you can see which keys are missing in which environments without switching context:

```
Environment: development

Key              DEV  STAGING  PROD
DATABASE_URL      *      *      *
OPENAI_KEY        *      *      -
SENDGRID_KEY      *      -      -
STRIPE_KEY        *      *      *

Showing cached keys. Use --remote for latest from cloud.
```

`*` means the key is present in that environment; `-` means it is absent.

### Flags
| Flag | Description |
| --- | --- |
| `--remote`    | Fetch the latest key list from the cloud instead of the local cache (OS Keychain). |



## Deleting a secret

```bash
agentsecrets secrets delete KEY_NAME
```

Deletes a secret from the active environment. The CLI removes the key from:
- the remote API
- your OS keychain (Keychain mode)
- your `.env` file (Standard mode)

When your active environment is `production`, you are prompted to confirm before the deletion proceeds.

### Usage
```bash 
agentsecrets secrets delete KEY
```


> [NOTE]
> This is permanent. To delete from all environments, switch and delete for each:
> ```bash
> agentsecrets environment switch development
> agentsecrets secrets delete OLD_KEY
> ```
>
> Or use `agentsecrets environment clean` to remove all secrets in the current environment at once.

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

Do not encode the environment in the key name. You do not need `STRIPE_KEY_PRODUCTION`, the active environment context already scopes which value is resolved.


## Full Command Reference

```bash
agentsecrets secrets set [KEY=value ...] [--all-envs]
agentsecrets secrets list [--remote]
agentsecrets secrets delete KEY [--all-envs]
agentsecrets secrets pull
agentsecrets secrets push
agentsecrets secrets diff

```

