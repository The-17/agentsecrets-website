# init / login / logout / status

## agentsecrets init
```bash
agentsecrets init
```
Creates your account, generates encryption keys locally, and sets up your first workspace. On returning machines, detects existing accounts and walks you through joining your workspace. Accepts `--storage-mode 1` (keychain only) or `--storage-mode 2` (keychain and .env). Defaults to keychain only.

## agentsecrets login
```bash
agentsecrets login
```
Authenticates an existing account on a new machine. Does not generate new keys — pulls your existing workspace key from the cloud after authentication.

## agentsecrets logout
```bash
agentsecrets logout
```
Clears the local session. Does not delete your keychain entries or cloud secrets.

## agentsecrets status
```bash
agentsecrets status
```
Shows current user, workspace, project, environment, proxy status, and last sync time. Run this before any secrets operation to confirm you are in the right context.
