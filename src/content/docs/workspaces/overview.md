# Workspaces

A workspace is a shared environment for a team. It contains projects, manages team membership, and holds the domain allowlist. Secrets are encrypted client-side before upload, the server holds ciphertext. Teammates who join the workspace can pull secrets to their own OS keychain without anyone sharing values directly.

```bash
# Create a workspace
agentsecrets workspace create "Acme Engineering"

# Switch to an existing workspace
agentsecrets workspace switch "Acme Engineering"

# List all workspaces you belong to
agentsecrets workspace list
```

## Inviting teammates

```bash
agentsecrets workspace invite alice@theseventeen.co
agentsecrets workspace invite bob@theseventeen.co carol@theseventeen.co
```

The invited developer os added to the workspace, when they run `agentsecrets login`, they can switch to the workspace and pull secrets.

## Onboarding a new developer

```bash
# New developer runs this on their machine
agentsecrets login
agentsecrets workspace switch "The Seventeen Engineering"
agentsecrets project use payments-service
agentsecrets secrets pull
```

No credentials are shared over Slack, email, or any other channel. The new developer's OS keychain receives the secrets directly through the encrypted sync layer.

---

## Roles

Workspaces have two roles: member and admin.

**Members** can read secrets, pull from cloud, push to cloud, run the proxy, and use all agent-facing features.

**Admins** can additionally modify the domain allowlist, invite and remove teammates, and change member roles.

```bash
# Grant admin role (requires admin)
agentsecrets workspace promote alice@theseventeen.co

# Revoke admin role (requires admin)
agentsecrets workspace demote bob@theseventeen.co
```

Allowlist modifications require admin role and password confirmation at the time of the change. This means even an admin cannot accidentally change the allowlist without an explicit authenticated action.
