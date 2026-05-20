# Rotating Credentials

If an API key is compromised or reaches its lifecycle end, you need to rotate it.

AgentSecrets makes rotation seamless across your entire team and production environments simultaneously.

## Step 1: Update the Secret
:::step

Generate the new API key in the provider's dashboard (e.g., Stripe, OpenAI). Then, update the secret in AgentSecrets:

```bash
agentsecrets secrets set STRIPE_KEY=sk_test_NEW_VALUE --all-envs
```

Using the `--all-envs` flag ensures the new key is applied to `development`, `staging`, and `production` instantly (if applicable).
:::

## Step 2: Push to Cloud
:::step

Push the new encrypted blob to the sync server:

```bash
agentsecrets secrets push
```
:::

## Step 3: Team Updates
:::step

Your teammates simply run `agentsecrets secrets pull` to receive the new key. 

Production servers running the proxy as a sidecar will automatically poll for changes (or can be triggered via webhook) and update their in-memory keychain without requiring a restart or redeployment of your application code!
:::
