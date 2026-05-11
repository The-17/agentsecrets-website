# Secrets, Projects, and Workspaces

AgentSecrets organizes your credentials in a three-layer hierarchy: secrets belong to projects, projects belong to workspaces. Understanding how these layers relate helps you set up the right structure from the start.

---

## The three-layer model

```
Workspace
└── Project
    └── Environment (development / staging / production)
        └── Secret (KEY_NAME → encrypted value)
```

Every secret lives in a specific project and a specific environment within that project. When the proxy resolves a key name, it uses the active workspace, project, and environment to look up the right keychain entry.

---

## What a secret is

A secret is a named credential stored in the OS keychain. It has a key name and a value. The key name is what you reference everywhere — in your code, in CLI commands, in proxy headers. The value is what gets injected at the transport layer and is never exposed outside that injection moment.

Secrets are scoped to a project and an environment. The same key name in different environments is a different secret:

```
workspace:my-workspace / project:payments / env:development / STRIPE_KEY
workspace:my-workspace / project:payments / env:production  / STRIPE_KEY
```

These are independent keychain entries. Switching environments switches which entry the proxy reads. There is no risk of a development credential being resolved when running in a production context.

---

## What a project is

A project is a logical grouping of secrets within a workspace. One project per service, codebase, or agent is a reasonable starting structure.

```bash
agentsecrets project create payments-service
agentsecrets project create auth-service
agentsecrets project create data-pipeline
```

Projects do not have their own access controls — access is managed at the workspace level. All members of a workspace can access all projects in that workspace. If you need to restrict access to a specific set of secrets, use a separate workspace rather than a separate project.

---

## What a workspace is

A workspace is a shared environment for a team. It contains projects, manages team membership, defines the domain allowlist, and is the unit of zero-knowledge cloud sync. There are two types: personal and shared.

---

## Personal workspaces

A personal workspace is created automatically when you sign up. It is tied to your account and intended for individual work. You cannot invite other users to a personal workspace — it is for solo projects, personal agents, and experimentation that does not need to be shared with a team.

---

## Shared workspaces

A shared workspace is created explicitly for team collaboration. The creator is automatically assigned `owner` and `admin` roles. Other developers join by invitation.

```bash
agentsecrets workspace create "Acme Engineering"
agentsecrets workspace invite alice@example.com
agentsecrets workspace invite bob@example.com
```

Use a shared workspace for any project where more than one person needs access to the secrets, for production environments, and for team-owned services and agents.

---

## How project invites interact with workspace types

When you invite someone to a project using `agentsecrets project invite`, AgentSecrets checks what type of workspace that project lives in.

If the project is in a shared workspace, the invite works normally — the invited person is added to the workspace and gains access to that project.

If the project is in a personal workspace, inviting someone would give them access to all of your personal projects and secrets, which is not the intended behavior. Instead, AgentSecrets automatically creates a new shared workspace with the same name as the project, moves the project into it, and adds both you (as owner and admin) and the invitee to the new shared workspace.

This means you never accidentally expose your personal workspace secrets when collaborating on a single project. The collaboration happens in an isolated shared workspace, and your personal workspace remains private.

```bash
# You are in your personal workspace
agentsecrets status
# Workspace: personal (your-username)
# Project:   payments-service

agentsecrets project invite alice@example.com
# → Personal workspace detected
# → Created shared workspace: "payments-service"
# → Moved project to shared workspace
# → Added you as owner and admin
# → Invited alice@example.com
```

After this, your personal workspace is unchanged. `payments-service` now lives in a new shared workspace of the same name, accessible to both you and Alice.

---

## How the three layers interact

The active workspace, project, and environment together determine everything the proxy does:

```bash
agentsecrets status
# Workspace:    Acme Engineering
# Project:      payments-service
# Environment:  production
# Proxy:        running (port 8765)
```

When the proxy receives a request with `X-AS-Inject-Bearer: STRIPE_KEY`, it resolves:

```
keychain entry: acme-engineering:payments-service:production:STRIPE_KEY
```

Switching any of the three layers changes which keychain entry the proxy reads. This is how the same key name resolves to different values in development vs production, or across different projects.