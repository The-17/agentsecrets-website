# workspace

## agentsecrets workspace create
```bash
agentsecrets workspace create "Name"
```
Creates a new workspace. You are the admin.

## agentsecrets workspace list
```bash
agentsecrets workspace list
```
Lists all workspaces you belong to.

## agentsecrets workspace switch
```bash
agentsecrets workspace switch "Name"
```
Switches the active workspace. All subsequent commands operate in this workspace.

## agentsecrets workspace invite
```bash
agentsecrets workspace invite user@email.com
```
Sends an invitation to a teammate. They join by accepting the invitation and running `agentsecrets login`.

## agentsecrets workspace promote / demote
```bash
agentsecrets workspace promote user@email.com
agentsecrets workspace demote user@email.com
```
Grants or revokes admin role. Requires admin and password confirmation.

## agentsecrets workspace allowlist add
```bash
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.stripe.com api.openai.com api.github.com
```
Authorizes one or more domains. Requires admin and password confirmation.

## agentsecrets workspace allowlist list
```bash
agentsecrets workspace allowlist list
```
Lists all authorized domains.

## agentsecrets workspace allowlist log
```bash
agentsecrets workspace allowlist log
```
Shows blocked request attempts — requests the proxy rejected because the domain was not authorized.
