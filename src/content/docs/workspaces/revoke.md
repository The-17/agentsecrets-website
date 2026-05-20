# Revoking Access

When a team member leaves a project or organization, their access to the workspace must be revoked immediately. Because AgentSecrets is built on a zero-knowledge architecture, removing a user involves rotating the cryptographic keys that secure your team's secrets.

---

## Removing a team member

Only workspace administrators (`Admin`) or the workspace owner can remove members from a shared workspace.

:::step
1. **Identify the member:**
   List the active members of your workspace to find the email of the person you need to remove:
   ```bash
   agentsecrets workspace members list
   ```

2. **Execute the removal command:**
   Run the `workspace remove` command to revoke their access:
   ```bash
   agentsecrets workspace remove developer@acme.com
   ```

3. **Confirm with password:**
   The CLI will prompt you to enter your administrator password. This authentication is required to decrypt the current workspace key and initiate the key rotation process.
:::

---

## What happens to their pulled secrets

When a developer's access is revoked:
- **No remote access**: They can no longer log in to the workspace, switch to it, or pull any updates.
- **Local credentials remain**: Any secrets that were already pulled to their local OS keychain or `.env` files will remain on their physical machine. AgentSecrets cannot delete files or keychain entries from a remote, unmanaged device.
- **Rotation required**: Because the developer still has access to the local copies of the old secrets, you must rotate any credentials they had access to.

---

## Rotating secrets after offboarding

To fully secure your environment after offboarding a developer, you must perform two types of rotation:

### 1. Workspace key rotation (automatic)
When you run `agentsecrets workspace remove`, the CLI automatically rotates the underlying **Workspace Key** to prevent the revoked user from accessing future secrets or updates.

Under the hood, the following zero-knowledge key re-encryption workflow occurs:
:::step
1. **New Key Generation**: Your CLI generates a brand-new workspace keypair.
2. **Secret Re-encryption**: The CLI decrypts all existing secrets using the old workspace key and re-encrypts them using the new workspace key.
3. **Envelope Recreation**: The CLI fetches the public keys of all *remaining* workspace members, encrypts the new workspace key for each of them, and uploads these new envelopes to the backend.
4. **Revocation**: The backend deletes the old envelopes. The revoked user can no longer decrypt any new secret updates or fetch new workspace keys.
:::

### 2. Credential value rotation (manual)
Since the revoked developer may still have local copies of the active keys, you must rotate the actual values of all sensitive credentials (such as Stripe API keys, database passwords, or OpenAI tokens) that were present in the workspace.

:::step
1. **Rotate values at the provider:**
   Generate new API keys or change passwords at the service provider (e.g., Stripe, AWS, GitHub).

2. **Update the secrets in AgentSecrets:**
   Run the `secrets set` command to update the values. This will encrypt them with the new workspace key and sync them to the remaining team members:
   ```bash
   agentsecrets secrets set STRIPE_KEY=sk_live_new... OPENAI_KEY=sk-proj-new...
   ```
:::

> [WARNING]
> Failing to rotate credential values after removing a member leaves your infrastructure vulnerable to credential leaks if the offboarded developer's machine is compromised or if they retain access to local environments.
