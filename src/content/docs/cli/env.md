# env

## agentsecrets env -- <command>
```bash
agentsecrets env -- <command> [args...]
```
Injects secrets as environment variables into a child process at spawn time. The parent process never holds the values. Useful for tools and SDKs that read from environment variables rather than making direct HTTP calls.
