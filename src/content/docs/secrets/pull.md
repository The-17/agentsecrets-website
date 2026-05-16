# Pulling from Cloud Sync

```bash
agentsecrets secrets pull
agentsecrets secrets pull --force
```

## What pull does

`pull` downloads the encrypted blobs from the cloud for the active environment, decrypts each one using your workspace key, and writes the values to your local storage. It is how you get secrets onto a new machine or pick up changes a teammate pushed.


## Syncing to the OS keychain

In storage mode 1, pull writes directly to the OS keychain. No file is created on disk. The decrypted values exist only in the keychain, scoped to your user account.
In storage mode 2, pull writes to the OS keychain and also writes the decrypted values to `.env.{environment}` in your project root. In both modes, pull generates `.env.example` with key names and environment annotations but no values, this file is safe to commit.


## Pulling a specific environment

Pull operates on the active environment only. To pull for a specific environment:

```bash
agentsecrets environment switch staging
agentsecrets secrets pull
```

## What happens when remote is newer

If a key already exists locally with a different value, the CLI shows the conflicting keys and asks you to choose: overwrite all, pull only missing keys, or cancel. Use `--force` to skip and overwrite everything. Pull is safe to run repeatedly, it is idempotent.


### Flags

| Flag | Short | Description |
| :---       | :--- | :--- |
| `--force`     | `-f` | Overwrite local values without prompting for conflict resolution. |



