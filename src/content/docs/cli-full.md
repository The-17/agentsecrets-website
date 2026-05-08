# CLI Reference

---

## Account

```bash
agentsecrets init
```
Creates your account, generates encryption keys locally, and sets up your first workspace. On returning machines, detects existing accounts and walks you through joining your workspace. Accepts `--storage-mode 1` (keychain only) or `--storage-mode 2` (keychain and .env). Defaults to keychain only.

```bash
agentsecrets login
```
Authenticates an existing account on a new machine. Does not generate new keys — pulls your existing workspace key from the cloud after authentication.

```bash
agentsecrets logout
```
Clears the local session. Does not delete your keychain entries or cloud secrets.

```bash
agentsecrets status
```
Shows current user, workspace, project, environment, proxy status, and last sync time. Run this before any secrets operation to confirm you are in the right context.


## Workspaces

```bash
agentsecrets workspace create "Name"
```
Creates a new workspace. You are the admin.

```bash
agentsecrets workspace list
```
Lists all workspaces you belong to.

```bash
agentsecrets workspace switch "Name"
```
Switches the active workspace. All subsequent commands operate in this workspace.

```bash
agentsecrets workspace invite user@email.com
```
Sends an invitation to a teammate. They join by accepting the invitation and running `agentsecrets login`.

```bash
agentsecrets workspace promote user@email.com
agentsecrets workspace demote user@email.com
```
Grants or revokes admin role. Requires admin and password confirmation.


## Projects

```bash
agentsecrets project create NAME
```
Creates a project in the current workspace.

```bash
agentsecrets project list
```
Lists all projects in the current workspace.

```bash
agentsecrets project use NAME
```
Sets the active project. All secrets commands operate against this project.

```bash
agentsecrets project update NAME
```
Renames the project.

```bash
agentsecrets project delete NAME
```
Deletes the project and all its secrets. Permanent. Requires confirmation.


## Environments

```bash
agentsecrets environment switch <name>
```
Switches the active environment. Valid values: `development`, `staging`, `production`. Updates `.agentsecrets/project.json` in the current directory and the global config fallback. Invalid environment names are rejected with an error.

```bash
agentsecrets environment list
```
Lists all three environments and the number of secrets in each for the current project.

```bash
agentsecrets environment copy <from> <to>
```
Copies all secrets from one environment to another with the same values. Prompts for confirmation if the destination has existing secrets.

```bash
agentsecrets environment merge <from> <to>
```
Takes key names from the source environment and prompts for new values in the destination. Press Enter to skip a key. Useful when production values differ from staging values.

```bash
agentsecrets environment clean
```
Deletes all secrets in the current environment. Permanent. Requires confirmation.


## Secrets

```bash
agentsecrets secrets set KEY=value
```
Stores a secret in the OS keychain for the active project and environment. The value goes directly to the keychain — never written to disk or sent to the server in plaintext.

```bash
agentsecrets secrets set KEY=value --all-envs
```
Sets the same value in all three environments simultaneously. Prompts for confirmation before proceeding.

```bash
agentsecrets secrets get KEY
```
Retrieves a secret value to your terminal. This is the one command that shows you the value — it is intended for the human developer, not for agents. Agents should never run this.

```bash
agentsecrets secrets list
```
Lists key names for the current project and environment. Shows cross-environment coverage so you can see which keys are missing in which environments. Never shows values.

```bash
agentsecrets secrets delete KEY
```
Removes a secret from the active environment. Permanent.

```bash
agentsecrets secrets push
```
Uploads secrets to the cloud, encrypted client-side before upload.

Storage mode 1: reads from the OS keychain and pushes encrypted blobs to cloud.
Storage mode 2: reads from `.env.{environment}` (falls back to `.env`) and pushes to cloud.

```bash
agentsecrets secrets pull
```
Downloads secrets from the cloud to the local OS keychain.

Storage mode 1: writes to the OS keychain only.
Storage mode 2: writes to the OS keychain and to `.env.{environment}`.

In both modes, generates `.env.example` with key names and environment annotations. Never contains values.

```bash
agentsecrets secrets diff
```
Compares local state against cloud for the active environment.

```bash
agentsecrets secrets diff --from <env> --to <env>
```
Shows which keys exist in one environment but are missing in another. Does not compare values — only key name coverage.


## Proxy and Calls

```bash
agentsecrets proxy start
agentsecrets proxy start --port 9000
```
Starts the local proxy. Default port is 8765.

```bash
agentsecrets proxy stop
```
Stops the proxy.

```bash
agentsecrets proxy status
```
Shows whether the proxy is running, which port, and the current revocation list sync status.

```bash
agentsecrets proxy sync
```
Forces a background sync of the revocation list. Normally happens automatically.

```bash
agentsecrets proxy logs
agentsecrets proxy logs --last 20
agentsecrets proxy logs --watch
agentsecrets proxy logs --secret KEY_NAME
agentsecrets proxy logs --env production
```
Views or streams the local proxy audit log. Filters by key name or environment.

```bash
agentsecrets call --url URL --bearer KEY_NAME
agentsecrets call --url URL --method POST --bearer KEY_NAME --body '{...}'
agentsecrets call --url URL --header Header-Name=KEY_NAME
agentsecrets call --url URL --query param=KEY_NAME
agentsecrets call --url URL --basic KEY_NAME
agentsecrets call --url URL --body-field path=KEY_NAME
agentsecrets call --url URL --form-field field=KEY_NAME
```
Makes a single authenticated request through the proxy. All six injection styles are supported. Multiple injection flags can be combined in one call.

```bash
agentsecrets mcp serve
```
Starts the MCP server. Called by the MCP config — you do not run this manually.

```bash
agentsecrets mcp install
```
Auto-configures Claude Desktop and Cursor with the MCP server. Detects installation paths and writes configs automatically.

```bash
agentsecrets exec
```
OpenClaw exec provider. Reads a SecretRef from stdin, resolves the value from the OS keychain, injects it. Called by OpenClaw — you do not run this manually.

```bash
agentsecrets env -- <command> [args...]
```
Injects secrets as environment variables into a child process at spawn time. The parent process never holds the values.


## Audit Logs

```bash
agentsecrets log list
agentsecrets log list --tail
agentsecrets log list --agent NAME
agentsecrets log list --identity anonymous
```
Views the global backend audit log. `--tail` streams live. `--agent` filters by agent name. `--identity anonymous` finds calls with no agent identity set.

```bash
agentsecrets log summary
agentsecrets log summary --since 7d
```
Aggregate statistics: call counts, top keys, top agents, error rates.

```bash
agentsecrets log export --format csv
agentsecrets log export --format json --since 30d
```
Exports audit log entries for compliance review or external analysis.

```bash
agentsecrets log detail <entry-id>
```
Full detail for a specific log entry, including the domain allowlist snapshot at time of call.


## Agent Identity

```bash
agentsecrets agent list
```
Lists all named agents that have made at least one call in the current workspace.

```bash
agentsecrets agent delete "agent-name"
```
Deletes an agent identity and revokes all its tokens. Permanent.

```bash
agentsecrets agent token issue "agent-name"
```
Issues a cryptographically signed token for an agent. Shown once — store it immediately.

```bash
agentsecrets agent token list "agent-name"
```
Lists active tokens for an agent. Shows token ID, creation date, and last used date. Never shows token values.

```bash
agentsecrets agent token revoke <token-id> --agent="agent-name"
```
Revokes a specific token. Other tokens for the same agent remain active.


## Workspace Security

```bash
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.stripe.com api.openai.com api.github.com
```
Authorizes one or more domains. Requires admin and password confirmation.

```bash
agentsecrets workspace allowlist list
```
Lists all authorized domains.

```bash
agentsecrets workspace allowlist log
```
Shows blocked request attempts — requests the proxy rejected because the domain was not authorized.
