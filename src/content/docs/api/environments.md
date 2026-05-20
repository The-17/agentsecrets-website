# Environments

Secrets in AgentSecrets are always scoped to a specific **Environment** within a project. This ensures development keys are isolated from production credentials.

---

## Environment Types

By default, every project supports three canonical environments:

:::step
1. **development** (`dev`): Used by local developer machines. This is typically the default environment context.
2. **staging**: Used for pre-production testing or continuous integration pipelines.
3. **production** (`prod`): Houses live, high-privilege credentials. Access to production secrets is usually restricted to specific owners, production agent identities, or CI/CD runner tokens.
:::

---

## Scoping at the API Layer

The API enforces strict environment separation during sync operations. When a client pushes or pulls secrets, the environment parameter must be provided:

* **Endpoint**: `GET /api/secrets/{project_id}/{environment}/{key}/`
* **Route Scope**: The environment is part of the REST URL structure. Clients cannot request "all secrets" across environments in a single wildcard query without specifying the environment parameter, preventing accidental leaks of production secrets.
* **Access Control**: Workspaces can restrict "Member" roles from viewing or syncing the metadata/keys of specific environments (like `production`), enforcing principle of least privilege.
