# MCP / Claude Desktop

The Model Context Protocol (MCP) server is the primary way to use AgentSecrets with Claude Desktop and other MCP clients.

### Installation
\`\`\`bash
$ agentsecrets mcp install
\`\`\`

### Manual Config
If you prefer to edit your \`claude_desktop_config.json\` manually:

\`\`\`json
{
  "mcpServers": {
    "agentsecrets": {
      "command": "agentsecrets",
      "args": ["mcp", "start"]
    }
  }
}
\`\`\`

### Capabilities
The MCP server provides the following tools to Claude:
- \`agentsecrets_call\`: Makes a zero-knowledge HTTP call.
- \`agentsecrets_status\`: Checks the proxy and keychain state.
- \`agentsecrets_allowlist_status\`: Checks if a domain is authorized.
