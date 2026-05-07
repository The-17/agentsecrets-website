# Python SDK

The Python SDK provides a clean, typed interface for making zero-knowledge calls from your agentic workflows.

### Installation
\`\`\`bash
$ pip install agentsecrets
\`\`\`

### Usage
\`\`\`python
from agentsecrets import Client

client = Client()

# The key name is passed, not the value.
# The SDK handles the localhost:8765 proxy handshake.
response = client.call(
    url="https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)

print(response.json())
\`\`\`
