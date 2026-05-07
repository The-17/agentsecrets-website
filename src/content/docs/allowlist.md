# Domain Allowlist

The proxy is deny-by-default. Before injecting any credential, the proxy checks the target domain against the workspace allowlist.

### What this closes
* **SSRF:** If an attacker tricks your app into calling their server, the proxy blocks it.
* **Prompt Injection:** If a malicious response tries to exfiltrate keys, the proxy blocks the outbound request.

### Managing the allowlist
\`\`\`bash
$ agentsecrets workspace allowlist add api.stripe.com
$ agentsecrets workspace allowlist list
\`\`\`
