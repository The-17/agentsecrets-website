# The Zero-Knowledge Difference

In traditional cybersecurity, "zero-knowledge" means the cloud provider has no way to decrypt your data. While AgentSecrets enforces this server-side boundary, the unique threat model of AI agents requires a far more robust definition.

For AgentSecrets, **Zero-Knowledge is holistic**: the plaintext credential value is structurally absent and completely invisible at every single point in the entire architecture—from the sync servers, to the local disk, to the AI agent’s process memory, and the application log traces.

---

## The Four Pillars of Holistic Zero-Knowledge

AgentSecrets eliminates the plaintext credential value from the four major exposure points in modern AI and developer workflows:

### 1. Zero-Knowledge at the Server (Cloud Blindness)
:::step
Plaintext credential values **never leave your local machine**.
* **Local-Only Decryption**: Symmetric encryption (AES-256-GCM) occurs client-side using a **Workspace Key** derived locally.
* **Blind Coordinator**: The sync server only stores and routes base64-encoded ciphertext blobs. Because the server does not hold the Workspace Key, it is mathematically impossible for the server or any external adversary to decrypt your credentials.
* **Sealed Asymmetric Sharing**: Teammates exchange access using zero-trust NaCl SealedBoxes (Curve25519). Decryption keys are decrypted only within the recipient's local environment.
:::

### 2. Zero-Knowledge at the Agent (Runtime Context Decoupling)
:::step
Unlike legacy secrets managers, the AI agent **never holds or sees the plaintext credential value**.
* **By-Reference Execution**: The agent process only ever references key names (e.g., `STRIPE_KEY` or `OPENAI_KEY`).
* **Transport-Layer Injection**: The local proxy intercepts the outbound request, resolves the secret from the secure local keychain inside an isolated process space, injects it into the network payload, and immediately routes the request.
* **RAM Protection**: The calling application's process memory and variable scope remain completely blind to the actual secret value, neutralising prompt injection and compromised dependencies.
:::

### 3. Zero-Knowledge at the Disk (Keychain Delegation)
:::step
Plaintext secrets are **never written to files**.
* **Zero Plaintext Files**: Plaintext `.env` files are entirely eliminated.
* **OS-Level Vaulting**: Secrets are stored in the operating system's native secure credential manager (macOS Keychain, Windows Credential Manager, or Linux Secret Service).
* **Impersonation Prevention**: Access is guarded by the `keychain-auth` daemon, which cryptographically verifies the calling binary's hash before permitting secret resolution.
:::

### 4. Zero-Knowledge in Logs and Observability (Active Redaction)
:::step
Raw values are **never recorded**.
* **No Value Schema**: The audit log schema structurally lacks any field for credential values—it only tracks metadata (timestamps, key references, response codes).
* **Automated Redaction**: If an upstream API reflects a key back in its response payload (such as in an error message), the proxy active-scans and redacts it (`[REDACTED_BY_AGENTSECRETS]`) before delivering the response to the agent, protecting downstream LLM traces and developer consoles.
:::

---

## Runtime Retrieval vs. Transport-Layer Injection

To understand the runtime zero-knowledge boundary, compare how credentials flow in standard setups versus AgentSecrets:

### Runtime Retrieval (The Standard Model)

In traditional systems, the application must fetch the raw value before using it:

```python
# The application fetches the actual secret value into its RAM
token = secrets_manager.get("STRIPE_KEY") 
# token = "sk_live_51H..." (plaintext is now exposed in process memory!)

response = requests.get(
    "https://api.stripe.com/v1/balance",
    headers={"Authorization": f"Bearer {token}"}
)
```

> [!WARNING]
> Once `token` is in memory, it is accessible to any third-party dependency, can be logged, and is vulnerable to prompt injection if processed by an LLM.

### Transport-Layer Injection (The AgentSecrets Model)

Under AgentSecrets, the agent passes a key reference; the actual value is injected dynamically at the network level:

```python
# The agent works strictly with key references
response = client.call(
    "https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)
# "sk_live_51H..." never existed in this application's process.
```

The plaintext value exists only within the milliseconds required to form the outbound request packet at the network boundary, ensuring total runtime isolation.

---

## The Structural Guarantee

AgentSecrets makes this zero-knowledge promise structural, rather than policy-based.

A **policy-based guarantee** relies on discipline: *"We promise not to log your secrets,"* or *"We configured our tracing tools to ignore credentials."* These policies are fragile, prone to human error, and easily broken by a misplaced configuration line or a verbose debug mode.

A **structural guarantee** is built into the architecture:
* The SDK lacks any `.get_value()` function.
* The backend database schema cannot accept plaintext.
* The proxy automatically filters and replaces reflected values.

Because the system is architected without a pathway for plaintext values to travel, it is physically impossible to leak them—even by accident.
