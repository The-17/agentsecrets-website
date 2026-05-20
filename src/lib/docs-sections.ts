/**
 * Canonical list of all documentation sections.
 * Shared between the docs page component and the build-time search index generator.
 */
export const DOCS_SECTIONS = [
  // Getting Started
  { id: "what-is-agentsecrets", group: "Getting Started", label: "What is AgentSecrets?" },
  { id: "zero-knowledge-difference", group: "Getting Started", label: "The Zero-Knowledge Difference" },
  { id: "how-it-works", group: "Getting Started", label: "How AgentSecrets Works" },
  { id: "installation", group: "Getting Started", label: "Installation" },
  { id: "quick-start", group: "Getting Started", label: "Quick Start" },
  { id: "migrate-from-env", group: "Getting Started", label: "Migrating from .env Files" },
  { id: "migrate-from-vault", group: "Getting Started", label: "Migrating from Vault / AWS" },
  { id: "migrate-from-dotenv-vault", group: "Getting Started", label: "Migrating from dotenv-vault" },
  { id: "production-checklist", group: "Getting Started", label: "Production Checklist" },

  // Fundamental Concepts
  { id: "concepts/credential-exposure", group: "Fundamental Concepts", label: "Credential Exposure" },
  { id: "concepts/zero-knowledge", group: "Fundamental Concepts", label: "What Zero-Knowledge Means" },
  { id: "concepts/proxy-model", group: "Fundamental Concepts", label: "The Proxy Model" },
  { id: "concepts/secrets-projects-workspaces", group: "Fundamental Concepts", label: "The Three-Layer Model" },
  { id: "concepts/environments", group: "Fundamental Concepts", label: "Environments" },
  { id: "concepts/agent-identity", group: "Fundamental Concepts", label: "Agent Identity" },
  { id: "concepts/storage-modes", group: "Fundamental Concepts", label: "Storage Modes" },
  { id: "concepts/no-get-method", group: "Fundamental Concepts", label: "The No get() Principle" },

  // CLI Reference
  { id: "cli/account", group: "CLI Reference", label: "Account (init / login)" },
  
  // CLI: Secrets
  { id: "secrets/managing", group: "CLI Reference", label: "Secrets" },
  { id: "secrets/push", group: "CLI Reference", label: "Pushing to Cloud Sync", parent: "secrets/managing" },
  { id: "secrets/pull", group: "CLI Reference", label: "Pulling from Cloud Sync", parent: "secrets/managing" },
  { id: "secrets/diff", group: "CLI Reference", label: "Diffing Secrets", parent: "secrets/managing" },
  { id: "secrets/import-env", group: "CLI Reference", label: "Importing from .env", parent: "secrets/managing" },
  { id: "secrets/rotation", group: "CLI Reference", label: "Secret Rotation (Soon)", parent: "secrets/managing" },
  
  // CLI: Environments
  { id: "environments/overview", group: "CLI Reference", label: "Environments" },
  { id: "environments/switch", group: "CLI Reference", label: "Switching Environments", parent: "environments/overview" },
  { id: "environments/list", group: "CLI Reference", label: "Listing & Coverage", parent: "environments/overview" },
  { id: "environments/copy", group: "CLI Reference", label: "Copying an Environment", parent: "environments/overview" },
  { id: "environments/merge", group: "CLI Reference", label: "Merging Environments", parent: "environments/overview" },
  { id: "environments/clean", group: "CLI Reference", label: "Cleaning an Environment", parent: "environments/overview" },

  // CLI: The Credential Proxy
  { id: "proxy/overview", group: "CLI Reference", label: "Credential Proxy" },
  { id: "proxy/start-stop", group: "CLI Reference", label: "Starting and Stopping", parent: "proxy/overview" },
  { id: "proxy/injection", group: "CLI Reference", label: "How Injection Works", parent: "proxy/overview" },
  { id: "proxy/injection-styles", group: "CLI Reference", label: "Auth Injection Styles", parent: "proxy/overview" },
  { id: "proxy/domain-allowlist", group: "CLI Reference", label: "Domain Allowlist", parent: "proxy/overview" },
  { id: "proxy/response-redaction", group: "CLI Reference", label: "Response Body Redaction", parent: "proxy/overview" },
  { id: "proxy/ssrf-protection", group: "CLI Reference", label: "SSRF Protection", parent: "proxy/overview" },
  { id: "proxy/session-token", group: "CLI Reference", label: "Session Token Auth", parent: "proxy/overview" },
  { id: "proxy/logs", group: "CLI Reference", label: "Proxy Logs", parent: "proxy/overview" },
  { id: "proxy/http-clients", group: "CLI Reference", label: "Using with HTTP Clients", parent: "proxy/overview" },
  { id: "proxy/performance", group: "CLI Reference", label: "Performance & Latency", parent: "proxy/overview" },

  // CLI: Env Injection
  { id: "env-injection/overview", group: "CLI Reference", label: "env Injection" },
  { id: "env-injection/any-process", group: "CLI Reference", label: "Injecting into Any Process", parent: "env-injection/overview" },
  { id: "env-injection/proxy-vs-env", group: "CLI Reference", label: "Proxy vs env Injection", parent: "env-injection/overview" },

  // CLI: Workspaces & Teams
  { id: "workspaces/overview", group: "CLI Reference", label: "Workspaces & Teams" },
  { id: "workspaces/create", group: "CLI Reference", label: "Creating a Workspace", parent: "workspaces/overview" },
  { id: "workspaces/invite", group: "CLI Reference", label: "Inviting Team Members", parent: "workspaces/overview" },
  { id: "workspaces/roles", group: "CLI Reference", label: "Roles and Permissions", parent: "workspaces/overview" },
  { id: "workspaces/onboarding", group: "CLI Reference", label: "Onboarding a Developer", parent: "workspaces/overview" },
  { id: "workspaces/revoke", group: "CLI Reference", label: "Revoking Access", parent: "workspaces/overview" },
  { id: "workspaces/multiple", group: "CLI Reference", label: "Multiple Workspaces", parent: "workspaces/overview" },

  // CLI: Projects
  { id: "projects/overview", group: "CLI Reference", label: "Projects" },
  { id: "projects/create", group: "CLI Reference", label: "Creating a Project", parent: "projects/overview" },
  { id: "projects/switch", group: "CLI Reference", label: "Switching Between Projects", parent: "projects/overview" },
  { id: "projects/update-delete", group: "CLI Reference", label: "Updating and Deleting", parent: "projects/overview" },
  { id: "projects/invites", group: "CLI Reference", label: "Project Invites", parent: "projects/overview" },
  { id: "projects/organizing", group: "CLI Reference", label: "Organizing Projects", parent: "projects/overview" },

  // CLI: Agent Identity
  { id: "agent-identity/overview", group: "CLI Reference", label: "Agent Identity" },
  { id: "agent-identity/anonymous", group: "CLI Reference", label: "Anonymous Agents", parent: "agent-identity/overview" },
  { id: "agent-identity/declared", group: "CLI Reference", label: "Declared Identity", parent: "agent-identity/overview" },
  { id: "agent-identity/tokens-issue", group: "CLI Reference", label: "Cryptographic Tokens", parent: "agent-identity/overview" },
  { id: "agent-identity/token-lifecycle", group: "CLI Reference", label: "Token Lifecycle", parent: "agent-identity/overview" },
  { id: "agent-identity/multi-agent", group: "CLI Reference", label: "Multi-Agent Systems", parent: "agent-identity/overview" },
  { id: "agent-identity/auditing", group: "CLI Reference", label: "Auditing by Identity", parent: "agent-identity/overview" },
  { id: "agent-identity/anonymous-gaps", group: "CLI Reference", label: "Finding Coverage Gaps", parent: "agent-identity/overview" },

  // CLI: Audit & Governance
  { id: "audit/overview", group: "CLI Reference", label: "Audit & Governance" },
  { id: "audit/reading", group: "CLI Reference", label: "Reading and Filtering", parent: "audit/overview" },
  { id: "audit/summary", group: "CLI Reference", label: "Log Summary", parent: "audit/overview" },
  { id: "audit/export", group: "CLI Reference", label: "Exporting Logs (CSV)", parent: "audit/overview" },
  { id: "audit/detail", group: "CLI Reference", label: "Log Detail", parent: "audit/overview" },
  { id: "audit/compliance", group: "CLI Reference", label: "Using for Compliance", parent: "audit/overview" },

  // Integrations
  { id: "integrations/overview", group: "Integrations", label: "Integrations Overview" },
  { id: "integrations/claude-desktop", group: "Integrations", label: "Claude Desktop" },
  { id: "integrations/cursor", group: "Integrations", label: "Cursor" },
  { id: "integrations/openclaw", group: "Integrations", label: "OpenClaw" },
  { id: "integrations/http-proxy", group: "Integrations", label: "HTTP Proxy (Any)" },
  { id: "integrations/langchain-native", group: "Integrations", label: "LangChain (Soon)" },
  { id: "integrations/crewai-native", group: "Integrations", label: "CrewAI (Soon)" },
  { id: "integrations/cicd", group: "Integrations", label: "CI/CD Pipeline" },

  // SDK
  { id: "sdk/overview", group: "SDK", label: "SDK Overview" },
  { id: "sdk/python", group: "SDK", label: "Python SDK" },
  { id: "sdk/python-reference", group: "SDK", label: "Python API Reference" },
  { id: "sdk/javascript", group: "SDK", label: "JavaScript SDK (Soon)" },

  // Ecosystem
  { id: "ecosystem/overview", group: "Ecosystem", label: "Ecosystem Overview" },
  { id: "ecosystem/zk-mcp", group: "Ecosystem", label: "Zero-Knowledge MCP Server" },

  // API & Backend
  { id: "api/overview", group: "API & Backend", label: "API & Backend Overview" },
  { id: "api/architecture", group: "API & Backend", label: "API Architecture", parent: "api/overview" },
  { id: "api/authentication", group: "API & Backend", label: "Authentication", parent: "api/overview" },
  { id: "api/workspaces", group: "API & Backend", label: "Workspaces & Teams", parent: "api/overview" },
  { id: "api/projects", group: "API & Backend", label: "Projects", parent: "api/overview" },
  { id: "api/environments", group: "API & Backend", label: "Environments", parent: "api/overview" },
  { id: "api/secrets", group: "API & Backend", label: "Secrets & Sync", parent: "api/overview" },
  { id: "api/agent-identity", group: "API & Backend", label: "Agent Identity", parent: "api/overview" },
  { id: "api/audit", group: "API & Backend", label: "Audit Logs", parent: "api/overview" },
  { id: "api/reference", group: "API & Backend", label: "API Reference", parent: "api/overview" },

  // Security
  { id: "security/overview", group: "Security", label: "Security Overview" },
  { id: "security/encryption", group: "Security", label: "Encryption Model" },
  { id: "security/cloud-sync", group: "Security", label: "Zero-Knowledge Sync" },
  { id: "security/proxy-layers", group: "Security", label: "Proxy Security Layers" },
  { id: "security/threat-model", group: "Security", label: "Threat Model" },
  { id: "security/faq", group: "Security", label: "Security FAQ" },
  { id: "security/audit-status", group: "Security", label: "Third-Party Audit" },
  { id: "security/reporting", group: "Security", label: "Reporting Vulnerabilities" },

  // Guides
  { id: "guides/guide", group: "Guides", label: "Guides Overview" },
  { id: "guides/stripe", group: "Guides", label: "Stripe Integration" },
  { id: "guides/openai", group: "Guides", label: "OpenAI Integration" },
  { id: "guides/multi-agent", group: "Guides", label: "Multi-Agent Setup" },
  { id: "guides/onboarding-developer", group: "Guides", label: "Onboarding Team" },
  { id: "guides/cicd", group: "Guides", label: "CI/CD Pipeline" },
  { id: "guides/build-zk-mcp", group: "Guides", label: "Publishing ZK MCP" },
  { id: "guides/rotate-credential", group: "Guides", label: "Rotating Credentials" },
  { id: "guides/audit-team", group: "Guides", label: "Auditing Team Activity" },
  { id: "guides/dev-to-production", group: "Guides", label: "Dev to Production" },
  { id: "guides/kubernetes", group: "Guides", label: "Kubernetes Deployment" },
  { id: "guides/monorepo", group: "Guides", label: "Monorepo Setup" },

  // Comparisons
  { id: "comparisons/vs-env-files", group: "Comparisons", label: "vs .env Files" },
  { id: "comparisons/vs-vault", group: "Comparisons", label: "vs HashiCorp Vault" },
  { id: "comparisons/vs-aws-secrets-manager", group: "Comparisons", label: "vs AWS Secrets Manager" },
  { id: "comparisons/vs-dotenv-vault", group: "Comparisons", label: "vs dotenv-vault" },
  { id: "comparisons/vs-infisical", group: "Comparisons", label: "vs Infisical" },
  { id: "comparisons/when-not-to-use", group: "Comparisons", label: "When Not to Use" },

  // Troubleshooting
  { id: "troubleshooting/proxy-not-starting", group: "Troubleshooting", label: "Proxy Not Starting" },
  { id: "troubleshooting/proxy-not-resolving", group: "Troubleshooting", label: "Proxy Not Resolving" },
  { id: "troubleshooting/domain-blocked", group: "Troubleshooting", label: "Domain Blocked" },
  { id: "troubleshooting/sync-conflicts", group: "Troubleshooting", label: "Sync Conflicts" },
  { id: "troubleshooting/mcp", group: "Troubleshooting", label: "MCP Not Connecting" },
  { id: "troubleshooting/session-token", group: "Troubleshooting", label: "Session Token Errors" },
  { id: "troubleshooting/installation", group: "Troubleshooting", label: "Installation Issues" },

  // FAQ
  { id: "faq", group: "FAQ", label: "Frequently Asked Questions" },

  // Changelog
  { id: "changelog/v1-4-0", group: "Changelog", label: "v1.4.0" },
  { id: "changelog/v1-3-0", group: "Changelog", label: "v1.3.x" },
  { id: "changelog/v1-2-0", group: "Changelog", label: "v1.2.0" },
  { id: "changelog/v1-1-x", group: "Changelog", label: "v1.1.x" },
  { id: "changelog/v1-0-x", group: "Changelog", label: "v1.0.x" },
] as const;

export type DocSection = (typeof DOCS_SECTIONS)[number];
