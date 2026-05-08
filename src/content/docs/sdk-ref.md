# SDK Reference

## Class: AgentSecrets

```python
from agentsecrets import AgentSecrets

client = AgentSecrets(
    workspace=None,     # str — workspace name, defaults to active workspace
    project=None,       # str — project name, defaults to active project
    port=8765,          # int — proxy port
    agent_id=None,      # str — declared agent identity
    agent_token=None,   # str — issued agent token (cryptographically verified)
    auto_start=True,    # bool — start proxy if not running
)
```

There is no credential parameter. No API key. No secret value. Credentials are resolved by the proxy at call time.

## method: call()

```python
response = client.call(
    url,                # str — required, must be HTTPS
    method="GET",       # str — HTTP method
    bearer=None,        # str — key name to inject as bearer token
    basic=None,         # str — key name to inject as basic auth
    header=None,        # dict — {header-name: key-name} for custom headers
    query=None,         # dict — {param-name: key-name} for query params
    body_field=None,    # dict — {json-path: key-name} for JSON body injection
    form_field=None,    # dict — {field-name: key-name} for form body injection
    body=None,          # dict or str — request body (not a credential)
    params=None,        # dict — non-credential query parameters
    headers=None,       # dict — non-credential request headers
    timeout=30,         # int — request timeout in seconds
)
```

All key name parameters (`bearer`, `basic`, `header`, `query`, `body_field`, `form_field`) accept the key name as a string — not the value. The proxy resolves the value.

## method: async_call()

Identical signature to `call()`. Returns a coroutine. Use with `await`.

## method: spawn()

```python
result = client.spawn(
    command,            # str — executable name
    args=None,          # list — command arguments
    env=None,           # dict — additional environment variables (non-credentials)
    timeout=None,       # int — process timeout in seconds
)
```

## method: spawn_async()

Identical signature to `spawn()`. Returns a coroutine.

## method: status()

```python
status = client.status()
# status.workspace     str
# status.project       str
# status.environment   str
# status.proxy_running bool
# status.proxy_port    int
# status.last_sync     datetime
```

## property: secrets

```python
client.secrets.list()
# Returns list of key names for current project and environment. Never values.

client.secrets.check(["KEY_ONE", "KEY_TWO"])
# Returns dict: {key_name: bool} — True if the key exists, False if not.

client.secrets.pull()
# Pulls from cloud to keychain for current project and environment.

client.secrets.push()
# Pushes from keychain to cloud for current project and environment.

client.secrets.diff()
# Returns drift report for current project and environment.
```

## Response object

```python
response.status_code    # int
response.body           # str — raw response body
response.json()         # dict — parsed JSON
response.headers        # dict — response headers
response.redacted       # bool — True if credential echo was scrubbed
response.duration_ms    # int — request duration
```

No field containing a credential value exists on the response object.

## Class: MockAgentSecrets

```python
from agentsecrets import MockAgentSecrets

mock = MockAgentSecrets(
    responses=None,     # dict — {url: response_body} for URL matching
    status_code=200,    # int — default status code for all calls
    environment="development",  # str — environment to record on calls
)
```

```python
# Assert calls were made
assert len(mock.calls) == 1
assert mock.calls[0].url == "https://api.stripe.com/v1/balance"
assert mock.calls[0].key_name == "STRIPE_KEY"
assert mock.calls[0].method == "GET"
assert mock.calls[0].environment == "development"
# mock.calls[0] has no value field
```