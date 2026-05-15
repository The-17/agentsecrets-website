# Migrating from .env Files

If your current setup relies on `.env` files, this guide walks you through moving to AgentSecrets. You can run both in parallel during the transition and cut over when you are ready.

---

## Why .env files are risky with AI agents

> [CAUTION]
> `.env` files are particularly dangerous when using AI agents. Since agents often have filesystem access, they can inadvertently read or leak your secrets if they are stored in plaintext on disk.

AgentSecrets eliminates all of these vectors by keeping the value out of the filesystem (in keychain-only mode), out of environment variables, and out of any accessible process context.

---

## Importing your existing .env

```bash
# Confirm you are in the right project and environment
agentsecrets status

# Import from .env or .env.development
agentsecrets secrets push
```

This reads your `.env` file, encrypts each value locally, uploads the encrypted blobs to cloud, and writes to the OS keychain. After verifying with `agentsecrets secrets list` and `agentsecrets secrets diff`, you can delete the `.env` file.

---

## Replacing dotenv calls with AgentSecrets

:::tabs

## Python
**Before:**
```python
from dotenv import load_dotenv
import os
import requests

load_dotenv()

response = requests.get(
    "https://api.stripe.com/v1/balance",
    headers={"Authorization": f"Bearer {os.getenv('STRIPE_KEY')}"}
)
```

**After:**
```python
from agentsecrets import AgentSecrets

client = AgentSecrets()

response = client.call(
    "https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)
```
The value never enters your Python process. `client.call()` routes the request through the local proxy, which handles resolution and injection.

## Node.js
**Before:**
```javascript
require('dotenv').config();
const fetch = require('node-fetch');

const response = await fetch('https://api.stripe.com/v1/balance', {
  headers: { 'Authorization': `Bearer ${process.env.STRIPE_KEY}` }
});
```

**After:**
```javascript
const response = await fetch('http://localhost:8765/proxy', {
  headers: {
    'X-AS-Target-URL': 'https://api.stripe.com/v1/balance',
    'X-AS-Inject-Bearer': 'STRIPE_KEY'
  }
});
```
The JavaScript SDK is on the roadmap. Until then, route requests through the HTTP proxy using the injection headers shown above.

:::

---

## Using agentsecrets env as a drop-in replacement

For tools and frameworks that read from environment variables at startup and cannot be modified to use the SDK or proxy, `agentsecrets env` is the closest drop-in:

```bash
# Before
node server.js

# After
agentsecrets env -- node server.js
```

Values are injected into the child process at spawn time. The parent process never holds them. Nothing is written to disk. When the process exits, the values are gone.

This is a stronger guarantee than a `.env` file, but weaker than the proxy — the child process does hold the values in its environment for the duration of the process. For AI agents specifically, prefer the SDK or proxy. For non-agent tools and frameworks that cannot be modified, `agentsecrets env` is the right path. See [Proxy Injection vs env Injection](/docs/env-injection/proxy-vs-env) for a full comparison.


## Migration checklist

[ ] Run `agentsecrets init` and create your project
[ ] Run `agentsecrets secrets push` to import your `.env`
[ ] Run `agentsecrets secrets list` to verify all keys are stored
[ ] Run `agentsecrets secrets diff` to verify cloud sync
[ ] Add your domains to the allowlist with `agentsecrets workspace allowlist add`
[ ] Start the proxy with `agentsecrets proxy start`
[ ] Update your code to use the SDK, proxy, or `agentsecrets env`
[ ] Test your updated code end-to-end
[ ] Delete your `.env` file
[ ] Add `.env` and `.env.*` to `.gitignore` if not already there
