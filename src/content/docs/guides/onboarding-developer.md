# Onboarding a Developer

Onboarding a new developer to a project using `.env` files usually involves them asking another developer to securely message them the keys over Slack, or digging through a password manager. 

With AgentSecrets, onboarding takes 30 seconds.

## The Onboarding Flow

:::step
1. **Invite them to the workspace:**
   ```bash
   agentsecrets workspace invite dev@yourcompany.com
   ```
2. **They accept and pull:**
   The developer runs the following commands:
   ```bash
   agentsecrets login
   agentsecrets secrets pull
   ```
:::

That is it. Their local OS keychain is now populated with the encrypted values. They can start the proxy and run the application immediately. 

Because of the Zero-Knowledge E2E encryption, their CLI automatically negotiated an ECDH key exchange with your CLI via the cloud backend. The server never saw the keys in plaintext during the transfer.
