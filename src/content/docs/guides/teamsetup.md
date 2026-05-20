# Setting Up a Team

This guide covers setting up AgentSecrets for a team where multiple developers share credentials and multiple AI agents operate in the same workspace.

### Step 1 — Create the workspace (admin)
:::step

```bash
agentsecrets workspace create "Acme Engineering"
```
:::

### Step 2 — Create projects for each service
:::step

```bash
agentsecrets project create payments-service
agentsecrets project create auth-service
agentsecrets project create data-pipeline
```
:::

### Step 3 — Add credentials to each project
:::step

```bash
agentsecrets project use payments-service
agentsecrets secrets set STRIPE_KEY=sk_live_...
agentsecrets secrets set PAYSTACK_KEY=sk_live_...

agentsecrets project use auth-service
agentsecrets secrets set JWT_SECRET=...
agentsecrets secrets set OAUTH_CLIENT_SECRET=...
```
:::

### Step 4 — Set up environments for production-ready projects
:::step

```bash
agentsecrets project use payments-service
agentsecrets environment switch development
agentsecrets secrets set STRIPE_KEY=sk_test_...

agentsecrets environment switch production
agentsecrets secrets set STRIPE_KEY=sk_live_...
```
:::

### Step 5 — Authorize domains for the workspace
:::step

```bash
agentsecrets workspace allowlist add \
  api.stripe.com \
  api.paystack.co \
  api.openai.com
```
:::

### Step 6 — Invite teammates
:::step

```bash
agentsecrets workspace invite alice@acme.com
agentsecrets workspace invite bob@acme.com
agentsecrets workspace invite carol@acme.com
```
:::

### Teammate onboarding (each new developer runs this)
:::step

```bash
agentsecrets init          # or agentsecrets login on returning machines
agentsecrets workspace switch "Acme Engineering"
agentsecrets project use payments-service
agentsecrets secrets pull
agentsecrets proxy start
```

That is it. No credentials were shared over any channel.
:::