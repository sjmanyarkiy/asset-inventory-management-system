# asset-inventory-management-system

Live links

- Frontend: https://asset-inventory-management-system-1.onrender.com
- Backend: https://asset-inventory-management-system-gkjx.onrender.com

## Task Division

### Samuel — Reports Dashboard

Work on a reports dashboard that includes:

- Visibility into who has access to which asset
- A list of assigned assets
- A list of repaired assets
- Ability to download generated reports

#### Implementation plan

Purpose: provide Samuel with a clear, actionable plan for building the reports dashboard so it can be implemented and tested consistently.

1. Key features

- View who has access to each asset (by user/role/group)
- View a list of assigned assets (current assignments)
- View a list of repaired assets (historical & recent repairs)
- Filterable/searchable tables and export (CSV/Excel/PDF)

2. Data model (suggested)

- users: id, name, email, role
- assets: id, tag, name, category, location, status
- assignments: id, asset_id, user_id, assigned_at, assigned_by, notes
- repairs: id, asset_id, reported_at, repaired_at, technician_id, description, cost, status
- permissions/access: id, user_id, asset_id, access_level (view/edit)

3. API endpoints (REST examples)

- GET /api/reports/access?asset_id=&user_id=&role= — returns access list
- GET /api/reports/assigned?user_id=&location=&status= — returns assigned assets
- GET /api/reports/repaired?from=&to=&asset_id= — returns repaired asset history
- POST /api/reports/export  (body: { type: "access|assigned|repaired", filters: {...}, format: "csv|xlsx|pdf" }) — returns or streams file

4. Frontend components/UI

- ReportsDashboard page (tabs for Access / Assigned / Repaired)
- Filters panel (user, role, asset category, date ranges)
- Data tables with pagination, sort, and row actions
- Download/export button that calls POST /api/reports/export

5. Export implementation notes

- CSV/Excel: server-side generation recommended (pandas in Python, exceljs/fast-csv in Node)
- PDF: render HTML and convert (WeasyPrint for Python, Puppeteer or pdfkit for Node)
- For large exports, generate async job and provide download link when ready

6. Authorization & security

- Ensure endpoints require authentication and check user permissions (role-based or asset-level checks)
- Log report generation and downloads if sensitive data

7. Acceptance criteria

- Users can view each report tab with correct, paginated data
- Filters produce expected results
- Exports download in requested format and match filtered results
- Access control prevents unauthorized users from seeing restricted assets

8. Next steps / suggestions

- Samuel: create a simple UI mockup and API contract (OpenAPI) for review
- Implement backend endpoints with tests and small sample dataset
- Implement frontend components with a stories/tests for the tables and export flow

## Version control & Gitflow

All development for this project follows Gitflow using feature branches. The main ideas and rules:

- Branches
  - `main`: production-ready code only. Protected branch; merges only from `release/*` or `hotfix/*` after review and CI passing.
  - `develop`: integration branch for completed features. All feature branches are branched off `develop` and merged back into `develop` via pull requests.
  - `feature/*`: short-lived branches for individual features or tasks (e.g., `feature/sam-reports-dashboard`). Branch off `develop` and open a PR to `develop` when ready.
  - `release/*`: created from `develop` when preparing a release. Used for final testing, minor fixes, and version bumping. Merge `release/*` into `main` and `develop` after release, and tag the `main` merge.
  - `hotfix/*`: created from `main` to quickly patch production; merge back into both `main` and `develop` after fix.

- Naming conventions
  - Feature branches: `feature/<short-description>`
  - Release branches: `release/<version>` (e.g., `release/1.2.0`)
  - Hotfix branches: `hotfix/<short-description>`

- Pull request workflow
  - Create feature branch from `develop`.
  - Work locally, commit frequently with meaningful messages (Conventional Commits are recommended).
  - Push branch to remote and open a PR targeting `develop`.
  - At least one code review approval required before merging. Ensure CI passes and run tests locally.
  - Merge using 'squash and merge' or 'merge commit' per team preference; keep commit history clear.

- Releases
  - Create `release/<version>` from `develop` when ready to release.
  - Perform final QA and apply any release-only fixes to the release branch.
  - Merge the release into `main` (create a tag) and back into `develop`.

- Hotfixes
  - Create `hotfix/<short-desc>` from `main` for critical production fixes.
  - After fix, merge into `main` (tag) and `develop`.

- Branch protection & CI
  - Protect `main` and `develop` with branch protection rules: require PR reviews, passing CI, and no direct pushes.
  - Use CI to run tests and linting on PRs.

Example git commands

```bash
# create and push a feature branch
git checkout develop
git pull origin develop
git checkout -b feature/sam-reports-dashboard
git add .
git commit -m "feat(reports): add initial ReportsDashboard layout"
git push -u origin feature/sam-reports-dashboard

# open a PR against develop, get reviews, then merge

# create a release branch
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
git push -u origin release/1.0.0

# merge release into main and tag
git checkout main
git pull origin main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags

# create a hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/patch-login
git push -u origin hotfix/patch-login
```

If you want, I can also:

- Add a GitHub Actions workflow to enforce CI on PRs
- Create a branch protection policy template for the repository
- Create a `develop` branch in the remote (if it doesn't exist) and open a starter `feature/*` branch for Samuel

