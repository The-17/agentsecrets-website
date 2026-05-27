# agentsecrets docs

The `agentsecrets docs` command allows you to search and read the official AgentSecrets documentation directly from your terminal.

## agentsecrets docs
```bash
agentsecrets docs [query]
```
Searches the documentation for the provided query (e.g. `agentsecrets docs proxy`). If multiple articles match, it opens an interactive menu to let you choose which one to read. 

If you omit the query (just `agentsecrets docs`), it will prompt you interactively for what you want to search.

When an article is selected, it fetches the precise Markdown content from the live documentation site and renders it beautifully in your terminal. It acts as an instant reference for commands, API usage, and architectural concepts without breaking your workflow.

### Examples

You can search for specific CLI commands, or you can use verbose, natural language queries when you're trying to figure out how to accomplish a specific workflow:

```bash
# Search for a specific command
agentsecrets docs proxy

# Ask a verbose, natural language question
agentsecrets docs how to share credentials with my team securely
```
