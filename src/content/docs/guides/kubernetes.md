# Kubernetes Deployment (Coming Soon)

Currently, AgentSecrets is optimized for **local development environments** and relies on the native OS Keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service) to securely materialize and inject credentials. 

Because the AgentSecrets **Cloud Resolver** has not yet been released, the proxy cannot currently function outside of a local desktop environment. It cannot independently fetch encrypted secrets from cloud providers or synchronize them directly into a Kubernetes cluster.

## The Roadmap

Support for production deployments is currently in active development. Once the Cloud Resolver is released, AgentSecrets will support two primary Kubernetes deployment models:

### 1. The Sidecar Pattern
:::step
The proxy will run as a sidecar container inside your AI Agent's Pod. It will intercept outbound `localhost` traffic, authenticate against the Kubernetes native Secrets API (or AWS/GCP Secret Manager) using the Pod's ServiceAccount, and inject the decrypted credentials directly into the transport layer.
:::

### 2. The DaemonSet Pattern
:::step
For high-density micro-agent architectures, the proxy will run as a node-level DaemonSet to reduce memory overhead, intercepting and injecting credentials based on the calling Pod's cryptographically signed Agent Identity token.
:::

---

> [INFO]
> If you are deploying your AI agents to production today, we recommend falling back to standard Infrastructure as Code (IaC) secret injection methods (e.g., HashiCorp Vault sidecars or AWS Secrets Manager env injection) until the AgentSecrets Cloud Resolver is generally available.
