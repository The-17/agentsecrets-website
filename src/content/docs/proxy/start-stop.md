# Starting and Stopping the Proxy

The AgentSecrets proxy runs as a local background daemon that handles key resolution and credential injection. It binds to `localhost` and acts as a secure intermediary between your application and external APIs.

---

## Starting the proxy

By default, you can start the proxy daemon with the CLI:

```bash
agentsecrets proxy start
```

When you run this command, the proxy:
:::step
1. Resolves your active project configuration from `.agentsecrets/project.json`.
2. Connects to your local OS Keychain (macOS Keychain, Windows Credential Manager, or Linux Secret Service) to prepare for secure, hardware-backed secret decryption.
3. Pulls down the latest domain allowlist and credential revocation lists from the AgentSecrets backend (storing only encrypted ciphertext or cryptographic hashes).
4. Spawns a background worker process and binds an HTTP server to `127.0.0.1:8765`.
:::

If you prefer to run the proxy in the foreground for debugging or streaming logs directly to standard output, use the `--foreground` flag:

```bash
agentsecrets proxy start --foreground
```

---

## Specifying a custom port

If port `8765` is already in use by another service on your machine, you can launch the proxy on a custom port.

### Using the CLI flag
```bash
agentsecrets proxy start --port 9000
```

### Using environment variables
You can also set the `AGENTSECRETS_PORT` environment variable before running the command or starting your application:

```bash
export AGENTSECRETS_PORT=9000
agentsecrets proxy start
```

> [NOTE]
> If you specify a custom port, make sure to pass the same port to your SDK clients (e.g., `new AgentSecrets({ port: 9000 })` or `AgentSecrets(port=9000)`) so they know where to route outbound API calls.

---

## Checking proxy status

To verify whether the proxy daemon is active, which port it is listening on, and the status of its keychain connection, run:

```bash
agentsecrets proxy status
```

This returns a structured status summary:

```text
Status:              Running
PID:                 49821
Port:                8765
Address:             127.0.0.1
Workspace:           Acme Engineering (ws_01hxyz...)
Project:             payments-service (proj_02abc...)
Environment:         development
OS Keychain:         Connected (Secure Enclave enabled)
Last Sync:           2026-05-20 02:08:44 UTC (2 mins ago)
Connection Pool:     3 active connections
```

If the proxy is not running, the command will exit with code `1` and print:

```text
Status:              Stopped
```

---

## Stopping the proxy

To shut down the running local daemon and release its bound port, run:

```bash
agentsecrets proxy stop
```

The shutdown sequence:
- Stops accepting new HTTP requests.
- Waits for any in-flight API calls to complete (up to a 5-second graceful timeout).
- Securely flushes any volatile decryption keys and session states from memory.
- Terminates the daemon process.

---

## Running the proxy as a background service

For development environments or production headless servers where you want the proxy to run persistently across reboots, you can configure it as a system service.

### 1. Linux (systemd)
:::step
Create a systemd service file at `/etc/systemd/system/agentsecrets.service`:

```ini
[Unit]
Description=AgentSecrets Proxy Daemon
After=network.target

[Service]
Type=simple
User=agentsecrets
Environment=AGENTSECRETS_PORT=8765
Environment=AGENTSECRETS_TOKEN=ast_live_your_service_token
ExecStart=/usr/local/bin/agentsecrets proxy start --foreground
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable agentsecrets
sudo systemctl start agentsecrets
```
:::

### 2. macOS (launchd)
:::step
Create a plist file at `/Library/LaunchDaemons/com.agentsecrets.proxy.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.agentsecrets.proxy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/agentsecrets</string>
        <string>proxy</string>
        <string>start</string>
        <string>--foreground</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>EnvironmentVariables</key>
    <dict>
        <key>AGENTSECRETS_PORT</key>
        <string>8765</string>
    </dict>
</dict>
</plist>
```

Load and start the service:

```bash
sudo launchctl load -w /Library/LaunchDaemons/com.agentsecrets.proxy.plist
```
:::

### 3. Node.js PM2 (Cross-Platform)
:::step
If you already use PM2 for process management in your Node.js ecosystem, you can add the proxy to your `ecosystem.config.js` file:

```javascript
module.exports = {
  apps: [
    {
      name: "agentsecrets-proxy",
      script: "agentsecrets",
      args: "proxy start --foreground",
      autorestart: true,
      env: {
        AGENTSECRETS_PORT: "8765",
      }
    }
  ]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
```
:::
