# proxy

## agentsecrets proxy start
```bash
agentsecrets proxy start
agentsecrets proxy start --port 9000
```
Starts the local proxy. Default port is 8765.

## agentsecrets proxy stop
```bash
agentsecrets proxy stop
```
Stops the proxy.

## agentsecrets proxy status
```bash
agentsecrets proxy status
```
Shows whether the proxy is running, which port, and the current revocation list sync status.

## agentsecrets proxy logs
```bash
agentsecrets proxy logs
agentsecrets proxy logs --last 20
agentsecrets proxy logs --watch
agentsecrets proxy logs --secret KEY_NAME
agentsecrets proxy logs --env production
```
Views or streams the local proxy audit log. Filters by key name or environment.
