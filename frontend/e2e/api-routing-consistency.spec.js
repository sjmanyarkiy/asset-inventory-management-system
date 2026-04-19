import { expect, test } from '@playwright/test';

const backendBase = (process.env.PW_BACKEND_URL || 'http://127.0.0.1:5002').replace(/\/$/, '');
const prefixedEndpoints = ['/api/categories', '/api/vendors', '/api/departments'];

test('@smoke api-prefixed endpoints are reachable', async ({ request }) => {
  for (const endpoint of prefixedEndpoints) {
    const response = await request.get(`${backendBase}${endpoint}`);
    expect(response.status(), `${endpoint} should return 200`).toBe(200);

    const body = await response.json();
    expect(body).toBeTruthy();
    expect(Array.isArray(body.data), `${endpoint} should return a data array`).toBeTruthy();
  }
});

test('@smoke asset search dropdowns load without network errors', async ({ page }) => {
  const failedApiRequests = [];
  const dropdownConsoleErrors = [];
  const pageErrors = [];

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (url.includes('/api/')) {
      failedApiRequests.push({
        url,
        method: request.method(),
        failure: request.failure()?.errorText || 'unknown error',
      });
    }
  });

  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Dropdown load error')) {
      dropdownConsoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    if (error?.message?.includes('AxiosError') || error?.message?.includes('Network Error')) {
      pageErrors.push(error.message);
    }
  });

  const categoryResp = page.waitForResponse(
    (response) =>
      response.url().includes('/api/categories') &&
      response.request().method() === 'GET' &&
      response.status() === 200
  );

  const vendorResp = page.waitForResponse(
    (response) =>
      response.url().includes('/api/vendors') &&
      response.request().method() === 'GET' &&
      response.status() === 200
  );

  const departmentResp = page.waitForResponse(
    (response) =>
      response.url().includes('/api/departments') &&
      response.request().method() === 'GET' &&
      response.status() === 200
  );

  await page.goto('/assets');

  await Promise.all([categoryResp, vendorResp, departmentResp]);

  await expect(page.locator('select[name="category_id"]')).toBeVisible();
  await expect(page.locator('select[name="vendor_id"]')).toBeVisible();
  await expect(page.locator('select[name="department_id"]')).toBeVisible();

  expect(failedApiRequests).toEqual([]);
  expect(dropdownConsoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
