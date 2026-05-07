# Getting Started

Install AgentSecrets, store your first secret, and make your first zero-knowledge API call.

### 1. Install the CLI
The CLI manages your credentials, runs the local proxy, and handles workspace and project context.

\`\`\`bash
$ brew install The-17/tap/agentsecrets

# Also available via:
$ npm install -g @the-17/agentsecrets
$ pip install agentsecrets-cli
$ go install github.com/The-17/agentsecrets/cmd/agentsecrets@latest

$ agentsecrets --version
\`\`\`

### 2. Initialize
Creates your account, generates your encryption keys locally, and sets up your first workspace.
\`\`\`bash
$ agentsecrets init
\`\`\`

### 3. Create a project
Projects partition your secrets within a workspace.
\`\`\`bash
$ agentsecrets project create my-agent
$ agentsecrets project use my-agent
\`\`\`

### 4. Store your credentials
The value goes directly to the OS keychain.
\`\`\`bash
$ agentsecrets secrets set STRIPE_KEY=sk_live_...
$ agentsecrets secrets set OPENAI_KEY=sk-proj-...
\`\`\`

### 5. Authorize your domains
Every domain your agent calls must be explicitly authorized.
\`\`\`bash
$ agentsecrets workspace allowlist add api.stripe.com
$ agentsecrets workspace allowlist add api.openai.com
\`\`\`

### 6. Start the proxy
The proxy runs on \`localhost:8765\`.
\`\`\`bash
$ agentsecrets proxy start
\`\`\`

### 7. Make your first call
The proxy resolves the key from the OS keychain and injects it at the transport layer.
\`\`\`bash
$ agentsecrets call \\
    --url https://api.stripe.com/v1/balance \\
    --bearer STRIPE_KEY
\`\`\`
