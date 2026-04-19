# Asset Inventory Management System

[![CI](https://img.shields.io/github/actions/workflow/status/sjmanyarkiy/asset-inventory-management-system/routing-guard.yml?branch=main&label=CI&style=flat-square)](https://github.com/sjmanyarkiy/asset-inventory-management-system/actions/workflows/routing-guard.yml)
[![E2E](https://img.shields.io/github/actions/workflow/status/sjmanyarkiy/asset-inventory-management-system/playwright-e2e.yml?branch=main&label=E2E&style=flat-square)](https://github.com/sjmanyarkiy/asset-inventory-management-system/actions/workflows/playwright-e2e.yml)
[![License](https://img.shields.io/github/license/sjmanyarkiy/asset-inventory-management-system?label=License&style=flat-square)](LICENSE)

This is a full-stack asset inventory platform with:

- **Frontend**: React + Vite + Redux Toolkit
- **Backend**: Flask + SQLAlchemy + Flask-Migrate
- **Quality**: Jest + Playwright + Pytest + CI guardrails

## Live Demo

- Frontend: <https://asset-inventory-management-system-1.onrender.com>
- Backend API: <https://asset-inventory-management-system-gkjx.onrender.com>

## Features

- Asset CRUD (create, read, update, delete)
- Category, type, department, and vendor management
- Search/filter workflows for operations teams
- Image upload and preview support
- Reports dashboard foundation

## Project Structure

```text
asset-inventory-management-system/
├── backend/    # Flask API + models + migrations
├── frontend/   # React app + Jest + Playwright
├── docs/       # CI guardrails and screenshots
└── README.md   # Unified documentation (this file)
```

## Architecture (high-level)

```mermaid
flowchart LR
  A[React + Vite Frontend] -->|Axios requests to /api/*| B[Flask Backend API]
  B -->|SQLAlchemy ORM| C[(SQLite/PostgreSQL)]
  D[GitHub Actions CI] -->|Route compatibility checks| A
  D -->|Backend + E2E tests| B
```

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.11+ (3.10+ generally works)

## Environment Variables

The backend requires `DATABASE_URL`.

Example (local SQLite):

- `DATABASE_URL=sqlite:///instance/app.db`
- `PORT=5001`
- `FRONTEND_URL=http://localhost:5173`
- `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`

Optional frontend variable:

- `VITE_API_BASE_URL=http://127.0.0.1:5001/api`

## Local Setup (Frontend + Backend)

### 1) Install dependencies

From repo root:

- `npm install`
- `npm --prefix frontend install`

For backend:

- Create/activate a virtual environment in `backend/`
- Install Python dependencies from `backend/requirements.txt`

### 2) Start backend (port 5001)

Run from `backend/` with `DATABASE_URL` set.

The app entrypoint is `backend/main.py`.

### 3) Start frontend (port 5173)

From repo root:

- `npm run start`

Or from `frontend/`:

- `npm run dev`

## Tests

### Frontend unit tests (Jest)

From repo root:

- `npm run test`

### End-to-end tests (Playwright)

From repo root:

- `npm run test:e2e`

Notes:

- Playwright uses an isolated backend DB: `backend/instance/e2e_playwright.db`
- E2E reset is protected by `E2E_ALLOW_RESET=1`
- Backend test server runs on port `5002` during E2E

### Backend compatibility tests (Pytest)

Tests live under `backend/tests/`.

## API and Routing Notes

- Backend supports both `/api/*` and legacy-compatible route behavior via route registration.
- Frontend API base URL resolution is centralized in `frontend/src/config/apiConfig.js`.
- In production-like runtime, localhost API URLs are safely ignored to prevent broken deployments.

## UI Screenshots

- `docs/screenshots/landing.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/assets-table.png`

## CI Guardrails

Detailed CI + branch protection guidance:

- `docs/ci-guardrails.md`

## License

Licensed under the terms in `LICENSE`.

