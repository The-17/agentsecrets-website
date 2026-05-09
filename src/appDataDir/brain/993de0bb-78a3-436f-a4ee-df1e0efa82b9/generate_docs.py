import os

docs_structure = {
    "src/content/docs/installation.md": {
        "title": "Installation",
        "headings": ["Homebrew (macOS / Linux)", "npm", "pip", "Go", "Verifying your installation", "Updating to a new version"]
    },
    "src/content/docs/migrate-from-vault.md": {
        "title": "Migrating from HashiCorp Vault / AWS Secrets Manager",
        "headings": ["Key differences in the model", "What to move and what to keep", "Step-by-step migration", "Running both in parallel during transition"]
    },
    "src/content/docs/migrate-from-dotenv-vault.md": {
        "title": "Migrating from dotenv-vault",
        "headings": ["Structural differences", "Exporting from dotenv-vault", "Importing into AgentSecrets", "Updating your workflow"]
    },
    "src/content/docs/production-checklist.md": {
        "title": "Production Checklist",
        "headings": ["Secrets hygiene checklist", "Domain allowlist reviewed", "Agent identity assigned", "Audit log enabled", "Team access scoped correctly", "Cloud sync verified", "OS keychain confirmed on all machines"]
    },
    "src/content/docs/concepts/credential-exposure.md": {
        "title": "The Credential Exposure Problem",
        "headings": ["How credentials leak in AI agent systems", "Prompt injection and credential extraction", "Why logs and traces are a risk surface", "The moment of exposure", "Why policy-based protection is not enough"]
    },
    "src/content/docs/concepts/proxy-model.md": {
        "title": "The Proxy Model",
        "headings": ["What a credential proxy is", "How transport-layer injection works", "The request lifecycle step by step", "What the agent receives and what it does not", "Proxy vs retrieval — side by side"]
    },
    "src/content/docs/concepts/secrets-projects-workspaces.md": {
        "title": "Secrets, Projects, and Workspaces",
        "headings": ["The three-layer model", "What a secret is", "What a project is and when to create one", "What a workspace is and how it relates to a team", "How they nest and interact"]
    },
    "src/content/docs/concepts/no-get-method.md": {
        "title": "The No get() Principle",
        "headings": ["Why the SDK has no get() method", "What this means for developers building on AgentSecrets", "The secure path is the only path", "How this changes how you design agent tools", "Common patterns that get() would enable and why they are excluded"]
    },
    "src/content/docs/secrets/push.md": {
        "title": "Pushing to Cloud Sync",
        "headings": ["What push does", "How encryption works before leaving your machine", "Resolving conflicts", "Pushing a specific environment"]
    },
    "src/content/docs/secrets/pull.md": {
        "title": "Pulling from Cloud Sync",
        "headings": ["What pull does", "Syncing to the OS keychain", "Pulling a specific environment", "What happens when remote is newer"]
    },
    "src/content/docs/secrets/diff.md": {
        "title": "Diffing Secrets",
        "headings": ["Local vs remote diff", "Cross-environment diff", "Reading the diff output", "Acting on gaps"]
    },
    "src/content/docs/secrets/import-env.md": {
        "title": "Importing from .env Files",
        "headings": ["Supported .env formats", "Running the import", "Handling conflicts and duplicates", "Verifying the import"]
    },
    "src/content/docs/secrets/rotation.md": {
        "title": "Secret Rotation",
        "status": "COMING SOON",
        "headings": ["What rotation will cover", "Current manual rotation workflow", "Roadmap for automated rotation"]
    },
    "src/content/docs/environments/switch.md": {
        "title": "Switching the Active Environment",
        "headings": ["The switch command", "What changes when you switch", "Verifying the active environment"]
    },
    "src/content/docs/environments/list.md": {
        "title": "Listing Environments and Viewing Coverage",
        "headings": ["Listing all environments", "Reading the coverage output", "Identifying missing keys"]
    },
    "src/content/docs/environments/copy.md": {
        "title": "Copying an Environment",
        "headings": ["When to copy an environment", "Running the copy", "What is and is not copied"]
    },
    "src/content/docs/environments/merge.md": {
        "title": "Merging Environments",
        "headings": ["When to merge", "Staging to production merge workflow", "Prompting for new values per key", "Merge safety — what does not get overwritten"]
    },
    "src/content/docs/environments/clean.md": {
        "title": "Cleaning an Environment",
        "headings": ["What clean does", "When to use it", "Irreversible actions warning"]
    },
    "src/content/docs/proxy/start-stop.md": {
        "title": "Starting and Stopping the Proxy",
        "headings": ["Starting the proxy", "Specifying a custom port", "Checking proxy status", "Stopping the proxy", "Running the proxy as a background service"]
    },
    "src/content/docs/proxy/injection.md": {
        "title": "How Credential Injection Works",
        "headings": ["The per-request lifecycle", "How the proxy resolves the key name", "Injection at the transport layer", "What leaves the proxy and what does not", "Annotated example request"]
    },
    "src/content/docs/proxy/injection-styles.md": {
        "title": "Auth Injection Styles",
        "headings": ["Bearer token", "Basic auth", "Custom header", "Query parameter", "JSON body injection", "Form field injection", "Choosing the right style for your API"]
    },
    "src/content/docs/proxy/ssrf-protection.md": {
        "title": "SSRF Protection",
        "headings": ["What SSRF is", "What the proxy blocks by default", "Private IP ranges", "Localhost blocking", "Non-HTTPS blocking"]
    },
    "src/content/docs/proxy/session-token.md": {
        "title": "Session Token Authentication",
        "headings": ["What the session token is", "How it is generated at proxy startup", "Including it in requests", "Why it blocks rogue processes", "Rotating the session token"]
    },
    "src/content/docs/proxy/http-clients.md": {
        "title": "Using the Proxy with HTTP Clients",
        "headings": ["curl", "fetch (Node.js)", "axios", "Python requests", "Any HTTP client (general pattern)"]
    },
    "src/content/docs/proxy/performance.md": {
        "title": "Proxy Performance and Local Latency",
        "headings": ["Expected latency overhead", "Local vs remote resolution", "Benchmarks", "Optimizing for high-frequency agent calls"]
    },
    "src/content/docs/env-injection/any-process.md": {
        "title": "Injecting into Any Process",
        "headings": ["The command pattern", "Node.js processes", "Python processes", "Shell scripts", "Build tools and dev servers"]
    },
    "src/content/docs/env-injection/proxy-vs-env.md": {
        "title": "Proxy Injection vs env Injection",
        "headings": ["Side-by-side comparison", "Zero-knowledge tradeoffs", "When env injection is appropriate", "When the proxy is required"]
    },
    "src/content/docs/workspaces/create.md": {
        "title": "Creating a Workspace",
        "headings": ["The create command", "Naming and setup", "Inviting your first members"]
    },
    "src/content/docs/workspaces/invite.md": {
        "title": "Inviting Team Members",
        "headings": ["Sending an invite", "What the invitee sees", "Invite expiry and resending"]
    },
    "src/content/docs/workspaces/roles.md": {
        "title": "Roles and Permissions",
        "headings": ["Available roles", "What each role can do", "What each role cannot do", "Promoting a member", "Demoting a member"]
    },
    "src/content/docs/workspaces/onboarding.md": {
        "title": "Onboarding a New Developer",
        "headings": ["Step-by-step onboarding flow", "What the new developer runs", "No .env sharing required", "Verifying they are set up correctly"]
    },
    "src/content/docs/workspaces/revoke.md": {
        "title": "Revoking Access",
        "headings": ["Removing a team member", "What happens to their pulled secrets", "Rotating secrets after offboarding"]
    },
    "src/content/docs/workspaces/multiple.md": {
        "title": "Managing Multiple Workspaces",
        "headings": ["Switching between workspaces", "Use cases for multiple workspaces", "Workspace isolation model"]
    },
    "src/content/docs/projects/create.md": {
        "title": "Creating a Project",
        "headings": ["The create command", "Naming conventions", "Scoping secrets to a project"]
    },
    "src/content/docs/projects/switch.md": {
        "title": "Switching Between Projects",
        "headings": ["The use command", "Checking the active project", "How the proxy respects the active project"]
    },
    "src/content/docs/projects/update-delete.md": {
        "title": "Updating and Deleting Projects",
        "headings": ["Updating project name", "Deleting a project", "What deletion removes", "Irreversible actions warning"]
    },
    "src/content/docs/projects/invites.md": {
        "title": "Project Invites",
        "headings": ["Inviting a collaborator to a specific project", "Difference from workspace invite", "Managing project-level access"]
    },
    "src/content/docs/projects/organizing.md": {
        "title": "Organizing Projects Across a Workspace",
        "headings": ["Naming strategies", "One project per microservice", "Shared secrets vs project-scoped secrets"]
    },
    "src/content/docs/agent-identity/overview.md": {
        "title": "Agent Identity Overview",
        "headings": ["Why identity matters for agents", "The three levels", "How identity flows into the audit log"]
    },
    "src/content/docs/agent-identity/anonymous.md": {
        "title": "Anonymous Agents",
        "headings": ["What anonymous means", "Risks of anonymous agents in production", "How to find anonymous calls in the audit log", "Moving from anonymous to declared"]
    },
    "src/content/docs/agent-identity/declared.md": {
        "title": "Declared Identity",
        "headings": ["Setting a declared identity", "What declared identity enables", "Limitations vs cryptographic tokens"]
    },
    "src/content/docs/agent-identity/tokens-issue.md": {
        "title": "Issuing Cryptographic Tokens",
        "headings": ["The token issue command", "Token format and structure", "Using the token in the SDK", "Using the token with the proxy"]
    },
    "src/content/docs/agent-identity/token-lifecycle.md": {
        "title": "Token Lifecycle",
        "headings": ["Listing tokens per agent", "Revoking a specific token", "Revoking without touching other agents", "Token expiry (roadmap)"]
    },
    "src/content/docs/agent-identity/multi-agent.md": {
        "title": "Multi-Agent Systems",
        "headings": ["Assigning unique identity to each agent", "Per-agent audit trails", "Revoking one agent in a fleet", "Identity patterns for agent pipelines"]
    },
    "src/content/docs/agent-identity/auditing.md": {
        "title": "Auditing by Agent Identity",
        "headings": ["Filtering logs by agent name", "Filtering logs by identity level", "Reading per-agent call history", "Exporting agent-specific logs"]
    },
    "src/content/docs/agent-identity/anonymous-gaps.md": {
        "title": "Finding Anonymous Coverage Gaps",
        "headings": ["The --identity anonymous filter", "What gaps look like", "Resolving each gap"]
    },
    "src/content/docs/audit/reading.md": {
        "title": "Reading and Filtering the Log",
        "headings": ["The log list command", "Filtering by agent", "Filtering by environment", "Filtering by time range", "Tailing live logs"]
    },
    "src/content/docs/audit/summary.md": {
        "title": "Log Summary",
        "headings": ["The log summary command", "Reading summary output", "Useful time ranges"]
    },
    "src/content/docs/audit/export.md": {
        "title": "Exporting Logs as CSV",
        "headings": ["The export command", "CSV schema", "Importing into external tools"]
    },
    "src/content/docs/audit/detail.md": {
        "title": "Log Detail",
        "headings": ["Inspecting a single event", "All fields in detail view", "Using detail for incident investigation"]
    },
    "src/content/docs/audit/compliance.md": {
        "title": "Using Audit Logs for Compliance",
        "headings": ["What the log proves", "What it cannot prove (no value field = no credential exposure proof gap)", "Useful for SOC 2 / security reviews", "Retention and archiving"]
    },
    "src/content/docs/integrations/overview.md": {
        "title": "Integrations Overview",
        "headings": ["How AgentSecrets integrates with tools", "MCP vs HTTP proxy vs SDK", "Choosing the right integration method"]
    },
    "src/content/docs/integrations/cursor.md": {
        "title": "Cursor",
        "headings": ["Installing the MCP server", "Config setup", "Verifying the connection", "Troubleshooting"]
    },
    "src/content/docs/integrations/http-proxy.md": {
        "title": "HTTP Proxy — Any Framework",
        "headings": ["The general pattern", "LangChain", "CrewAI", "AutoGen", "Any framework that makes HTTP requests"]
    },
    "src/content/docs/integrations/langchain-native.md": {
        "title": "LangChain Native Integration",
        "status": "COMING SOON",
        "headings": ["What this will cover", "Current workaround using HTTP proxy"]
    },
    "src/content/docs/integrations/crewai-native.md": {
        "title": "CrewAI Native Integration",
        "status": "COMING SOON",
        "headings": ["What this will cover", "Current workaround using HTTP proxy"]
    },
    "src/content/docs/integrations/cicd.md": {
        "title": "Using AgentSecrets in CI/CD",
        "headings": ["Why CI/CD environments need special handling", "Using agentsecrets env in CI", "GitHub Actions setup", "GitLab CI setup", "Avoiding secrets in pipeline logs", "Service account identity for CI agents"]
    },
    "src/content/docs/sdk/python.md": {
        "title": "Python SDK",
        "headings": ["Installation", "Basic usage", "Making authenticated calls", "The call() method — all parameters", "Agent identity in the SDK", "Error types and handling", "Full worked example"]
    },
    "src/content/docs/sdk/javascript.md": {
        "title": "JavaScript SDK",
        "status": "COMING SOON",
        "headings": ["What this will cover", "Current workaround using HTTP proxy"]
    },
    "src/content/docs/sdk/zero-knowledge-mcp.md": {
        "title": "Building a Zero-Knowledge MCP Server",
        "headings": ["What zero-knowledge MCP means", "Using the ZK MCP Template", "Scaffold walkthrough", "Wiring AgentSecrets into your MCP server", "Ensuring no credential values enter any config file", "Publishing your MCP server"]
    },
    "src/content/docs/guides/stripe.md": {
        "title": "Securing a Stripe Integration End-to-End",
        "headings": ["Prerequisites", "Storing the Stripe key", "Allowlisting api.stripe.com", "Making the call through the proxy", "Verifying in the audit log"]
    },
    "src/content/docs/guides/openai.md": {
        "title": "Securing an OpenAI Integration End-to-End",
        "headings": ["Prerequisites", "Storing the OpenAI key", "Allowlisting api.openai.com", "Making the call", "Identity and logging"]
    },
    "src/content/docs/guides/multi-agent.md": {
        "title": "Setting Up a Multi-Agent System with Per-Agent Identity",
        "headings": ["Designing your agent identity model", "Issuing tokens per agent", "Routing calls through the proxy per agent", "Reading per-agent audit trails", "Revoking a single agent"]
    },
    "src/content/docs/guides/onboarding-developer.md": {
        "title": "Onboarding a New Developer to an Existing Workspace",
        "headings": ["What the new developer needs installed", "Login and workspace switch", "Pulling secrets to their keychain", "Verifying their setup", "No .env files, no Slack messages"]
    },
    "src/content/docs/guides/cicd.md": {
        "title": "Running AgentSecrets in a CI/CD Pipeline",
        "headings": ["The challenge of CI/CD and zero-knowledge", "Service account setup", "Injecting secrets at pipeline runtime", "GitHub Actions full example", "GitLab CI full example"]
    },
    "src/content/docs/guides/build-zk-mcp.md": {
        "title": "Building and Publishing a Zero-Knowledge MCP Server",
        "headings": ["Scaffolding with the ZK MCP Template", "Adding your tools", "Connecting to AgentSecrets", "Testing locally with Claude Desktop", "Publishing to ClawHub"]
    },
    "src/content/docs/guides/rotate-credential.md": {
        "title": "Rotating a Compromised Credential",
        "headings": ["Immediate containment steps", "Deleting the compromised secret", "Setting the new value", "Pushing to cloud sync", "Verifying in the audit log", "Checking for exposure window"]
    },
    "src/content/docs/guides/audit-team.md": {
        "title": "Auditing Agent Activity Across a Team",
        "headings": ["Exporting a full audit report", "Filtering by agent and environment", "Identifying anonymous calls", "Reviewing blocked domain attempts"]
    },
    "src/content/docs/guides/dev-to-production.md": {
        "title": "Moving from Development to Production Safely",
        "headings": ["Running the cross-environment diff", "Filling production gaps", "Tightening the domain allowlist for production", "Assigning production agent identity", "Final production checklist"]
    },
    "src/content/docs/guides/monorepo.md": {
        "title": "Using AgentSecrets with a Monorepo",
        "headings": ["One workspace, multiple projects", "Per-service secrets scoping", "Switching context between services", "Shared secrets across projects"]
    },
    "src/content/docs/security/overview.md": {
        "title": "Security Overview",
        "headings": ["The security model in one page", "Links to every deep-dive section"]
    },
    "src/content/docs/security/encryption.md": {
        "title": "Encryption Model",
        "headings": ["Key exchange: X25519 / NaCl SealedBox", "Secret encryption: AES-256-GCM", "Key derivation: Argon2id", "OS keychain storage per platform", "Transport: HTTPS / TLS", "What the server stores", "Why the server cannot decrypt"]
    },
    "src/content/docs/security/cloud-sync.md": {
        "title": "Zero-Knowledge Cloud Sync",
        "headings": ["How client-side encryption works before upload", "The workspace key — where it lives and where it does not", "What the server receives", "What a server compromise would expose", "Sync architecture diagram"]
    },
    "src/content/docs/security/proxy-layers.md": {
        "title": "The Four Proxy Security Layers",
        "headings": ["Layer 1: Domain allowlist", "Layer 2: Response body redaction", "Layer 3: SSRF protection", "Layer 4: Session token", "How they compound — failure in one does not collapse the others"]
    },
    "src/content/docs/security/threat-model.md": {
        "title": "Threat Model",
        "headings": ["Scope: what AgentSecrets is designed to protect", "Attacker scenario 1: prompt injection targeting credentials", "Attacker scenario 2: malicious plugin or tool", "Attacker scenario 3: compromised log or trace", "Attacker scenario 4: server-side breach", "Attacker scenario 5: SSRF via agent", "Out of scope: agent with independent network access", "Out of scope: compromised OS keychain", "Out of scope: physical machine access"]
    },
    "src/content/docs/security/faq.md": {
        "title": "Security FAQ",
        "headings": ["What if the proxy process itself is compromised?", "What if someone steals my session token?", "Why is the OS keychain better than an environment variable?", "What if a malicious tool makes its own network calls, bypassing the proxy?", "Can the AgentSecrets server read my secrets?", "What happens if cloud sync is unavailable?", "Is zero-knowledge a marketing term or a technical guarantee?", "Has AgentSecrets been independently audited?", "What happens to my secrets if I stop using AgentSecrets?", "Does AgentSecrets work offline?", "Can I self-host AgentSecrets?", "What is the difference between agentsecrets call and the HTTP proxy?", "How do I report a security vulnerability?"]
    },
    "src/content/docs/security/audit-status.md": {
        "title": "Third-Party Audit Status",
        "headings": ["Current status", "What an audit will cover", "Timeline and roadmap", "How to be notified when complete"]
    },
    "src/content/docs/security/reporting.md": {
        "title": "Reporting Vulnerabilities",
        "headings": ["Do not open public issues", "Contact: hello@theseventeen.co", "Response SLA", "Responsible disclosure policy"]
    },
    "src/content/docs/comparisons/vs-env-files.md": {
        "title": "AgentSecrets vs .env Files",
        "headings": ["What .env files do well", "Why they break down with AI agents", "The specific exposure vectors", "Migration path"]
    },
    "src/content/docs/comparisons/vs-vault.md": {
        "title": "AgentSecrets vs HashiCorp Vault",
        "headings": ["What Vault does well", "The retrieval problem Vault shares", "Where the architectural difference matters", "Can they be used together?"]
    },
    "src/content/docs/comparisons/vs-aws-secrets-manager.md": {
        "title": "AgentSecrets vs AWS Secrets Manager",
        "headings": ["What AWS Secrets Manager does well", "Runtime retrieval and agent context exposure", "Serverless considerations", "Can they be used together?"]
    },
    "src/content/docs/comparisons/vs-dotenv-vault.md": {
        "title": "AgentSecrets vs dotenv-vault",
        "headings": ["What dotenv-vault does well", "The retrieval model", "Key differences", "Migration path"]
    },
    "src/content/docs/comparisons/vs-infisical.md": {
        "title": "AgentSecrets vs Infisical",
        "headings": ["What Infisical does well", "How the models differ for AI agents", "Key architectural differences"]
    },
    "src/content/docs/comparisons/when-not-to-use.md": {
        "title": "When AgentSecrets Is Not the Right Tool",
        "headings": ["Serverless environments (cloud resolver is on the roadmap)", "Non-agent use cases where existing tools are fine", "Teams not yet using AI agents", "Honest assessment of current limitations"]
    },
    "src/content/docs/troubleshooting/proxy-not-starting.md": {
        "title": "Proxy Not Starting",
        "headings": ["Port already in use", "Permission errors", "Binary not found", "Using a custom port"]
    },
    "src/content/docs/troubleshooting/proxy-not-resolving.md": {
        "title": "Proxy Not Resolving Credentials",
        "headings": ["Key not found in keychain", "Wrong active project or environment", "Case sensitivity in key names", "Keychain locked"]
    },
    "src/content/docs/troubleshooting/domain-blocked.md": {
        "title": "Domain Blocked Unexpectedly",
        "headings": ["Checking the allowlist", "Subdomain vs apex domain", "Viewing block logs", "Adding the missing domain"]
    },
    "src/content/docs/troubleshooting/sync-conflicts.md": {
        "title": "Sync Conflicts Between Environments",
        "headings": ["What a conflict looks like", "Remote newer than local", "Local newer than remote", "Resolving manually"]
    },
    "src/content/docs/troubleshooting/mcp.md": {
        "title": "MCP Not Connecting",
        "headings": ["Claude Desktop: config file location and format", "Claude Desktop: binary path issues", "Cursor: config setup", "Verifying MCP is running"]
    },
    "src/content/docs/troubleshooting/session-token.md": {
        "title": "Session Token Errors",
        "headings": ["Missing session token in request", "Token mismatch", "Proxy restarted and token changed", "How to retrieve the current session token"]
    },
    "src/content/docs/troubleshooting/installation.md": {
        "title": "Common Installation Issues",
        "headings": ["Homebrew: tap not found", "npm: global install permissions", "pip: break-system-packages flag", "Go: GOPATH and binary location", "PATH not updated after install"]
    },
    "src/content/docs/faq.md": {
        "title": "Frequently Asked Questions",
        "headings": ["Does AgentSecrets work on Windows?", "Can I use AgentSecrets without cloud sync?", "Does this work in serverless environments?", "What happens if the proxy goes down mid-request?", "Can multiple agents share the same credentials?", "Is my data stored on AgentSecrets servers?", "Does this work with any AI framework?", "What is the difference between the CLI and the SDK?", "How is this different from just using a secrets manager?", "Is AgentSecrets open source?", "How do I know the zero-knowledge claim is real?", "What happens to my secrets if I uninstall AgentSecrets?", "Does AgentSecrets work offline?", "Can I self-host AgentSecrets?", "What is the difference between agentsecrets call and the HTTP proxy?", "How do I report a security vulnerability?"]
    },
    "src/content/docs/changelog/v1-2-0.md": {
        "title": "v1.2.0",
        "headings": ["What changed", "Why it changed", "Migration notes"]
    },
    "src/content/docs/changelog/v1-1-x.md": {
        "title": "v1.1.x",
        "headings": ["v1.1.2 — Multi-Environment Support", "v1.1.1", "v1.1.0"]
    },
    "src/content/docs/changelog/v1-0-x.md": {
        "title": "v1.0.x",
        "headings": ["v1.0.x releases"]
    }
}

for path, info in docs_structure.items():
    if os.path.exists(path):
        continue
    
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(f"# {info['title']}\n\n")
        if info.get("status") == "COMING SOON":
            f.write("> [!NOTE]\n")
            f.write("> **COMING SOON** — This feature or documentation page is currently in development.\n\n")
        
        for heading in info['headings']:
            f.write(f"## {heading}\n\n")
            f.write("Content for this section is coming soon.\n\n")

print("Done.")
