# What Zero-Knowledge Means in AgentSecrets

"Zero-knowledge" is used in multiple contexts in cryptography and security. This page explains precisely what it means in the context of AgentSecrets, both what the guarantee covers and where its boundaries are.

---

## Definition in this context

In AgentSecrets, zero-knowledge refers to two separate guarantees that operate at different layers.

**The first: the agent cannot read your secrets**. The AI agent, the calling code, and the calling process receive only the API response. The credential value is resolved by the proxy in its own process and injected at the transport layer. It does not cross into the agent's context at any point.

**The second: the AgentSecrets server cannot read your secrets**. Secrets are encrypted client-side before they leave your machine. The server stores ciphertext. It does not hold the decryption key and cannot read your secrets regardless.

These two guarantees are independent. The first protects you from agent-layer exposure. The second protects you from server-side exposure. Together they mean the value is inaccessible to both the agent consuming it and the infrastructure storing it.

---

## Architectural vs policy-based guarantees

The zero-knowledge guarantees in AgentSecrets are architectural, not policy-based.

A policy-based guarantee says "we have decided not to do this, and our configuration enforces that decision." The system could, technically, log credential values or return them to callers. It does not because of rules applied on top of the system.

An architectural guarantee means the system has no mechanism to do this. There is no code path that produces the outcome, no configuration that enables it, no edge case where it happens. In AgentSecrets:

- The proxy returns only the API response: there is no code path that returns the resolved credential value to the caller
- The SDK has no `get()` method: there is no method to call that would retrieve a value
- The audit log schema has no value field: the field does not exist, it is not set to null or redacted, it is simply absent
- The mock testing client records call metadata: no value field exists on recorded calls

You cannot accidentally break these guarantees by misconfiguring something. There is no "verbose mode" that adds a value field to the audit log. There is no debug flag that makes the proxy return resolved values. The architecture has no path for the value to travel anywhere it should not be.

---

## What "structurally cannot" means

Throughout the AgentSecrets documentation you will see the phrase "structurally cannot." This is a precise claim.

When we say the server structurally cannot decrypt your secrets, we mean the server does not hold your workspace key. Without it, the ciphertext it stores is computationally infeasible to reverse. This is not a promise about the server's behavior — it is a statement about what is mathematically possible given what the server possesses.

When we say the audit log structurally cannot contain a credential value, we mean the schema has no value field. A log entry is a fixed set of fields written by the proxy, and none of those fields carry the credential value. This is not a promise about logging configuration — it is a statement about what the log schema is capable of recording.

---

## How this differs from zero-knowledge proofs in cryptography

Zero-knowledge proofs (ZKPs) are a specific cryptographic construction where one party proves knowledge of a value to another party without revealing the value itself. AgentSecrets does not use ZKPs.

The "zero-knowledge" in AgentSecrets refers to the architectural property that the server and the agent end up with zero knowledge of the credential value, not to the cryptographic proof technique. The mechanism is client-side encryption combined with transport-layer injection.

---

## What the server stores and why it cannot reverse it

When you push a secret to cloud sync, the following happens on your machine before anything leaves:

:::step
1. Your workspace key is retrieved from your OS keychain
2. The secret value is encrypted using AES-256-GCM with a key derived from your workspace key via Argon2id
3. The encrypted blob, nonce, and authentication tag are sent to the server
4. Your workspace key never leaves your machine
:::

The server stores:

```json
{
  "id": "entry_9xKp",
  "project": "my-agent",
  "environment": "production",
  "key_name": "STRIPE_KEY",
  "ciphertext": "gAAAAABl7...EncryptedBlob...",
  "nonce": "Zx9k...",
  "tag": "aB3c..."
}
```

Without your workspace key which lives only in your OS keychain and never reaches the server, the ciphertext is computationally infeasible to decrypt. The server has no mechanism to read it.

See [Zero-Knowledge Cloud Sync](/docs/security/cloud-sync) for the full encryption model.