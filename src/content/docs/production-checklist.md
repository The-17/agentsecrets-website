# Production Checklist

Before deploying an AgentSecrets-powered agent to production, work through this checklist. Each item corresponds to a specific security or reliability concern.

---

## Secrets hygiene

[ ] **All credentials are stored in AgentSecrets** — no `.env` files, no hardcoded values, no environment variables set outside of AgentSecrets
[ ] **Production secrets are set in the production environment** — run `agentsecrets environment switch production` and `agentsecrets secrets list` to confirm coverage
[ ] **Cross-environment diff is clean** — run `agentsecrets secrets diff --from development --to production` and resolve any missing keys
[ ] **No `.env` files in your repository** — check `.gitignore` includes `.env`, `.env.*`, and `.env.local`
[ ] **Storage mode is set to keychain only (mode 1)** — unless your deployment environment specifically requires mode 2, keychain only is the correct choice for production

---

## Domain allowlist

[ ] **Only required domains are authorized** — run `agentsecrets workspace allowlist list` and remove any domains not needed in production
[ ] **Every domain your agent calls is explicitly listed** — test your agent's full call surface and verify all target domains are in the allowlist
[ ] **No overly broad entries** — the allowlist matches exact domains; review for anything that should be scoped more narrowly

---

## Agent identity

[ ] **Production agents use issued identity** — anonymous and declared identity are suitable for development; production agents should use cryptographically issued tokens
[ ] **Each agent has its own token** — do not share tokens between agents; individual tokens can be revoked without affecting others
[ ] **Tokens are stored securely** — issued tokens should be stored in the OS keychain or a secrets manager, not in config files or environment variables
[ ] **Unused tokens are revoked** — run `agentsecrets agent token list` for each agent and revoke any tokens no longer in use

---

## Audit log

[ ] **Audit log is accessible** — run `agentsecrets log list` and confirm entries are appearing
[ ] **No anonymous calls in production** — run `agentsecrets log list --identity anonymous` and resolve any identity coverage gaps
[ ] **Log export process is in place** — if you need audit logs for compliance, test `agentsecrets log export --format csv` and confirm the output meets your requirements

---

## Team access

[ ] **Production allowlist changes require admin confirmation** — verify that non-admin team members cannot modify the allowlist
[ ] **Offboarded developers have been removed** — run `agentsecrets workspace list` and review member access
[ ] **Production workspace is a shared workspace** — personal workspaces are for individual projects; production team environments should use shared workspaces with appropriate role assignments

---

## Cloud sync

[ ] **Secrets are pushed to cloud** — run `agentsecrets secrets diff` in the production environment and confirm there are no local-only entries
[ ] **Pull works on a fresh machine** — test that a new team member can run `agentsecrets login`, switch to the workspace, and pull production secrets successfully

---

## Proxy

[ ] **Proxy starts cleanly in your deployment environment** — run `agentsecrets proxy start` and `agentsecrets proxy status` to confirm
[ ] **Session token is handled correctly** — if your deployment restarts the proxy, ensure dependent processes handle session token rotation
[ ] **Proxy logs are being reviewed** — set up a process to review `agentsecrets proxy logs` periodically or integrate with your observability stack via log export

---

## Final verification

Run `agentsecrets status` and confirm:

```
Logged in as:  your-prod-account@example.com
Workspace:     your-production-workspace
Project:       your-production-project
Environment:   production
Proxy:         running (port 8765)
Last sync:     recent
```

Then make a test call and confirm the audit log entry appears:

```bash
agentsecrets call --url https://api.stripe.com/v1/balance --bearer STRIPE_KEY
agentsecrets log list --tail
```

If both succeed, your production setup is correct.