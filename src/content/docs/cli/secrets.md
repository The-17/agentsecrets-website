# secrets

## agentsecrets secrets set
```bash
agentsecrets secrets set KEY=value
```
Stores a secret in the OS keychain for the active project and environment. The value goes directly to the keychain — never written to disk or sent to the server in plaintext.

```bash
agentsecrets secrets set KEY=value --all-envs
```
Sets the same value in all three environments simultaneously. Prompts for confirmation before proceeding.

## agentsecrets secrets get
```bash
agentsecrets secrets get KEY
```
Retrieves a secret value to your terminal. This is the one command that shows you the value — it is intended for the human developer, not for agents. Agents should never run this.

## agentsecrets secrets list
```bash
agentsecrets secrets list
```
Lists key names for the current project and environment. Shows cross-environment coverage so you can see which keys are missing in which environments. Never shows values.

## agentsecrets secrets delete
```bash
agentsecrets secrets delete KEY
```
Removes a secret from the active environment. Permanent.

## agentsecrets secrets push
```bash
agentsecrets secrets push
```
Uploads secrets to the cloud, encrypted client-side before upload.
Storage mode 1: reads from the OS keychain and pushes encrypted blobs to cloud.
Storage mode 2: reads from `.env.{environment}` (falls back to `.env`) and pushes to cloud.

## agentsecrets secrets pull
```bash
agentsecrets secrets pull
```
Downloads secrets from the cloud to the local OS keychain.
Storage mode 1: writes to the OS keychain only.
Storage mode 2: writes to the OS keychain and to `.env.{environment}`.
In both modes, generates `.env.example` with key names and environment annotations. Never contains values.

## agentsecrets secrets diff
```bash
agentsecrets secrets diff
```
Compares local state against cloud for the active environment.

```bash
agentsecrets secrets diff --from <env> --to <env>
```
Shows which keys exist in one environment but are missing in another. Does not compare values — only key name coverage.
