# Auth Methods Reference

All six injection styles work with `agentsecrets call`, the HTTP proxy, and the Python SDK.

## Bearer token

The credential is injected as `Authorization: Bearer <value>`.

Supported by: Stripe, OpenAI, GitHub, most modern REST APIs.

```bash
agentsecrets call --url https://api.stripe.com/v1/balance --bearer STRIPE_KEY
```

```python
client.call("https://api.stripe.com/v1/balance", bearer="STRIPE_KEY")
```

HTTP proxy header: `X-AS-Inject-Bearer: KEY_NAME`

## Basic auth

The credential is base64-encoded and injected as `Authorization: Basic <base64(value)>`. For APIs that expect `username:password` format, store the full `username:password` string as the secret value.

Supported by: Jira, legacy REST APIs, some internal services.

```bash
agentsecrets call --url https://jira.example.com/rest/api/2/issue --basic JIRA_CREDS
```

HTTP proxy header: `X-AS-Inject-Basic: KEY_NAME`

## Custom header

The credential is injected as the value of a specific request header.

Supported by: SendGrid (`X-Api-Key`), Twilio, API Gateway.

```bash
agentsecrets call \
  --url https://api.sendgrid.com/v3/mail/send \
  --method POST \
  --header X-Api-Key=SENDGRID_KEY \
  --body '{"personalizations":[...]}'
```

HTTP proxy header: `X-AS-Inject-Header-{Header-Name}: KEY_NAME`

Example: `X-AS-Inject-Header-X-Api-Key: SENDGRID_KEY`

## Query parameter

The credential is injected as a URL query parameter.

Supported by: Google Maps, weather APIs, older REST APIs.

```bash
agentsecrets call \
  --url "https://maps.googleapis.com/maps/api/geocode/json?address=Lagos" \
  --query key=GOOGLE_MAPS_KEY
```

HTTP proxy header: `X-AS-Inject-Query-{param}: KEY_NAME`

Example: `X-AS-Inject-Query-key: GOOGLE_MAPS_KEY`

## JSON body field

The credential is injected into a specific path in the JSON request body.

Supported by: Token exchange endpoints, custom auth flows.

```bash
agentsecrets call \
  --url https://api.example.com/auth \
  --method POST \
  --body-field client_secret=SECRET
```

HTTP proxy header: `X-AS-Inject-Body-{path}: KEY_NAME`

## Form field

The credential is injected as a field in a `application/x-www-form-urlencoded` request body.

Supported by: OAuth 2.0 token endpoints, form-based auth.

```bash
agentsecrets call \
  --url https://oauth.example.com/token \
  --method POST \
  --form-field api_key=KEY
```

HTTP proxy header: `X-AS-Inject-Form-{field}: KEY_NAME`
