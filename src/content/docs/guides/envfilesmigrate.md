# Migrating from .env Files

If you are currently using a `.env` file and want to move your credentials into AgentSecrets, this is the complete migration path.

## Step 1 — Initialize AgentSecrets in your project
:::step

```bash
agentsecrets init --storage-mode 1
agentsecrets project create my-project
agentsecrets project use my-project
```

Storage mode 1 means no `.env` files will be created or read after migration. Your AI coding assistant will no longer have access to credentials on the filesystem.
:::

## Step 2 — Push your .env file
:::step

```bash
agentsecrets secrets push
```

This reads your `.env` file, encrypts each value, and stores it in the OS keychain and cloud. Verify the push worked:

```bash
agentsecrets secrets list
```

You should see all your key names. If anything is missing, set it manually:

```bash
agentsecrets secrets set MISSING_KEY=value
```
:::

## Step 3 — Authorize your domains
:::step

```bash
agentsecrets workspace allowlist add api.stripe.com api.openai.com
# Add every API domain your project calls
```
:::

## Step 4 — Update your code
:::step

Replace direct API calls with AgentSecrets calls. For Python:

```python
# Before
import stripe
stripe.api_key = os.environ["STRIPE_KEY"]
balance = stripe.Balance.retrieve()

# After
from agentsecrets import AgentSecrets
client = AgentSecrets()
response = client.call(
    "https://api.stripe.com/v1/balance",
    bearer="STRIPE_KEY"
)
balance = response.json()
```

For non-Python code or tools that read environment variables, use `agentsecrets env`:

```bash
# Before
python manage.py runserver

# After
agentsecrets env -- python manage.py runserver
```
:::

## Step 5 — Delete the .env file
:::step

```bash
rm .env
# Add .env to .gitignore to prevent it from being re-created accidentally
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
```

Your project no longer has credentials on the filesystem. Your AI coding assistant can read the entire project directory and find nothing it should not have.
:::