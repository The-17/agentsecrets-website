# Python SDK

The Python SDK provides a typed interface for making zero-knowledge calls from your code. It has no `get()` method. There is no way to retrieve a credential value into your calling code — the only operations available keep the value out of your process.

## Installation

```bash
pip install agentsecrets
```

## Initializing the client

```python
from agentsecrets import AgentSecrets

# Defaults — uses active workspace, project, and environment from global config
client = AgentSecrets()

# Explicit configuration
client = AgentSecrets(
    workspace="Acme Engineering",
    project="payments-service",
)

# With agent identity
client = AgentSecrets(agent_id="billing-processor")

# With issued token
client = AgentSecrets(agent_token="agt_ws01hxyz_4kR9mNpQ...")

# Custom proxy port
client = AgentSecrets(port=9000)
```

No credentials are passed into the constructor. Ever.

## Making calls — `client.call()`

```python
# Bearer token (Stripe, OpenAI, GitHub, most modern APIs)
response = client.call(
    "https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)

# POST request with body
response = client.call(
    "https://api.stripe.com/v1/charges",
    method="POST",
    bearer="STRIPE_KEY",
    body={"amount": 1000, "currency": "usd", "source": "tok_visa"}
)

# Custom header (SendGrid, Twilio)
response = client.call(
    "https://api.sendgrid.com/v3/mail/send",
    method="POST",
    header={"X-Api-Key": "SENDGRID_KEY"},
    body=payload
)

# Query parameter (Google Maps, weather APIs)
response = client.call(
    "https://maps.googleapis.com/maps/api/geocode/json",
    params={"address": "Lagos, Nigeria"},
    query={"key": "GOOGLE_MAPS_KEY"}
)

# Basic auth (Jira, legacy REST APIs)
response = client.call(
    "https://jira.example.com/rest/api/2/issue/PROJ-1",
    basic="JIRA_CREDS"
)

# Multiple credentials in one call
response = client.call(
    "https://api.example.com/data",
    bearer="AUTH_TOKEN",
    header={"X-Org-ID": "ORG_SECRET"}
)

# Async variant
response = await client.async_call(
    "https://api.openai.com/v1/models",
    bearer="OPENAI_KEY"
)
```

## Response object

| Field | Type | Description |
|---|---|---|
| `response.status_code` | `int` | HTTP status code |
| `response.body` | `str` | Raw response body |
| `response.json()` | `dict` | Parsed JSON response |
| `response.headers` | `dict` | Response headers |
| `response.redacted` | `bool` | True if proxy scrubbed a credential echo |
| `response.duration_ms` | `int` | Request duration in milliseconds |

There is no field containing the credential value. The response object is structurally incapable of carrying it.

## Spawning processes — `client.spawn()`

Inject secrets as environment variables into a child process. The calling code never sees the values.

```python
# Spawn a process with injected environment variables
result = client.spawn("stripe", ["mcp"])
result = client.spawn("python", ["manage.py", "runserver"])

# Async variant
proc = await client.spawn_async("stripe", ["mcp"])
```

## Management surface

The SDK exposes the full management surface for automation and programmatic workflows:

```python
# Secrets
client.secrets.list()
client.secrets.check(["STRIPE_KEY", "OPENAI_KEY"])
client.secrets.pull()
client.secrets.push()
client.secrets.diff()

# Environments
client.environments.switch("production")
client.environments.list()

# Status
client.status()
```

## MockAgentSecrets for testing

Test your agent code without a running proxy or real credentials:

```python
from agentsecrets import MockAgentSecrets

mock = MockAgentSecrets(responses={
    "https://api.stripe.com/v1/balance": {"object": "balance", "available": [{"amount": 420000}]}
})

# Use it exactly like the real client
response = mock.call("https://api.stripe.com/v1/balance", bearer="STRIPE_KEY")

# Assert calls were made
assert mock.calls[0].key_name == "STRIPE_KEY"
assert mock.calls[0].url == "https://api.stripe.com/v1/balance"
# Note: mock.calls[0] has no value field
```
