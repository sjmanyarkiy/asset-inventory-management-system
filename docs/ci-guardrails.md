# CI Guardrails

This document describes the routing consistency guardrails that protect pull requests from introducing frontend/backend API mismatches.

## Purpose

The project supports both legacy routes (for compatibility) and prefixed API routes used by the frontend.

- Legacy examples: `/categories`, `/assets`
- Prefixed examples: `/api/categories`, `/api/assets`

CI enforces this contract so regressions cannot be merged into `main`.

## Workflow responsibilities

### `routing-guard.yml` (PR gate)

Runs on pull requests and merge queue checks.

#### `frontend-e2e-routing`

- Runs the Playwright smoke spec: `frontend/e2e/api-routing-consistency.spec.js`
- Verifies prefixed routes are reachable:
  - `/api/categories`
  - `/api/vendors`
  - `/api/departments`
- Verifies dropdown APIs load without Axios/network failures
- Uses Playwright-managed test servers (frontend on `5173`, backend on `5002`)

#### `backend-route-compat`

- Runs pytest: `backend/tests/test_dual_route_compatibility.py`
- Verifies both route families return valid responses:
  - legacy endpoints
  - `/api/*` endpoints
- Verifies health route compatibility (`/` and `/api`)

### `playwright-e2e.yml` (full regression)

Runs only on:

- push to `main`
- nightly schedule
- manual dispatch

This keeps PR checks fast while preserving broad end-to-end coverage for integration/release confidence.

## Required job names (do not rename)

These names must stay stable for branch protection:

- `frontend-e2e-routing`
- `backend-route-compat`

> Renaming either job will break required status checks until branch protection is updated.

## Branch protection requirements

Configure your protected branch (typically `main`) to require:

- `Routing Guard / frontend-e2e-routing`
- `Routing Guard / backend-route-compat`

Recommended additional settings:

- Require pull request reviews
- Require branch to be up to date before merge
- Require merge queue checks (if enabled)

## Local verification commands

```bash
# Backend route compatibility
cd backend
pytest -q tests/test_dual_route_compatibility.py
```

```bash
# Frontend routing smoke (Playwright starts backend/frontend test servers)
cd frontend
npx playwright test e2e/api-routing-consistency.spec.js --project=chromium --reporter=line
```

## Troubleshooting routing/API failures

### Symptom: dropdowns fail with Axios Network Error

Check in this order:

1. Backend is running and reachable
   - `http://127.0.0.1:5001/`
2. Prefixed APIs respond
   - `http://127.0.0.1:5001/api/categories`
3. Frontend API base resolves correctly
   - verify `VITE_API_BASE_URL`
   - verify `window.__APP_CONFIG__.API_BASE_URL`
4. CORS allows frontend origin
   - ensure `CORS_ORIGINS` and/or `FRONTEND_URL` includes `http://localhost:5173`
5. API calls still go through shared client
   - `frontend/src/services/api.js`
   - `frontend/src/config/apiConfig.js`

Quick smoke:

```bash
curl -s http://127.0.0.1:5001/
curl -s http://127.0.0.1:5001/api/categories
```
