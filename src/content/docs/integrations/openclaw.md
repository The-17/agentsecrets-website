# OpenClaw

AgentSecrets ships as a native exec provider for OpenClaw's SecretRef system (OpenClaw v2026.2.26 and later). 

## Installation

```bash
# Install from ClawHub
openclaw skill install agentsecrets
```

### Verify

```bash
openclaw skill list | grep agentsecrets
# agentsecrets ✓ active
```

## How it works

When your OpenClaw workflow references a credential via SecretRef, OpenClaw calls the AgentSecrets binary directly using `agentsecrets exec`. The value is resolved from the OS keychain at execution time and injected into the request. The calling skill never sees the credential value and nothing is written to any OpenClaw config file.

`agentsecrets exec` is called internally by OpenClaw. You do not invoke it manually.

## The exec provider

```bash
agentsecrets exec
```

This is the command OpenClaw calls internally when it encounters a SecretRef. You do not call it manually in normal usage, OpenClaw handles the invocation.

## What this means for your workflow

You do not need to configure credentials in `~/.openclaw/.env` or any OpenClaw config file. When your workflow references a secret by name, OpenClaw calls `agentsecrets exec`, which reads the SecretRef from stdin, resolves the value from the OS keychain, and returns the injected result. The calling OpenClaw skill never sees the credential value.

## Using agentsecrets env with OpenClaw

For OpenClaw workflows that need credentials as environment variables rather than via SecretRef:

```bash
agentsecrets env -- openclaw run my-workflow
```

The workflow starts with credentials available as environment variables in its execution environment. Nothing is written to any OpenClaw config.
