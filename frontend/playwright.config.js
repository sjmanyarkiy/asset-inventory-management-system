import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const FRONTEND_URL = process.env.PW_FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.PW_BACKEND_URL || 'http://127.0.0.1:5002';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../backend');
const e2eDbPath = path.resolve(backendDir, 'instance/e2e_playwright.db');
const e2eDbUrl = `sqlite:////${e2eDbPath}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `lsof -ti :5002 | xargs kill -9 2>/dev/null || true; E2E_ALLOW_RESET=1 DATABASE_URL="${e2eDbUrl}" FLASK_DEBUG=False PORT=5002 python scripts/reset_e2e_db.py && E2E_ALLOW_RESET=1 DATABASE_URL="${e2eDbUrl}" FLASK_DEBUG=False PORT=5002 python main.py`,
      cwd: backendDir,
      url: `${BACKEND_URL}/`,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `lsof -ti :5173 | xargs kill -9 2>/dev/null || true; VITE_API_BASE_URL="${BACKEND_URL}" npm run dev -- --host localhost --port 5173`,
      cwd: '.',
      url: FRONTEND_URL,
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
