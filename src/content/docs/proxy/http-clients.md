# Using the Proxy with HTTP Clients

If you are not using one of our official SDKs, you can communicate directly with the local AgentSecrets proxy daemon using any standard HTTP client. 

To do so, your client must read the local session token, determine the active proxy port, and supply the necessary headers on every request.

---

## Any HTTP client (general pattern)

To communicate with the proxy directly, your client must perform three steps:

:::step
1. **Locate and read the session file**:
   - **macOS/Linux**: `~/.agentsecrets/session.json`
   - **Windows**: `%USERPROFILE%\.agentsecrets\session.json`
   
2. **Parse the JSON config**:
   The file contains the active daemon port and the session authentication token:
   ```json
   {
     "token": "as_sess_8f9c2d1b...",
     "port": 8765
   }
   ```

3. **Construct the request**:
   Send a request to `http://localhost:<port>/proxy` containing these three headers:
   - `X-AS-Session-Token`: The token parsed from `session.json`.
   - `X-AS-Target-URL`: The absolute HTTPS URL of the target API.
   - An injection directive (e.g., `X-AS-Inject-Bearer: STRIPE_KEY` or `X-AS-Inject-Header-X-Api-Key: SENDGRID_KEY`).
:::

---

## curl

For command-line testing or shell scripts, you can parse the session token using `jq`:

```bash
# 1. Read the token and port from the local session file
TOKEN=$(jq -r '.token' ~/.agentsecrets/session.json)
PORT=$(jq -r '.port' ~/.agentsecrets/session.json)

# 2. Make the authenticated call through the proxy
curl -s http://localhost:$PORT/proxy \
  -H "X-AS-Session-Token: $TOKEN" \
  -H "X-AS-Target-URL: https://api.stripe.com/v1/balance" \
  -H "X-AS-Inject-Bearer: STRIPE_KEY"
```

---

## fetch (Node.js)

In Node.js 18+ or any modern JavaScript environment:

```javascript
import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Resolve and read the session configuration
const sessionPath = path.join(os.homedir(), '.agentsecrets', 'session.json');
const { token, port } = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

// 2. Fetch the resource through the proxy
async function fetchStripeBalance() {
  const response = await fetch(`http://localhost:${port}/proxy`, {
    method: 'GET',
    headers: {
      'X-AS-Session-Token': token,
      'X-AS-Target-URL': 'https://api.stripe.com/v1/balance',
      'X-AS-Inject-Bearer': 'STRIPE_KEY'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
}

await fetchStripeBalance();
```

---

## axios

For teams using Axios in Node.js or TypeScript projects:

```typescript
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const sessionPath = path.join(os.homedir(), '.agentsecrets', 'session.json');
const { token, port } = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

async function callAxios() {
  const response = await axios.get(`http://localhost:${port}/proxy`, {
    headers: {
      'X-AS-Session-Token': token,
      'X-AS-Target-URL': 'https://api.stripe.com/v1/balance',
      'X-AS-Inject-Bearer': 'STRIPE_KEY'
    }
  });
  
  console.log(response.data);
}

callAxios();
```

---

## Python requests

For synchronous Python workflows using the popular `requests` library:

```python
import json
from pathlib import Path
import requests

# 1. Resolve paths across macOS/Linux/Windows
session_path = Path.home() / ".agentsecrets" / "session.json"

# 2. Parse token and port
with open(session_path) as f:
    session = json.load(f)

# 3. Call target API
response = requests.get(
    f"http://localhost:{session['port']}/proxy",
    headers={
        "X-AS-Session-Token": session["token"],
        "X-AS-Target-URL": "https://api.stripe.com/v1/balance",
        "X-AS-Inject-Bearer": "STRIPE_KEY"
    }
)

response.raise_for_status()
print(response.json())
```

---

## Python httpx

For async Python projects (e.g., using FastAPI, LangChain, or Autogen), `httpx` is the standard choice:

```python
import json
from pathlib import Path
import httpx
import asyncio

session_path = Path.home() / ".agentsecrets" / "session.json"
with open(session_path) as f:
    session = json.load(f)

async def call_async_api():
    headers = {
        "X-AS-Session-Token": session["token"],
        "X-AS-Target-URL": "https://api.stripe.com/v1/balance",
        "X-AS-Inject-Bearer": "STRIPE_KEY"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"http://localhost:{session['port']}/proxy",
            headers=headers
        )
        print(response.json())

asyncio.run(call_async_api())
```
