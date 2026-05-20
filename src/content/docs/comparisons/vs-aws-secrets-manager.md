# AgentSecrets vs AWS Secrets Manager

AWS Secrets Manager is a robust cloud service for storing and retrieving secrets, heavily integrated into the AWS ecosystem (IAM, KMS, Lambda, ECS).

## The AI Agent Vulnerability

Like HashiCorp Vault, AWS Secrets Manager operates on a "request and receive" model. Your application calls `GetSecretValue`, and AWS returns the plaintext secret to your application over the network. 

If your application is an AI agent, pulling secrets from AWS Secrets Manager brings those secrets directly into the LLM's executing environment. This violates the **Zero-Knowledge Principle**, exposing the credentials to prompt injections or malicious tool executions.

## How AgentSecrets Differs

:::step
1. **No `get()` Method**: AgentSecrets never returns a plaintext value to the calling application. It acts as an intercepting proxy, injecting credentials at the transport layer.
2. **Local E2E Encryption**: AWS Secrets Manager encrypts data at rest using AWS KMS. The keys are managed by AWS. AgentSecrets encrypts your secrets locally on your machine using AES-256-GCM *before* syncing them to the cloud. The AgentSecrets servers only ever store ciphertext and cannot decrypt it.
3. **Developer Experience**: AWS requires configuring IAM roles, policies, and the AWS SDK. AgentSecrets is designed to be as simple as an `.env` file, with a local CLI and automatic cross-environment syncing.
:::

## Using them together

If your enterprise mandates AWS Secrets Manager for storage, you can build a hybrid model. Your CI/CD pipeline can pull secrets from AWS Secrets Manager and inject them into the AgentSecrets proxy at deployment time, ensuring that the running AI agent still benefits from transport-layer injection rather than holding the secrets directly.
