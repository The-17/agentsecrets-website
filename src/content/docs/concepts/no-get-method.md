# The No get() Principle

The AgentSecrets Python SDK has no `get()` method. This is not an oversight. It is the single most important design decision in the SDK, and understanding why it exists changes how you think about building on top of AgentSecrets.

---

## Why the SDK has no get() method

A `get()` method would look like this:

```python
# This method does not exist in AgentSecrets
value = client.get("STRIPE_KEY")
# value is now "sk_live_51H..." — in your process, in memory, accessible
```

If this method existed, every downstream use of the SDK would carry the same credential exposure risk as any other retrieval-based approach. The tool you use to avoid credential exposure would itself become a credential exposure path.

The absence of `get()` is not a convenience omission — it is the enforcement mechanism for the zero-knowledge guarantee at the SDK layer. You cannot retrieve a credential value into your calling code because the method to do so does not exist.

---

## What this means for developers building on AgentSecrets

If you are building an MCP server, an agent tool, or any other system on top of AgentSecrets, the no `get()` constraint extends to everything you build. Your users' code cannot retrieve credential values through your tool because your tool cannot retrieve credential values itself.

This is the point. When you build on AgentSecrets, the zero-knowledge guarantee is inherited by everything downstream. An MCP server built on AgentSecrets cannot leak credentials to Claude regardless of what Claude is instructed to do, because there is no mechanism to retrieve the values in the first place.

The [Zero-Knowledge MCP Template](/docs/sdk/zero-knowledge-mcp) is built on this principle. Every MCP server scaffolded from it inherits the same structural protection.

---

## How this changes how you design agent tools

Conventional tool design:

```python
# Conventional — retrieves the value to use it
def call_stripe_api(endpoint):
    key = secrets.get("STRIPE_KEY")  # value retrieved into this function
    return requests.get(endpoint, headers={"Authorization": f"Bearer {key}"})
```

AgentSecrets tool design:

```python
# AgentSecrets — passes the key name, never the value
def call_stripe_api(endpoint):
    return client.call(endpoint, bearer="STRIPE_KEY")
    # proxy resolves STRIPE_KEY, injects it, returns API response
    # STRIPE_KEY value never exists in this function
```

`client.call()` accepts a key name, not a credential value. Your function never holds the value. If this function is called by a prompt-injected agent, there is nothing for the attacker to extract — the value was never here.

---

## Common patterns that get() would enable and why they are excluded

**Passing credentials to third-party libraries:**
```python
# This pattern is not possible with AgentSecrets
stripe.api_key = client.get("STRIPE_KEY")
```
This pattern passes the credential value to a third-party library that might log it, pass it to sub-processes, or expose it in error messages. The proxy model avoids this by making authenticated calls through AgentSecrets rather than configuring third-party clients with credential values.

**Storing credentials in configuration objects:**
```python
# This pattern is not possible with AgentSecrets
config = {
    "stripe_key": client.get("STRIPE_KEY"),
    "openai_key": client.get("OPENAI_KEY"),
}
```
Configuration objects holding credential values are a common source of accidental exposure — they get logged, serialized, or passed to functions that were never intended to handle credentials.

**Returning credentials from agent tools:**
```python
# This pattern is not possible with AgentSecrets
def get_api_key_for_agent(key_name):
    return client.get(key_name)  # would give the agent the value
```
An agent tool that returns credential values is a credential exfiltration path. The tool cannot exist in AgentSecrets because the method it would call does not exist.

---

## The secure path is the only path

The SDK is designed so that the secure usage pattern is the only usage pattern available. The operations that exist are:

- `client.call()` — make an authenticated HTTP request; the value is injected by the proxy
- `client.spawn()` — start a process with credentials injected as environment variables
- `client.secrets.list()` — list key names; never values
- `client.secrets.check()` — check whether keys exist; returns booleans, not values
- `client.secrets.pull()` / `client.secrets.push()` / `client.secrets.diff()` — sync operations

Every operation keeps the credential value out of your code. That is the complete design surface of the SDK.