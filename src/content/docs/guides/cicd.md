# Using AgentSecrets in CI/CD

This guide covers how to use AgentSecrets in automated pipelines where the local binary and interactive authentication are not available. This workflow uses the cloud resolver, which is on the roadmap. Until it ships, the recommended approach for CI/CD is the `agentsecrets env` command with a service token.

### Current approach — agentsecrets env in CI

Until the cloud resolver ships, the recommended CI/CD pattern is to install the CLI, authenticate with a non-interactive method, and use `agentsecrets env` to inject credentials into your pipeline processes.

```yaml
# GitHub Actions example
- name: Install AgentSecrets
  run: npm install -g @the-17/agentsecrets

- name: Run deployment
  env:
    AGENTSECRETS_TOKEN: ${{ secrets.AGENTSECRETS_SERVICE_TOKEN }}
  run: agentsecrets env -- ./deploy.sh
```

Store the service token in your CI/CD platform's secrets store (GitHub Actions secrets, GitLab CI variables, etc.). The token is used by the CLI to authenticate and pull the right credentials for the active environment.

Set the environment using the `AGENTSECRETS_ENV` environment variable:

```yaml
- name: Deploy to production
  env:
    AGENTSECRETS_TOKEN: ${{ secrets.AGENTSECRETS_SERVICE_TOKEN }}
    AGENTSECRETS_ENV: production
  run: agentsecrets env -- ./deploy.sh
```