# Migrating from dotenv-vault

`dotenv-vault` is a tool for sharing encrypted `.env` files across a team. While it simplifies dotenv management, it still relies on loading plaintext credentials directly into process environment variables (`process.env` or `os.environ`), exposing them to security risks in development and AI-assisted workflows.

This guide walks you through migrating from `dotenv-vault` to AgentSecrets, achieving a zero-knowledge setup where secrets are secured in your local OS Keychain and injected only when and where they are needed.

---

## Architectural Comparison

| Feature | dotenv-vault | AgentSecrets |
|---|---|---|
| **Storage Location** | Decrypted local `.env` files / Process memory | Secure OS Keychain (no plaintext files) |
| **Team Synchronization** | Cloud-stored keys decrypting `.env.vault` | End-to-End Encrypted (E2E) zero-knowledge sync |
| **Runtime Access** | Exposes all secrets to the process environment | Proxy transport-layer injection OR runtime execution spawning |
| **Vulnerability to Code Inspection** | High (any tool can print `process.env` / `.env` files) | Eliminated (secrets never exist in the filesystem or target process memory) |

---

## Step-by-Step Migration

:::step
1. **Retrieve your decrypted credentials:**
   Ensure you have your current decrypted secrets loaded locally. If you do not have a local `.env` file, run the decrypt command using the `dotenv-vault` CLI:
   ```bash
   npx dotenv-vault decrypt
   ```

2. **Initialize your AgentSecrets workspace:**
   Initialize a new project and workspace in your directory:
   ```bash
   agentsecrets init
   ```

3. **Import your secrets:**
   Push your decrypted local `.env` file into AgentSecrets. This command automatically encrypts each credential value locally and stores it in your secure OS Keychain:
   ```bash
   agentsecrets secrets push
   ```
   Verify they have been imported correctly:
   ```bash
   agentsecrets secrets list
   ```

4. **Remove dotenv-vault files and keys:**
   Clean up your repository by deleting the dotenv-vault configuration and encrypted keys. Run:
   ```bash
   rm .env.vault .env.project .env.keys .env
   ```
   Remove any `DOTENV_KEY` environment variables from your shell profile, system environment, or hosting provider configuration.

5. **Update your code integration:**
   Remove the `dotenv-vault` setup from your application code:
   
   **Before (Node.js):**
   ```javascript
   require('dotenv-vault').config();
   // Secrets are now exposed in process.env
   ```
   
   **After (Zero-Knowledge CLI Environment Injection):**
   Simply launch your app prefixing it with the AgentSecrets runtime execution command:
   ```bash
   agentsecrets env -- node app.js
   ```
   
   **After (Zero-Knowledge Proxy Integration):**
   Configure your application to query external APIs through the local proxy:
   ```javascript
   const response = await fetch('http://localhost:8765/proxy', {
     headers: {
       'X-AS-Target-URL': 'https://api.stripe.com/v1/balance',
       'X-AS-Inject-Bearer': 'STRIPE_KEY'
     }
   });
   ```
:::

---

## Zero-Knowledge Advantages

By completing this migration, you secure your developer environment:
- **No Plaintext Leakage**: Plaintext credentials never reside on your local storage drive, preventing scanning or git-commit accidents.
- **Role-Based Workspaces**: Securely manage multiple environment scopes (development, staging, production) from a single CLI without shuffling `.env` files.
- **Complete Audit Trail**: Every access attempt and API call is cryptographically audited, giving your team full visibility into where and how secrets are utilized.