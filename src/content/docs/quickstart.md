# Getting Started

Install AgentSecrets, store your first secret, and make your first zero-knowledge API call. The whole setup takes about five minutes.

---

## Step 1: Install the CLI

The CLI manages your credentials, runs the local proxy, and handles workspace, project, and environment context.

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

## Step 2: Initialize

`agentsecrets init` does three things: creates your account, generates your encryption keys locally, and sets up your first workspace and project.

```bash
agentsecrets init
```

Your encryption keys are generated on your machine and stored in your OS keychain. The server receives your public key only. Everything synced to the cloud is encrypted client-side before upload — the server holds ciphertext and cannot decrypt it.

If you are returning to an existing account on a new machine, `agentsecrets init` will detect that and walk you through joining your existing workspace rather than creating a new one.

## Step 3: Create a Project

Projects partition your secrets within a workspace. A reasonable starting point is one project per service or codebase.

```bash
agentsecrets project create my-agent
agentsecrets project use my-agent
```

You will see the active project reflected in `agentsecrets status` from this point forward.

## Step 4: Set Your Active Environment

Every project has three environments: `development`, `staging`, and `production`. Development is the default. The active environment determines which secrets the proxy resolves.

```bash
# Check the current environment
agentsecrets status

# Switch environments when needed
agentsecrets environment switch staging
agentsecrets environment switch production
agentsecrets environment switch development
```

For most initial setups, development is the right starting point. You can configure staging and production secrets later using `agentsecrets environment copy` or `agentsecrets environment merge`.

## Step 5: Store Your Credentials

The value goes directly to the OS keychain for the active environment. It is never written to disk in plaintext and never sent to the AgentSecrets server in plaintext.

```bash
# set a single secret
agentsecrets secrets set STRIPE_KEY=sk_live_...

# or set multiple secrets at once
agentsecrets secrets set OPENAI_KEY=sk-proj-... GITHUB_TOKEN=ghp_...

# Verify — key names only, never values
agentsecrets secrets list
```

If you already have a `.env` file, you can push it directly:

```bash
agentsecrets secrets push
# Reads from .env or .env.development
# Encrypts locally, uploads ciphertext
# You can delete the .env file after this
```

## Step 6: Authorize Your Domains

The proxy is deny-by-default. Every domain your agent calls must be explicitly authorized. This blocks SSRF attacks and prompt injection attempts that try to route requests to attacker-controlled URLs.

```bash
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.openai.com api.github.com

# View authorized domains
agentsecrets workspace allowlist list
```

Allowlist changes require admin role and password confirmation.

## Step 7: Start the Proxy

The proxy runs on `localhost:8765`. It resolves credential values from the OS keychain and injects them at the transport layer. Your code sends key names. Values never cross into your process.

```bash
agentsecrets proxy start

# Check proxy status
agentsecrets proxy status
```

The proxy runs in the background. To stop it:

```bash
agentsecrets proxy stop
```

## Step 8: Make Your First Call

The proxy resolves `STRIPE_KEY` from the OS keychain, injects it as a bearer token, makes the request, and returns the API response. The value `sk_live_...` never appeared in your terminal, in any variable, or in any log.

```bash
agentsecrets call \
  --url https://api.stripe.com/v1/balance \
  --bearer STRIPE_KEY

# Check what was logged — key names, endpoints, status codes. No value field.
agentsecrets proxy logs --last 5
```

## Step 9: Connect to Claude Desktop (Optional)

If you use Claude Desktop or Cursor, one command configures AgentSecrets as an MCP server. No credential values end up in any config file.

```bash
agentsecrets mcp install
```

This writes to your `claude_desktop_config.json` automatically. Restart Claude Desktop and ask it to check your Stripe balance — it will use AgentSecrets for the call.

---

## Verify Everything Is Working

```bash
agentsecrets status

# Expected output:
Logged in as:  you@example.com
Workspace:     your-workspace
Project:       my-agent
Environment:   development
Proxy:         running (port 8765)
Last sync:     2 minutes ago
```

If the proxy is not running, start it with `agentsecrets proxy start`. If you are not logged in, run `agentsecrets init` again.
