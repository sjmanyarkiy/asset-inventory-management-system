# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Playwright E2E

This project includes Playwright end-to-end tests under `frontend/e2e`.

### Run E2E with one command

From repository root:

- `npm run test:e2e`

or from `frontend`:

- `npm run test:e2e`

### Covered scenarios

- Create asset flow
- Update asset flow
- Delete asset flow
- Edge cases:
  - API failure UI
  - Empty state
  - Invalid form validation

Each CRUD test asserts:

- network request status (`POST`, `PUT`, `DELETE`)
- toast success messages
- table row updates
- persistence after page reload

### CI

GitHub Actions workflow: `.github/workflows/playwright-e2e.yml`

It installs Python + Node dependencies, installs Playwright browser, and runs E2E in CI mode.

### Test data safety

Playwright tests are hardened to avoid polluting real data:

- all E2E entities use `e2e-test-` tags in names/barcodes
- tests run backend against an isolated SQLite DB (`backend/instance/e2e_playwright.db`)
- DB schema is reset before the backend starts for each Playwright run
- tagged assets are automatically cleaned before/after CRUD specs

This keeps E2E runs repeatable and safe for shared environments.
