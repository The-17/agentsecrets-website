# agent

## agentsecrets agent list
```bash
agentsecrets agent list
```
Lists all named agents that have made at least one call in the current workspace.

## agentsecrets agent delete
```bash
agentsecrets agent delete "agent-name"
```
Deletes an agent identity and revokes all its tokens. Permanent.

## agentsecrets agent token issue
```bash
agentsecrets agent token issue "agent-name"
```
Issues a cryptographically signed token for an agent. Shown once — store it immediately.

## agentsecrets agent token list
```bash
agentsecrets agent token list "agent-name"
```
Lists active tokens for an agent. Shows token ID, creation date, and last used date. Never shows token values.

## agentsecrets agent token revoke
```bash
agentsecrets agent token revoke <token-id> --agent="agent-name"
```
Revokes a specific token. Other tokens for the same agent remain active.
