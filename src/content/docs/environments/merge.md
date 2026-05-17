# Merging Environments


## The merge command

```bash
agentsecrets environment merge <source> <destination>
```

Merge is designed for situations where two environments should contain the same keys, but different values. The most common workflow is promoting staging into production while replacing test credentials with live production credentials.

Unlike `copy`, merge does not blindly duplicate values between environments.


## When to merge

Use merge when:

- the destination environment already exists
- production credentials differ from staging credentials
- you want to preserve existing destination secrets unless explicitly updated
- you want controlled, per-key promotion

Typical example:

```text
staging    → test Stripe keys
production → live Stripe keys
```

Both environments contain the same keys, but the values must remain different.

## Running a merge

```
agentsecrets environment merge staging production
```

For each key in staging, the CLI prompts you to enter the production value. Press Enter to skip a key and leave its existing production value unchanged.

```bash
Enter production values for each key (press Enter to skip):

STRIPE_KEY (staging: sk_test_***): sk_live_51H...
OPENAI_KEY (staging: sk-proj-***): (skipped)
DATABASE_URL (staging: pos***): postgresql://prod-host/db
```
Pressing Enter without typing a value skips that key.

> [NOTE]
> Only keys that exist in both environments are prompted for. New keys in staging are ignored, and existing keys in production that are not present in staging are preserved. 


## How merge works

Merge only operates on keys that exist in both environments.

Behavior summary:

| Situation | Behavior |
| --- | --- |
| Key exists in source and destination | Prompt for new destination value |
| Key exists only in source | Ignored |
| Key exists only in destination | Preserved |
| Prompt skipped | Existing destination value remains unchanged |

Merge never deletes keys. Merge never automatically copies source values into the destination. Every update requires explicit user input.


## Prompting behavior

Each prompt includes:
- the key name
- a masked preview of the source value
- an input field for the destination value

Example:

```text
STRIPE_KEY (staging: sk_test_***):
```

The masked preview exists only to help identify the credential being replaced without exposing the full value.


## Safety guarantees
Skipped keys retain whatever value they currently have in the destination environment, or remain unset if they have never been configured there.

Merge never deletes keys from the destination, it only adds or updates keys you explicitly provide a value for during the prompt.

This makes merge a safe operation when you only want to promote a subset of the source environment.


## Typical production workflow

```bash
agentsecrets environment switch production
agentsecrets environment merge staging production
agentsecrets secrets pull
```

This keeps production aligned structurally with staging while preserving production-specific credentials.
