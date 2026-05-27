# OWASP Top 10 Mitigation (ASI:2026)

Autonomous AI agents and multi-agent systems present unique security vectors that traditional application security models fail to address. AgentSecrets is explicitly engineered to mitigate the critical vulnerabilities identified in the **OWASP Top 10 Risks for Agentic AI Systems (ASI:2026)**.

By moving credentials below the application runtime and managing them at the transport layer, AgentSecrets provides structural defenses against agentic vulnerabilities.

---

## Mitigation Mapping

| OWASP Agentic Risk | Hazard Description | AgentSecrets Mitigation |
| :--- | :--- | :--- |
| **ASI02: Tool Misuse & Exploitation** | Hijacked tool calls targeting rogue domains | Enforces outbound domain allowlists at the proxy boundary; tools only hold abstract references |
| **ASI03: Agent Identity & Privilege Abuse** | Exploiting over-privileged agents or stolen keys | Cryptographic Agent Tokens track each agent's calls and support instant, zero-downtime revocation |
| **ASI04: Agentic Supply Chain Compromise** | Malicious packages/dependencies reading env vars | Eliminates plaintext `.env` files; `keychain-auth` validates process binary signatures |
| **ASI06: Memory & Context Poisoning** | Plaintext keys entering memory/traces via reflection | Active transport scanning automatically redacts reflected credentials from responses |

---

## Detailed Risk Profiles

### ASI02: Tool Misuse & Exploitation
* **The Risk:** A compromised agent is manipulated into abusing connected tools, executing unauthorized actions, or attempting Server-Side Request Forgery (SSRF) by calling rogue external API endpoints.
* **The Mitigation:** AgentSecrets acts as a secure network gateway. It enforces strict **Workspace Allowlists** on outbound HTTP/HTTPS requests at the proxy layer. If a compromised agent is redirected to call an unauthorized domain, the connection is rejected at the proxy boundary before any request is transmitted or secrets are resolved.

### ASI03: Agent Identity & Privilege Abuse
* **The Risk:** In multi-agent workflows, over-privileged agents can abuse credentials, or an attacker can hijack a compromised agent to access sensitive systems without detection.
* **The Mitigation:** AgentSecrets implements **Cryptographic Agent Identity (Agent Tokens)**. Outbound calls are signed with an agent-specific token, creating an immutable audit trail of exactly which agent instance made each call. If an instance is compromised, its specific token can be revoked instantly via the CLI or dashboard without rotating the underlying API keys, preventing cascading privilege abuse.

### ASI04: Agentic Supply Chain Compromise
* **The Risk:** Third-party integration libraries, database packages, or agent frameworks in your execution tree can contain malicious backdoors designed to scan configuration files or read local system environment variables.
* **The Mitigation:** AgentSecrets eliminates plaintext `.env` files entirely by storing credentials natively in the secure OS keychain. Additionally, the `keychain-auth` daemon verifies the cryptographic binary hash of any local process attempting to resolve secrets. Unauthorized scripts or compromised package dependencies are structurally blocked from reading the keychain.

### ASI06: Memory & Context Poisoning
* **The Risk:** Plaintext credentials reflected in API errors or stack traces can easily enter the agent's long-term memory or vector database context. This permanently poisons the agent's context, making the secrets retrievable in subsequent prompts.
* **The Mitigation:** The AgentSecrets proxy performs real-time transport-level response scanning. If an upstream service reflects a key back in its payload, the proxy automatically redacts the value (`[REDACTED_BY_AGENTSECRETS]`) before passing the sanitized response back to the agent, ensuring plaintext secrets never enter the agent's memory or long-term vector databases.
