# Switching the Active Environment

## The switch command

```bash
agentsecrets environment switch <environment>
```

Switches the active environment for the current project.

Valid environments are `development`, `staging`, and `production`. Anything else is rejected with an error listing the valid options.

## Examples

Switch to staging:

```bash
agentsecrets environment switch staging
```

Switch to production:

```bash
agentsecrets environment switch production
```

After switching, all environment-aware commands operate against the selected environment by default.


## What changes when you switch

Switching environments changes:

- which secrets the proxy resolves
- which cloud blobs `push` and `pull` operate on
- which secrets `set`, `get`, and `delete` modify
- which `.env.{environment}` file is read or written in Standard mode

The active environment becomes the default context for all subsequent CLI operations in that project directory.

## Project-local behavior

The switch command writes the selected environment to `.agentsecrets/project.json` inside the current project directory. This means environment selection is project-local, not terminal-local. Two different project directories can remain pinned to different environments simultaneously without conflicting with each other.

Example:

```text
~/payments-api     → production
~/mobile-app       → development
```

Changing environments in one project does not affect the other. The selected environment is also written to global config as a fallback when no project-local configuration exists.

## Proxy behavior

The proxy automatically begins resolving secrets from the new environment immediately after switching. No proxy restart is required.

Example:

```bash
agentsecrets environment switch staging
```

Subsequent proxy requests now resolve staging credentials automatically.

## Pulling secrets after switching

Switching environments changes the active context, but does not automatically download secrets for that environment. To fetch the latest secrets locally after switching:

```bash
agentsecrets secrets pull
```

> [TIP]
> Run `agentsecrets secrets pull` after switching environments to sync the latest secrets locally.


## Verifying the active environment

```bash
agentsecrets status
```

The active environment is always shown in the status output. Verify the current environment before operations that modify or delete secrets, especially in production workflows.





