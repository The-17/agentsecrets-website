# HTTP Proxy Integration

You can use AgentSecrets as a standard HTTP/HTTPS proxy. This is compatible with any language or tool that supports \`HTTPS_PROXY\`.

### Usage
\`\`\`bash
$ export HTTPS_PROXY=http://localhost:8765
$ curl https://api.stripe.com/v1/balance \\
    -H "Authorization: Bearer STRIPE_KEY"
\`\`\`

### How it resolves
The proxy intercepts the request, identifies the \`STRIPE_KEY\` placeholder, resolves the actual value from the OS keychain, and forwards the request to Stripe.
