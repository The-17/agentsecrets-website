# Projects

Projects partition secrets within a workspace. Each project has its own set of secrets across all three environments.

```bash
agentsecrets project create payments-service
agentsecrets project create auth-service
agentsecrets project create data-pipeline

# Switch active project
agentsecrets project use payments-service

# List all projects in the current workspace
agentsecrets project list
```

