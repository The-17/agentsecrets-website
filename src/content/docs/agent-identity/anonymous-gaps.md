# Finding Anonymous Coverage Gaps

A security system is only as strong as its weakest link. In AgentSecrets, allowlists protect where your requests can go, but **Agent Identity** ensures you know who is making them. 

An **Anonymous Coverage Gap** exists whenever a client resolves a secret through the proxy without declaring or proving its identity. Finding and fixing these gaps is a critical part of hardening your agentic security infrastructure.

---

## The --identity anonymous filter

The primary tool for uncovering gaps is the `--identity anonymous` log filter. This filter screens the audit log to isolate requests that succeeded in resolving a secret but did not provide an `agent_id` or an `agent_token`.

To search for gaps in the current workspace, run:

```bash
agentsecrets log list --identity anonymous --last 100
```

> [TIP]
> Run this command as part of your weekly security review or integrate it into a CI/CD audit runner. Any output indicates a system or script using credentials without attribution.

---

## What gaps look like

In the audit log, a gap appears as a successful call where the identity metadata is missing:

```
TIMESTAMP  KEY         TARGET URL                      IDENTITY   LEVEL       STATUS
10:14:02   STRIPE_KEY  api.stripe.com/v1/charges       null       anonymous   200 OK
10:14:15   GITHUB_KEY  api.github.com/repos/issue      null       anonymous   200 OK
```

These gaps typically stem from three common scenarios:

:::step
1. **Legacy Scripts**: Older automated scripts that were written before Agent Identity was implemented, which use the default SDK initialization without parameters.
2. **Direct Proxy Bypass**: HTTP calls routed through the local proxy endpoint (`localhost:8765/proxy`) that include target URLs and injection headers but omit the `X-AS-Agent-ID` or `X-AS-Agent-Token` headers.
3. **Misconfigured Containers**: Background worker tasks deployed in Docker or Kubernetes where the container orchestrator failed to inject the `AGENTSECRETS_AGENT_ID` or `AGENTSECRETS_TOKEN` environment variables.
:::

---

## Resolving each gap

Eliminating anonymous gaps follows a structured verification and upgrade process.

:::step
### 1. Pinpoint the source
Inspect the anonymous log entry to extract diagnostic details. Look at the `timestamp`, the `target_url`, the `key` accessed, and the calling client's IP address. This metadata allows you to locate the physical machine or application server hosting the anonymous caller.
:::

:::step
### 2. Update the implementation
Once the code or service is located, upgrade it to a declared or cryptographically verified identity.

* **For Python scripts**, pass the agent parameter:
  ```python
  # Upgrade from anonymous client
  client = AgentSecrets(agent_id="my-background-service")
  ```
* **For raw HTTP requests**, add the headers:
  ```bash
  # Upgrade HTTP request headers
  curl http://localhost:8765/proxy \
    -H "X-AS-Target-URL: https://api.stripe.com/v1/balance" \
    -H "X-AS-Inject-Bearer: STRIPE_KEY" \
    -H "X-AS-Agent-Token: agt_ws01hxyz_myToken..."
  ```
* **For containerized apps**, verify your deployment YAML or Dockerfile injects the variables:
  ```yaml
  env:
    - name: AGENTSECRETS_AGENT_ID
      value: "kubernetes-worker-pod"
  ```
:::

:::step
### 3. Enforce strict identity verification
Once you have resolved all known anonymous calls, configure your workspace to reject unattributed requests entirely. 

To prevent future anonymous calls, toggle the **Strict Identity** mode via the CLI:

```bash
agentsecrets workspace update --strict-identity=true
```

[IMPORTANT]
Enabling Strict Identity causes the credential proxy to block any request that does not contain a declared or issued identity. Anonymous requests will fail with a `403 Forbidden` status. Ensure all services have been migrated before enabling this in production.
:::
