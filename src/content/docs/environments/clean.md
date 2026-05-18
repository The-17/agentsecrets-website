# agentsecets enviCleaning an Environment

## The clean command

```bash
agentsecrets environment clean
```

`clean` deletes all secrets in the active environment, from the OS keychain locally and from the cloud.


## When to use clean

Clean is useful when decommissioning a project, resetting a test environment to a known empty state, or removing stale secrets from an environment that is no longer in use. 

It is not the right tool for removing individual secrets, use `agentsecrets secrets delete KEY` for that.

## What clean does not remove

Clean does not affect:
- other environments
- workspace configuration
- project configuration
- allowlists
- encryption keys
- team membership
- project metadata

Only secrets in the currently active environment are deleted.


## Safety confirmation
Because clean is destructive, confirmation is required before deletion proceeds.

Example:

```text
This will permanently delete all 12 secrets in production.
This cannot be undone. Continue? (y/n):
```

Typing `y` proceeds. Anything else cancels the operation.


## Irreversible operation
Clean is permanent, there is no undo. Deleted secrets cannot be recovered from AgentSecrets. If teammates have already pulled the secrets to their local keychains, those copies remain. Clean only removes the cloud blobs and your local keychain entries.


## Typical cleanup workflow

```bash
agentsecrets environment switch staging
agentsecrets environment clean
```

This resets the staging environment back to an empty state while leaving development and production untouched.