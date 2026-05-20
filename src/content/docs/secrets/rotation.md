# Secret Rotation

> [NOTE]
> **COMING SOON**: This feature or documentation page is currently in development. Automated secret rotation is on the roadmap and not yet available.


## What rotation will cover

When shipped, rotation will handle the full cycle of replacing a credential with a new value:
:::step
1. Generating the new value where the provider API supports it
2. Updating the encrypted blob in the cloud
3. Syncing to all connected machines
4. Ensuring agents pick up the new value without interruption
:::


## Current manual rotation workflow

At present, rotation is a manual process that follows these steps:
:::step
1. Generate a new secret using your provider's API or UI
2. Update it in AgentSecrets with `agentsecrets secrets set KEY_NAME=new_value`
3. Push to cloud with `agentsecrets secrets push`
4. Teammates pull the new value with `agentsecrets secrets pull`
5. Revoke the old credential on the provider side
:::

The proxy reads from the keychain on every call, so agents pick up the new value immediately after step 2 with no restart required.


## Roadmap for automated rotation

Automated rotation will support provider integrations for common services, scheduled rotation policies, overlap windows for in-flight requests during rotation, and team notifications when a rotation occurs.

