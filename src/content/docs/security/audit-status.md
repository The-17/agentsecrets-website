# Third-Party Security Audit Status

*Last Updated: May 2026*

AgentSecrets is currently undergoing a comprehensive, independent third-party security audit by a leading cybersecurity firm specializing in applied cryptography and zero-knowledge systems.

## Audit Scope

The ongoing audit covers the following components:
:::step
1. **The local Go proxy**: Verifying TLS interception, SSRF protection, and memory safety during injection.
2. **The E2EE Cryptography**: Validating the AES-256-GCM implementation, ECDH key exchanges for team sharing, and Argon2id key derivation.
3. **The CLI Sync Engine**: Ensuring that ciphertext blobs are not susceptible to replay attacks or downgrade attacks.
:::

## Timeline

We expect the final audit report to be published in Q3 2026. Once complete, the full, unredacted report will be linked directly on this page and the repository README.

## How to be notified

To receive an update when the audit is published, please subscribe to our [GitHub Releases](https://github.com/The-17/agentsecrets) or join our community Discord.
