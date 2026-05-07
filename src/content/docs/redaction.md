# Response Body Redaction

The proxy scans every API response for patterns matching the injected credential value. If found, it replaces it with \`[REDACTED_BY_AGENTSECRETS]\`.

This defends against **credential echo exfiltration** — an attack where a compromised API reflects the credential back in its response.

> The redaction event is logged as \`credential_echo\` in the audit log. The value itself is never logged.
