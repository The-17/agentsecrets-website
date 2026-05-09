# How It Works

Every AgentSecrets call flows through five stages. The secret value does not enter the agent's context, filesystem, or any log at any stage.

## Stage 1: Agent request

The agent passes a key name — `STRIPE_KEY`, `OPENAI_KEY`, whatever you named the secret — to the AgentSecrets proxy at `localhost:8765`. The key name is all the agent ever holds. Not the value.

## Stage 2: Domain allowlist check

Before anything else, the proxy checks the target URL against the workspace allowlist. If the domain is not authorized, the proxy returns 403, logs the attempt, and stops. No credential is resolved. No request is forwarded. This check happens before decryption so a blocked request exposes nothing.

## Stage 3: OS keychain lookup

The proxy looks up the keychain entry for the active workspace, project, environment, and key name. It decrypts the value in-process only. The decrypted value is never written to disk and never returned to the calling process.

## Stage 4: Transport injection

The decrypted value is injected into the outbound HTTP request at the transport layer — as a bearer token, custom header, query parameter, basic auth credential, JSON body field, or form field depending on which injection style you specified. The value does not travel back through the proxy as a string. It goes directly into the outbound request.

## Stage 5: Response, redaction, and audit

The API response comes back. The proxy scans the response body for any pattern matching the injected credential value. If it finds one (some APIs echo back the token in error responses or debug payloads), it replaces the match with `[REDACTED_BY_AGENTSECRETS]` before the response reaches your code. An audit entry is then written: timestamp, agent identity, environment, key name, target domain, endpoint, status code, duration, and the domain allowlist state at the exact moment of the call. There is no value field in the audit entry schema.

Your code receives the API response. The call is done. The value has left no trace in any accessible location.
