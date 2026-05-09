# Domain Allowlist

The proxy is deny-by-default. Before injecting any credential, the proxy checks the target domain against the workspace allowlist. If the domain is not authorized, the proxy returns 403 and logs the attempt. No credential is resolved, no request leaves your machine.

## What this closes

**SSRF**: if an attacker tricks your agent into making a request to a server they control, the proxy blocks it before any credential is injected.

**Prompt injection exfiltration**: if malicious content instructs your agent to send credentials to an attacker-controlled URL, the proxy blocks the outbound request at the domain check, before anything is decrypted.

**Misconfiguration**: a tool that accidentally calls the wrong endpoint is blocked before any credential is exposed.

## Managing the allowlist

```bash
# Add one or more domains
agentsecrets workspace allowlist add api.stripe.com
agentsecrets workspace allowlist add api.stripe.com api.openai.com api.github.com

# View authorized domains
agentsecrets workspace allowlist list

# View logs
agentsecrets workspace allowlist log
```

> Allowlist changes require admin role and password confirmation. Non-admin team members cannot change what domains agents can reach.

## Domain matching

The allowlist matches on the exact domain. Subdomains must be listed separately.

```bash
# This authorizes api.stripe.com only
agentsecrets workspace allowlist add api.stripe.com

# A request to files.stripe.com would be blocked
# Add it explicitly if needed
agentsecrets workspace allowlist add files.stripe.com
```
