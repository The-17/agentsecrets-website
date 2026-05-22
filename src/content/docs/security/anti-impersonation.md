# Anti-Impersonation (Keychain Auth)

To protect AI agents against context leakage and prompt-injections, AgentSecrets enforces the principle of least privilege: the local proxy holds your credentials, and your code simply points to them by name. However, a local proxy architecture introduces a new attack vector: **binary impersonation**.

If an unauthorized or malicious script runs on your machine, what stops it from calling the local proxy on `localhost:8765` and acting as if it were a legitimate agent?

AgentSecrets solves this through **Process-Level Security** using the `keychain-auth` daemon.

## The Keychain Auth Architecture

AgentSecrets v2.0.0 completely overhauls the local proxy's security model by migrating cryptographic functions and local OS keychain access out of the CLI process, and into a separate, highly secure background daemon (`keychain-auth`).

### 1. Process-Level Hash Verification
When you set up AgentSecrets, the CLI registers its cryptographic hash and absolute path with the `keychain-auth` daemon. 

When your application makes a proxy request, the request is routed through `keychain-auth`. The daemon instantly examines the calling process tree via the operating system's kernel process table. If the binary making the request does not match the registered hash, the request is instantly denied.

### 2. AutoSetup Flow
To ensure a seamless Developer Experience (DX), AgentSecrets features an intelligent `AutoSetup` flow. 
- When you initialize a project, the CLI automatically launches the `keychain-auth` daemon.
- It registers the active terminal session and the CLI binary, ensuring your environment works out-of-the-box.
- It provides a fast-path cache that makes environment status checks (`agentsecrets status`) near-instantaneous.

### 3. Absolute Privilege Separation
Because the `keychain-auth` daemon is the only entity with access to the OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service), the AgentSecrets CLI itself is completely unprivileged. Even if the CLI binary is compromised, it cannot extract your secrets because the daemon strictly controls the decryption context.

## OS Native Access Controls
A critical question regarding the architecture is how `keychain-auth` leverages the **Operating System's native access controls** to prevent bypasses.

`keychain-auth` is a user-space daemon, not a kernel extension. It **cannot** intercept direct API calls to the native OS keychain. If a random new tool calls the native macOS or Windows keychain APIs directly, `keychain-auth` does not step in. 

Instead, `keychain-auth` protects secrets by being the **exclusive owner** of them. Here is how it works in practice:

### 1. The OS Locks the Secret to `keychain-auth`
When you use a client (like `agentsecrets`) to write a secret, it sends the request to the `keychain-auth` daemon via the socket. The daemon then makes the native OS call to save the secret.
Because the `keychain-auth` daemon is the process that actually created the entry, the OS (especially macOS and Linux) **cryptographically binds ownership of that secret to the `keychain-auth` binary.**

### 2. A Rogue Tool Tries to Read It
Imagine you download a malicious tool, and it tries to bypass `keychain-auth` by directly querying the native OS keychain for that secret.

**On macOS:**
The macOS kernel looks at the request and says, *"Wait, `keychain-auth` created this secret, and you are not `keychain-auth`."*
macOS will immediately block the read and throw up a highly visible system UI prompt:
> *"MaliciousTool wants to access key 'proj_123:development:DATABASE_URL' in your keychain. Do you want to allow this?"*

If the user clicks "Deny", the tool gets nothing. 

**On Linux (Secret Service):**
GNOME Keyring and KWallet behave similarly. They map secrets to the application that created them. A random new CLI trying to access a collection created by another app will trigger a desktop environment prompt asking the user for authorization or the keyring password.

**On Windows (Credential Manager):**
Windows is unfortunately the weakest here. Generic credentials stored in the Windows Credential Manager can typically be read by any process running under the same user account. If a rogue tool runs as you, it can read your generic credentials natively without a prompt.

### Summary
`keychain-auth` doesn't need to "step in" to block rogue tools because it relies on the OS to do the blocking. 

By having `keychain-auth` act as the sole broker that writes the secrets, the OS locks all other apps out. Legitimate client tools must then connect through `keychain-auth`'s socket, where it applies its own strict PID/Hash verification to decide who gets access.

## Summary of Protection
With Keychain Integration (Anti-Impersonation), AgentSecrets ensures that:
- **Only authorized binaries** can utilize the proxy.
- **Malicious scripts** cannot impersonate your CLI or AI agents.
- **Secrets remain decoupled** from all application context, residing strictly in the daemon's isolated memory space.
