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
  { id: "cli/account", group: "CLI Reference", label: "init / login / logout" },
  
  // CLI: Secrets
  { id: "secrets/managing", group: "CLI Reference", label: "Managing Secrets" },
  { id: "secrets/push", group: "CLI Reference", label: "Pushing to Cloud Sync" },
  { id: "secrets/pull", group: "CLI Reference", label: "Pulling from Cloud Sync" },
  { id: "secrets/diff", group: "CLI Reference", label: "Diffing Secrets" },
  { id: "secrets/import-env", group: "CLI Reference", label: "Importing from .env" },
  { id: "secrets/rotation", group: "CLI Reference", label: "Secret Rotation (Soon)" },
  
  // CLI: Environments
  { id: "environments/overview", group: "CLI Reference", label: "Environments Overview" },
  { id: "environments/switch", group: "CLI Reference", label: "Switching Environments" },
  { id: "environments/list", group: "CLI Reference", label: "Listing & Coverage" },
  { id: "environments/copy", group: "CLI Reference", label: "Copying an Environment" },
  { id: "environments/merge", group: "CLI Reference", label: "Merging Environments" },
  { id: "environments/clean", group: "CLI Reference", label: "Cleaning an Environment" },

  // CLI: The Credential Proxy
  { id: "proxy/overview", group: "CLI Reference", label: "Proxy Overview" },
  { id: "proxy/start-stop", group: "CLI Reference", label: "Starting and Stopping" },
  { id: "proxy/injection", group: "CLI Reference", label: "How Injection Works" },
  { id: "proxy/injection-styles", group: "CLI Reference", label: "Auth Injection Styles" },
  { id: "proxy/domain-allowlist", group: "CLI Reference", label: "Domain Allowlist" },
  { id: "proxy/response-redaction", group: "CLI Reference", label: "Response Body Redaction" },
  { id: "proxy/ssrf-protection", group: "CLI Reference", label: "SSRF Protection" },
  { id: "proxy/session-token", group: "CLI Reference", label: "Session Token Auth" },
  { id: "proxy/logs", group: "CLI Reference", label: "Proxy Logs" },
  { id: "proxy/http-clients", group: "CLI Reference", label: "Using with HTTP Clients" },
  { id: "proxy/performance", group: "CLI Reference", label: "Performance & Latency" },

  // CLI: Env Injection
  { id: "env-injection/overview", group: "CLI Reference", label: "env Injection Overview" },
  { id: "env-injection/any-process", group: "CLI Reference", label: "Injecting into Any Process" },
  { id: "env-injection/proxy-vs-env", group: "CLI Reference", label: "Proxy vs env Injection" },

  // CLI: Workspaces & Teams
  { id: "workspaces/overview", group: "CLI Reference", label: "Workspaces Overview" },
  { id: "workspaces/create", group: "CLI Reference", label: "Creating a Workspace" },
  { id: "workspaces/invite", group: "CLI Reference", label: "Inviting Team Members" },
  { id: "workspaces/roles", group: "CLI Reference", label: "Roles and Permissions" },
  { id: "workspaces/onboarding", group: "CLI Reference", label: "Onboarding a Developer" },
  { id: "workspaces/revoke", group: "CLI Reference", label: "Revoking Access" },
  { id: "workspaces/multiple", group: "CLI Reference", label: "Multiple Workspaces" },

  // CLI: Projects
  { id: "projects/overview", group: "CLI Reference", label: "Projects Overview" },
  { id: "projects/create", group: "CLI Reference", label: "Creating a Project" },
  { id: "projects/switch", group: "CLI Reference", label: "Switching Between Projects" },
  { id: "projects/update-delete", group: "CLI Reference", label: "Updating and Deleting" },
  { id: "projects/invites", group: "CLI Reference", label: "Project Invites" },
  { id: "projects/organizing", group: "CLI Reference", label: "Organizing Projects" },

  // CLI: Agent Identity
  { id: "agent-identity/overview", group: "CLI Reference", label: "Identity Overview" },
  { id: "agent-identity/anonymous", group: "CLI Reference", label: "Anonymous Agents" },
  { id: "agent-identity/declared", group: "CLI Reference", label: "Declared Identity" },
  { id: "agent-identity/tokens-issue", group: "CLI Reference", label: "Cryptographic Tokens" },
  { id: "agent-identity/token-lifecycle", group: "CLI Reference", label: "Token Lifecycle" },
  { id: "agent-identity/multi-agent", group: "CLI Reference", label: "Multi-Agent Systems" },
  { id: "agent-identity/auditing", group: "CLI Reference", label: "Auditing by Identity" },
  { id: "agent-identity/anonymous-gaps", group: "CLI Reference", label: "Finding Coverage Gaps" },

  // CLI: Audit & Governance
  { id: "audit/overview", group: "CLI Reference", label: "Audit Log Overview" },
  { id: "audit/reading", group: "CLI Reference", label: "Reading and Filtering" },
  { id: "audit/summary", group: "CLI Reference", label: "Log Summary" },
  { id: "audit/export", group: "CLI Reference", label: "Exporting Logs (CSV)" },
  { id: "audit/detail", group: "CLI Reference", label: "Log Detail" },
  { id: "audit/compliance", group: "CLI Reference", label: "Using for Compliance" },

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
  { id: "sdk/zero-knowledge-mcp", group: "SDK", label: "ZK MCP Server" },

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
  { id: "changelog/v1-2-0", group: "Changelog", label: "v1.2.0" },
  { id: "changelog/v1-1-x", group: "Changelog", label: "v1.1.x" },
  { id: "changelog/v1-0-x", group: "Changelog", label: "v1.0.x" },
] as const;

export type DocSection = (typeof DOCS_SECTIONS)[number];
