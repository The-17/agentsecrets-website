# SSRF Protection

Because the AgentSecrets proxy holds permission to decrypt and inject highly sensitive credentials, it represents a high-value target. If an AI agent experiences prompt injection or is compromised, an attacker might attempt to force the agent to make requests to internal services or cloud metadata endpoints to steal credentials or exfiltrate private data. 

To prevent this, the proxy includes hardcoded, multi-layer Server-Side Request Forgery (SSRF) protections.

---

## What SSRF is

Server-Side Request Forgery (SSRF) is a vulnerability where an attacker abuses server-side functionality to read or write data to internal resources. In AI agent systems, SSRF occurs when an agent is instructed by malicious user input or untrusted context to make HTTP calls to internal resources, such as:
- Cloud metadata endpoints (e.g., AWS IMDSv2).
- Internal microservices, databases, or administration panels.
- Loopback addresses (`localhost`) running development services.

If these calls are routed through the proxy, the attacker could exploit the proxy's privileges to bypass firewalls and access internal systems.

---

## What the proxy blocks by default

The proxy employs a **deny-by-default** architecture, enforcing security at three levels before any network request is initiated:

:::step
1. **Domain Allowlist Validation**: The proxy verifies that the target domain exists in the active workspace allowlist. If the domain is not allowlisted, the call is blocked immediately.
2. **DNS Resolution Verification**: If the domain is allowlisted, the proxy resolves the DNS records itself and inspects all resolved IP addresses *prior* to opening any socket connection.
3. **SSRF Checks**: If any IP address resolves to a private, loopback, or cloud-specific range, the request is rejected with a `403 Forbidden` response and logged as a security alert.
:::

---

## Private IP ranges

The proxy blocks all outbound requests attempting to connect to private IP address ranges as defined by the Internet Assigned Numbers Authority (IANA).

The blocked IPv4 ranges include:
- **`10.0.0.0/8`**: Private Network (RFC 1918)
- **`172.16.0.0/12`**: Private Network (RFC 1918)
- **`192.168.0.0/16`**: Private Network (RFC 1918)
- **`100.64.0.0/10`**: Carrier-Grade NAT (RFC 6598)
- **`169.254.0.0/16`**: Link-Local (RFC 3927) — **This protects cloud metadata endpoints** such as AWS IMDS (`169.254.169.254`), Google Cloud metadata, and Azure Instance Metadata Service.

The blocked IPv6 ranges include:
- **`fc00::/7`**: Unique Local Addresses (RFC 4193)
- **`fe80::/10`**: Link-Local Addresses (RFC 4291)

---

## Localhost blocking

To prevent rogue calls to other local development servers, databases, or Docker containers running on the same host machine, the proxy strictly blocks loopback ranges:

- **`127.0.0.0/8`**: Loopback IPv4 addresses (including `127.0.0.1`)
- **`::1/128`**: Loopback IPv6 address

### DNS Rebinding Defense
A common technique to bypass localhost blocking is **DNS Rebinding**. An attacker creates a domain (e.g., `evil.com`) that initially resolves to a safe public IP during the validation phase, but resolves to `127.0.0.1` during the socket connection phase.

To defend against this:
- The proxy resolves the DNS name exactly once per request.
- The resolved IP is validated against the blocked list.
- The proxy opens the TCP connection directly to the validated IP address, bypassing the standard operating system resolver for the connection phase to prevent mid-request IP shifts.

---

## Non-HTTPS blocking

By default, the proxy enforces the use of HTTPS for all outbound API requests:

```bash
# This will be blocked immediately by the proxy
agentsecrets call --url http://api.stripe.com/v1/balance --bearer STRIPE_KEY
```

Enforcing TLS guarantees:
- Plaintext credentials (like Stripe or OpenAI tokens) are never sent unencrypted over the wire.
- Intermediaries cannot sniff the injected credentials during transit.
- Protection against Man-in-the-Middle (MitM) attacks attempting to downgrade connections.

> [NOTE]
> For testing purposes in local development environments, you can bypass non-HTTPS blocking for `localhost` destinations ONLY by starting the proxy with the `--allow-local-http` flag:
> ```bash
> agentsecrets proxy start --allow-local-http
> ```
