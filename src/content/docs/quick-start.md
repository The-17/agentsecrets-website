# Quick Start

Install AgentSecrets, store your first secret, and make your first zero-knowledge API call. The whole setup takes about five minutes.

---

### 1. Install the CLI

```bash
# Homebrew (macOS / Linux) — recommended
brew install The-17/tap/agentsecrets

# npm
npm install -g @the-17/agentsecrets

# pip
pip install agentsecrets-cli

# Go
go install github.com/The-17/agentsecrets/cmd/agentsecrets@latest

# Verify
agentsecrets --version
```

---

### 2. Initialize

`agentsecrets init` creates your account, generates your encryption keys locally, and sets up your first workspace and project.

```bash
agentsecrets init
```

Your encryption keys are generated on your machine and stored in your OS keychain. The server receives your public key only. Everything synced to the cloud is encrypted client-side before upload — the server holds ciphertext and cannot decrypt it.

You will be prompted to choose a storage mode:

- **Mode 1: Keychain only** (recommended) — secrets live exclusively in the OS keychain. Nothing is written to disk.
- **Mode 2: Keychain + .env file** — secrets are also written to `.env.{environment}` files on pull. Use this only if your tools require environment variables at startup and cannot use the proxy.

If you are returning to an existing account on a new machine, `agentsecrets init` detects that and walks you through joining your existing workspace.

---

### 3. Create a project

Projects partition your secrets within a workspace. One project per service or codebase is a reasonable starting structure.

```bash
agentsecrets project create my-agent
agentsecrets project use my-agent
```

The active project is reflected in `agentsecrets status` from this point forward.

---

### 4. Set your active environment

Every project has three environments: `development`, `staging`, and `production`. Development is the default. The active environment determines which secrets the proxy resolves.

```bash
# Check the current environment
agentsecrets status

# Switch when needed
agentsecrets environment switch staging
agentsecrets environment switch production
agentsecrets environment switch development
```

For most initial setups, development is the right starting point. Configure staging and production secrets later using `agentsecrets environment copy` or `agentsecrets environment merge`.

---

### 5. Store your credentials

```bash
agentsecrets secrets set STRIPE_KEY=sk_live_...
agentsecrets secrets set OPENAI_KEY=sk-proj-...

# Verify — key names only, never values
agentsecrets secrets list
```

The value goes directly to the OS keychain for the active environment. It is never written to disk in plaintext and never sent to the AgentSecrets server in plaintext.

If you already have a `.env` file, import it directly:

```bash
agentsecrets secrets push
# Reads from .env or .env.development
# Encrypts locally, uploads ciphertext
# You can delete the .env file after this
```

---

### 6. Authorize your domains

The proxy is deny-by-default. Every domain your agent calls must be explicitly authorized before any credential will be injected.

```bash
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.openai.com
agentsecrets workspace allowlist add api.github.com

# Verify
agentsecrets workspace allowlist list
```

Allowlist changes require admin role and password confirmation.

---

### 7. Start the proxy

```bash
agentsecrets proxy start

# Check status
agentsecrets proxy status

# Stop when done
agentsecrets proxy stop
```

The proxy runs in the background at `localhost:8765`. It resolves credential values from the OS keychain and injects them at the transport layer. Your code sends key names. Values never cross into your process.

---

### 8. Make your first call

```bash
agentsecrets call \
  --url https://api.stripe.com/v1/balance \
  --bearer STRIPE_KEY
```

The proxy resolves `STRIPE_KEY` from the OS keychain, injects it as a bearer token, makes the request, and returns the API response. The value `sk_live_...` never appeared in your terminal, in any variable, or in any log.

```bash
# Check what was logged — key names, endpoints, status codes. No value field.
agentsecrets proxy logs --last 5
```

---

### 9. Connect to Claude Desktop (optional)

If you use Claude Desktop or Cursor, one command configures AgentSecrets as an MCP server. No credential values end up in any config file.

```bash
agentsecrets mcp install
```

Restart Claude Desktop after running this. Ask it to check your Stripe balance and it will route the call through AgentSecrets.

---

## Verify everything is working

```bash
agentsecrets status
```

Expected output:
```
Logged in as:        you@example.com
Session:             Active (expires 5 hours from now)
Refresh Token:       Available
Selected Workspace:  your Workspace (workspace type)
Environment:         development (from project.json)
Current Project:     project (in project's Workspace)
Secrets:             9 synced (0 unsynced)
Activity:            Last Push: 2 mins ago | Last Pull: Never
```

If the proxy is not running, start it with `agentsecrets proxy start`. If you are not logged in, run `agentsecrets init`.

---