import { expect, test } from '@playwright/test';
import { apiBase } from './utils/assetApi';

test('edge case: API failure shows retryable error UI', async ({ page }) => {
  let failedGetAssetsRequests = 0;

  await page.route(`${apiBase}/assets**`, async (route, request) => {
    if (request.method() === 'GET') {
      failedGetAssetsRequests += 1;
      await route.abort('failed');
      return;
    }

    await route.continue();
  });

  await page.goto('/assets');

  await expect(page.getByText('We couldn’t load assets right now.')).toBeVisible();
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  await expect(page.getByText(/cannot reach server/i)).toBeVisible();
  expect(failedGetAssetsRequests).toBeGreaterThan(0);
});

test('edge case: empty state is shown when API returns no assets', async ({ page }) => {
  await page.route(`${apiBase}/assets**`, async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 0,
          pages: 0,
          current_page: 1,
          data: [],
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/assets');

  await expect(page.getByText('No assets found.')).toBeVisible();
  await expect(page.getByText('Click “Add Asset” to get started.')).toBeVisible();
});

test('edge case: invalid form shows validation and blocks create request', async ({ page }) => {
  let createRequestCount = 0;

  await page.route(`${apiBase}/assets**`, async (route, request) => {
    if (request.method() === 'POST') {
      createRequestCount += 1;
    }
    await route.continue();
  });

  await page.goto('/assets');
  await page.getByRole('button', { name: /add asset/i }).click();

  const submitButton = page.getByRole('button', { name: /create asset/i });
  await expect(submitButton).toBeEnabled();

  await submitButton.click();

  await expect(page.locator('form').getByText('Asset name is required.')).toBeVisible();

  await expect.poll(() => createRequestCount).toBe(0);
});
