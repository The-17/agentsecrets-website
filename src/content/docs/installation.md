# Installation

AgentSecrets is available via Homebrew, npm, pip, and Go. The CLI, proxy, Python SDK, and MCP template are MIT licensed.

---

:::tabs
## Homebrew (macOS / Linux)

```bash
brew install The-17/tap/agentsecrets
```

Homebrew handles updates automatically and is the recommended installation method on macOS and Linux.

## npm

```bash
npm install -g @the-17/agentsecrets
```

Installs the CLI globally. Suitable for Node.js environments and teams already using npm for tooling.


## pip

```bash
pip install agentsecrets-cli
```

If you are installing into a system Python environment, you may need the `--break-system-packages` flag:

```bash
pip install agentsecrets-cli --break-system-packages
```

`agentsecrets-cli` installs the CLI. The `agentsecrets` package (without `-cli`) is the Python SDK for building on top of AgentSecrets — see [Python SDK](/docs/sdk/python). These are different packages with different purposes.

---

## Go

```bash
go install github.com/The-17/agentsecrets/cmd/agentsecrets@latest
```

Builds from source and places the binary in your `$GOPATH/bin`. Ensure `$GOPATH/bin` is in your `$PATH`.

:::

## Verifying your installation

```bash
agentsecrets --version
```

If the command is not found, your PATH likely does not include the installation directory. See [Common Installation Issues](/docs/troubleshooting/installation) for fixes per package manager.

---

## Updating

:::tabs

### Homebrew:
```bash
brew upgrade agentsecrets
```

### npm:
```bash
npm update -g @the-17/agentsecrets
```

### pip:
```bash
pip install --upgrade agentsecrets-cli
```

### Go:
```bash
go install github.com/The-17/agentsecrets/cmd/agentsecrets@latest
```
:::

> [TIP]
> Run `agentsecrets --version` after upgrading to confirm the new version is active.