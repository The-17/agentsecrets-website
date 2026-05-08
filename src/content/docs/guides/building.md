# Building on the SDK

This guide is for developers building tools, MCP servers, or AI agents that others will use. The goal is to ship zero-knowledge credential management to your users without them needing to know AgentSecrets exists.

### The principle

The SDK has no `get()` method. This is not an oversight. It is the design. If you build a tool on the SDK, your users cannot accidentally retrieve credential values into their code even if they try. The zero-knowledge guarantee passes downstream automatically.

### Example: building a payment processing tool

```python
from agentsecrets import AgentSecrets

class PaymentProcessor:
    def __init__(self, project=None):
        self.client = AgentSecrets(project=project or "payments")

    def charge(self, amount_cents, currency, source):
        response = self.client.call(
            "https://api.stripe.com/v1/charges",
            method="POST",
            bearer="STRIPE_KEY",
            body={
                "amount": amount_cents,
                "currency": currency,
                "source": source
            }
        )
        return response.json()

    def get_balance(self):
        response = self.client.call(
            "https://api.stripe.com/v1/balance",
            bearer="STRIPE_KEY"
        )
        return response.json()
```

Your users instantiate `PaymentProcessor()` and call `charge()`. They never see `sk_live_...`. They do not need to know what AgentSecrets is. The credential management is invisible infrastructure.

### Example: building a zero-knowledge MCP server

Start from the [Zero-Knowledge MCP Template](https://github.com/The-17/zero-knowledge-mcp), which has the SDK already wired in with GitHub tools implemented as an example.

```bash
git clone https://github.com/The-17/zero-knowledge-mcp
cd zero-knowledge-mcp

# Replace the GitHub tools with your own
# The credential management infrastructure is already in place
```

Every user of your MCP server gets zero-knowledge credential management by default. They install AgentSecrets once, set their credentials, and your MCP server works without ever seeing a value.

### Testing your tool

```python
from agentsecrets import MockAgentSecrets

def test_payment_processor():
    mock = MockAgentSecrets(responses={
        "https://api.stripe.com/v1/balance": {
            "object": "balance",
            "available": [{"amount": 420000, "currency": "usd"}]
        }
    })

    # Inject the mock — adjust this to your dependency injection pattern
    processor = PaymentProcessor()
    processor.client = mock

    result = processor.get_balance()
    assert result["available"][0]["amount"] == 420000
    assert mock.calls[0].key_name == "STRIPE_KEY"
    # No value assertion possible — there is no value field
