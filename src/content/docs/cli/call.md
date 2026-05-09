# call

## agentsecrets call — full flag reference
```bash
agentsecrets call --url URL --bearer KEY_NAME
agentsecrets call --url URL --method POST --bearer KEY_NAME --body '{...}'
agentsecrets call --url URL --header Header-Name=KEY_NAME
agentsecrets call --url URL --query param=KEY_NAME
agentsecrets call --url URL --basic KEY_NAME
agentsecrets call --url URL --body-field path=KEY_NAME
agentsecrets call --url URL --form-field field=KEY_NAME
```
Makes a single authenticated request through the proxy. All six injection styles are supported. Multiple injection flags can be combined in one call.

## --bearer
Injects as `Authorization: Bearer <value>`.

## --basic
Injects as `Authorization: Basic <base64(username:password)>`. Expects a secret containing `username:password`.

## --header
Injects as a custom header `Header-Name: <value>`.

## --query
Injects as a query parameter `?param=<value>`.

## --body-field
Injects into a JSON body field at the specified path.

## --form-field
Injects into a form field.

## --url
The target API URL.
