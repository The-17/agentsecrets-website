# Projects

A **Project** is a logical container within a Workspace. Projects group credentials and secrets for specific repositories, services, or environments.

---

## Project Model

Each Project consists of:
* A unique UUID identifier.
* A name (e.g. `frontend-app` or `billing-service`).
* The Workspace ID it belongs to.
* Project-specific access control lists.

---

## Workspace-Project Hierarchy

```
   Workspace (Tenant Boundary)
        │
        ├── Project A (e.g., Stripe Payment Gateway)
        │     ├── dev environment
        │     ├── staging environment
        │     └── production environment
        │
        └── Project B (e.g., Data Analytics Pipeline)
              ├── dev environment
              └── production environment
```

* Workspaces represent the billing and organizational boundaries (e.g., your company or department).
* Projects represent individual software services or codebases.
* Secrets belong to a specific project and environment (e.g., Project A -> Production environment -> `STRIPE_API_KEY`).

---

## Project Endpoints

The API exposes the following endpoints for projects:

* **List Projects**: `GET /api/projects/` (Lists projects in the active workspace context).
* **Create Project**: `POST /api/projects/`
* **Get Project Details**: `GET /api/projects/{workspace_id}/{project_name}/`
* **Update Project**: `PUT /api/projects/{workspace_id}/{project_name}/`
* **Delete Project**: `DELETE /api/projects/{workspace_id}/{project_name}/`
* **Project Invite**: `POST /api/projects/{workspace_id}/{project_name}/invite/` (Used to share or delegate project access to specific workspace members).
