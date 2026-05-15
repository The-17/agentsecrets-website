# Quick Start

Install AgentSecrets, store your first secret, and make your first zero-knowledge API call. The whole setup takes about five minutes.

This guide walks you through everything you need to go from a fresh install to your first authenticated API call where the credential value never enters your agent’s context. By the end, you’ll have a project set up, secrets stored, an AI tool connected, and a live audit log entry to confirm it all worked.



### 1. Install the CLI

Choose the installation method that fits your environment.

```bash
# Homebrew (macOS / Linux) — recommended
brew install The-17/tap/agentsecrets

# npm
npm install -g @the-17/agentsecrets

# pip
pip install agentsecrets-cli

# Go
go install github.com/The-17/agentsecrets/cmd/agentsecrets@latest
```

Verify your installation with:

```bash
agentsecrets --version
```

### 2. Initialize

Run `agentsecrets init` to create your account and set up your local environment.

```bash
agentsecrets init
```

The interactive setup will:
1. Ask whether to create a new account or log in to an existing one
2. Ask which storage mode to use:
   - **Keychain (recommended)** — secrets are stored in your OS keychain; no `.env` file is created
   - **Standard** — secrets are written to a `.env` file (traditional workflow)
3. Generate a **cryptographic keypair** on your machine. Your private key never leaves your device.
4. Write `.agent/workflows/agentsecrets.md`, a workflow file that teaches any AI assistant how to use AgentSecrets automatically.

To skip the interactive prompts:
```bash
agentsecrets init --storage-mode 1   # Keychain mode (recommended)
agentsecrets init --storage-mode 2   # Standard .env mode
```

If you are returning to an existing account on a new machine, `agentsecrets init` detects that and walks you through joining your existing workspace.

> [TIP]
> The workflow file at `.agent/workflows/agentsecrets.md` is read automatically by Claude, Cursor, and other AI tools. Do not edit it manually to change environments — use `agentsecrets environment switch` instead.



### 3. Create a project

Projects map to your applications. Secrets are partitioned by project, and every secrets operation uses the active project context.

```bash
agentsecrets project create my-app
```

This writes `.agentsecrets/project.json` in the current directory, linking it to the remote project. The file contains no credentials and is safe to commit.

New projects use the `development` environment by default. Switch environments at any time:

```bash
# Switch to staging environment
agentsecrets environment switch staging
```


### 4. Store your secrets
Set secrets one at a time or multiple at once. Values are encrypted client-side before leaving your machine, the server only ever stores ciphertext.

```bash
# Set a secret
agentsecrets secrets set STRIPE_KEY=sk_live_...

# Set multiple secrets
agentsecrets secrets set STRIPE_KEY=sk_live_... OPENAI_KEY=sk-proj-...

```

The value goes directly to the OS keychain for the active environment. It is never written to disk in plaintext and never sent to the AgentSecrets server in plaintext.

If you already have a `.env` file, import it directly:

```bash
agentsecrets secrets push
# Reads from .env or .env.development
# Encrypts locally, uploads ciphertext
# You can delete the .env file after this
```

Confirm what’s stored (key names only, values are never displayed):
```bash
agentsecrets secrets list
```


### 5. Authorize your domains

Before making any proxy calls, tell AgentSecrets which API domains your project is allowed to reach. The allowlist is deny-by-default: calls to unauthorized domains are blocked before the secret is even resolved from the keychain.

```bash
agentsecrets workspace allowlist add api.stripe.com api.github.com 

# Verify
agentsecrets workspace allowlist list
```

> [WARNING]
> This step is required. The proxy will return a 403 for any domain not on the allowlist, regardless of whether a matching secret exists. This is intentional — the domain check happens before secret resolution.

Allowlist changes require admin role and password confirmation.



### 6. Connect your AI tools
Connect AgentSecrets to your AI tool using MCP for Claude Desktop and Cursor, or the HTTP proxy for any other agent or framework.

:::tabs

## MCP (Claude / Cursor / Windsurf)
```bash
agentsecrets mcp install
```
This auto-configures the MCP server for Claude Desktop and Cursor. Restart your AI tool after running this command. You’ll see two new tools available: `api_call` and `list_secrets`.
The MCP server communicates over stdio, no network port is opened, and no credential values appear in any config file.

## Env var injection
Wrap any process and inject secrets from the OS keychain at spawn time. Nothing is written to disk.
```bash
agentsecrets env -- node server.js
agentsecrets env -- python manage.py runserver
agentsecrets env -- npm run dev
```

## HTTP proxy (any framework)
```bash
agentsecrets proxy start
```
Route requests through `http://localhost:8765/proxy` using `X-AS-*` injection headers. This works with LangChain, CrewAI, AutoGen, and any framework that makes HTTP requests.
```bash
curl http://localhost:8765/proxy \
  -H "X-AS-Target-URL: https://api.stripe.com/v1/balance" \
  -H "X-AS-Inject-Bearer: STRIPE_KEY"
```

:::

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

### 8. Make your first authenticated call
Use `agentsecrets call` to make a one-shot authenticated request. Your agent provides the key name; the proxy resolves the value from the keychain and injects it into the outbound request.

```bash
agentsecrets call \
  --url https://api.stripe.com/v1/balance \
  --bearer STRIPE_KEY
```

Output:
```
HTTP 200

{"object":"balance","available":[{"amount":10000,"currency":"usd",...}]}
```

What was sent to Stripe: `Authorization: Bearer sk_live_51H...`
What you (or your agent) saw: the API response only.

> [INFO]
> The `agentsecrets call` command supports multiple injection styles. See [injection-styles](proxy/injection-styles.md) for the full reference.

```bash
# Check what was logged — key names, endpoints, status codes. No value field.
agentsecrets proxy logs --last 5
```

---

### 9. Check the audit log

Every call is logged with the key name, endpoint, agent identity, status, and duration. No value field exists in the schema.

```bash
agentsecrets proxy logs --last 5
```

Output:
```
TIME      RESULT  METHOD  URL                           KEY         AUTH    STATUS  REASON  DURATION
14:23:01  * OK    GET     api.stripe.com/v1/balance     STRIPE_KEY  bearer  200     -       245ms
```

You can also tail the log in real time or filter by agent:
```bash
agentsecrets proxy logs --watch
agentsecrets log list --agent my-billing-agent
```

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
