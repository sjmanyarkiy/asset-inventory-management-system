import { expect, test } from '@playwright/test';
import {
  E2E_TAG,
  apiBase,
  cleanupCategoryAndType,
  createAssetViaApi,
  createCategoryAndType,
  deleteAssetIfExists,
} from './utils/assetApi';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildSuffix = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

const assertNoDuplicateRowsForName = async (page, name) => {
  const count = await page.locator('tbody tr', { hasText: name }).count();
  expect(count).toBeLessThanOrEqual(1);
};

const expectNoRowsForNames = async (page, names) => {
  for (const name of names) {
    await page.getByPlaceholder('Search assets...').fill(name);
    await expect(page.locator('tbody tr', { hasText: name })).toHaveCount(0);
    await assertNoDuplicateRowsForName(page, name);
  }
};

const expectVisibleInSingleRow = async (page, name) => {
  await page.getByPlaceholder('Search assets...').fill(name);
  await expect(page.locator('tbody tr', { hasText: name })).toHaveCount(1);
  await assertNoDuplicateRowsForName(page, name);
};

test('race: overlapping update + delete keeps final delete state and no duplicates', async ({ page, request }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const { categoryId, typeId } = await createCategoryAndType(request, suffix);

  const originalName = `${E2E_TAG}asset-race-original-${suffix}`;
  const updatedName = `${E2E_TAG}asset-race-updated-${suffix}`;
  let assetId;
  const pageB = await page.context().newPage();

  try {
    const asset = await createAssetViaApi(request, {
      name: originalName,
      asset_code: `${E2E_TAG}code-race-${suffix}`,
      barcode: `${E2E_TAG}barcode-race-${suffix}`,
      status: 'available',
      category_id: categoryId,
      asset_type_id: typeId,
    });

    assetId = asset.id;

    await page.context().route(`${apiBase}/assets/${assetId}`, async (route, req) => {
      if (req.method() === 'PUT') {
        await sleep(1200);
        await route.continue();
        return;
      }

      if (req.method() === 'DELETE') {
        await sleep(200);
        await route.continue();
        return;
      }

      await route.continue();
    });

    await page.goto('/assets');
    await page.getByPlaceholder('Search assets...').fill(originalName);
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(1);

    await pageB.goto('/assets');
    await pageB.getByPlaceholder('Search assets...').fill(originalName);
    await expect(pageB.locator('tbody tr', { hasText: originalName })).toHaveCount(1);

    await page.locator('tbody tr').first().getByRole('button', { name: /edit/i }).click();

    await page.getByPlaceholder('Asset Name').fill(updatedName);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    const deleteResponsePromise = pageB.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'DELETE'
    );

    await page.getByRole('button', { name: /update asset/i }).click();

    pageB.once('dialog', (dialog) => dialog.accept());
    await pageB.locator('tbody tr').first().getByRole('button', { name: /delete/i }).click();

    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(404);

    await expect(pageB.getByText('Asset deleted successfully')).toBeVisible();

    // Trigger fresh queries in page A after the race settles.
    await page.getByPlaceholder('Search assets...').fill(updatedName);
    await expect(page.locator('tbody tr', { hasText: updatedName })).toHaveCount(0);

    await page.getByPlaceholder('Search assets...').fill(originalName);
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(0);

    await assertNoDuplicateRowsForName(page, originalName);
    await assertNoDuplicateRowsForName(page, updatedName);

    assetId = null;

    await page.reload();
    await page.getByPlaceholder('Search assets...').fill(updatedName);
    await expect(page.locator('tbody tr', { hasText: updatedName })).toHaveCount(0);
    await expect(page.getByText('No assets found.')).toBeVisible();
  } finally {
    await pageB.close();
    await deleteAssetIfExists(request, assetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});

test('race: delayed stale update response never creates duplicate rows', async ({ page, request }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const { categoryId, typeId } = await createCategoryAndType(request, suffix);

  const originalName = `${E2E_TAG}asset-race-dupe-original-${suffix}`;
  const updatedName = `${E2E_TAG}asset-race-dupe-updated-${suffix}`;
  let assetId;

  try {
    const asset = await createAssetViaApi(request, {
      name: originalName,
      asset_code: `${E2E_TAG}code-race-dupe-${suffix}`,
      barcode: `${E2E_TAG}barcode-race-dupe-${suffix}`,
      status: 'available',
      category_id: categoryId,
      asset_type_id: typeId,
    });

    assetId = asset.id;

    await page.route(`${apiBase}/assets/${assetId}`, async (route, req) => {
      if (req.method() === 'PUT') {
        await sleep(1000);
      }
      await route.continue();
    });

    await page.goto('/assets');
    await page.getByPlaceholder('Search assets...').fill(originalName);
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(1);

    await page.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /edit/i }).click();
    await page.getByPlaceholder('Asset Name').fill(updatedName);

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    await page.getByRole('button', { name: /update asset/i }).click();

    // While update request is still pending, trigger a list request to mimic user activity.
    await page.getByPlaceholder('Search assets...').fill(updatedName);

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    await expect(page.getByText('Asset updated successfully')).toBeVisible();
    await expect(page.locator('tbody tr', { hasText: updatedName })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(0);

    await assertNoDuplicateRowsForName(page, updatedName);

    await page.reload();
    await page.getByPlaceholder('Search assets...').fill(updatedName);
    await expect(page.locator('tbody tr', { hasText: updatedName })).toHaveCount(1);
    await assertNoDuplicateRowsForName(page, updatedName);
  } finally {
    await deleteAssetIfExists(request, assetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});

test('race stress: stale failed update response cannot rollback newer successful update', async ({ page, request }) => {
  const suffix = buildSuffix();
  const { categoryId, typeId } = await createCategoryAndType(request, suffix);

  const originalName = `${E2E_TAG}asset-race-stress-original-${suffix}`;
  const staleUpdateName = `${E2E_TAG}asset-race-stress-stale-${suffix}`;
  const finalName = `${E2E_TAG}asset-race-stress-final-${suffix}`;

  let assetId;
  const pageB = await page.context().newPage();

  const firstUpdateIntercepted = new Promise((resolve) => {
    let resolved = false;
    page.context().route(`${apiBase}/assets/*`, async (route, req) => {
      if (req.method() !== 'PUT') {
        await route.continue();
        return;
      }

      const isTargetAsset = req.url().endsWith(`/assets/${assetId}`);
      if (!isTargetAsset) {
        await route.continue();
        return;
      }

      if (!resolved) {
        resolved = true;
        resolve();
        await sleep(1300);
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Simulated stale update conflict' }),
        });
        return;
      }

      await sleep(200);
      await route.continue();
    });
  });

  try {
    const asset = await createAssetViaApi(request, {
      name: originalName,
      asset_code: `${E2E_TAG}code-race-stress-${suffix}`,
      barcode: `${E2E_TAG}barcode-race-stress-${suffix}`,
      status: 'available',
      category_id: categoryId,
      asset_type_id: typeId,
    });

    assetId = asset.id;

    await page.goto('/assets');
    await pageB.goto('/assets');

    await expectVisibleInSingleRow(page, originalName);
    await expectVisibleInSingleRow(pageB, originalName);

    await page.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /edit/i }).click();
    await page.getByPlaceholder('Asset Name').fill(staleUpdateName);

    const staleResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    await page.getByRole('button', { name: /update asset/i }).click();
    await firstUpdateIntercepted;

    await pageB.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /edit/i }).click();
    await pageB.getByPlaceholder('Asset Name').fill(finalName);

    const freshResponsePromise = pageB.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    await pageB.getByRole('button', { name: /update asset/i }).click();

    const freshResponse = await freshResponsePromise;
    expect(freshResponse.status()).toBe(200);
    await expect(pageB.getByText('Asset updated successfully')).toBeVisible();

    const staleResponse = await staleResponsePromise;
    expect(staleResponse.status()).toBe(409);

    await expectVisibleInSingleRow(page, finalName);
    await expect(page.locator('tbody tr', { hasText: staleUpdateName })).toHaveCount(0);
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(0);

    await expectVisibleInSingleRow(pageB, finalName);

    await page.reload();
    await expectVisibleInSingleRow(page, finalName);
  } finally {
    await page.context().unroute(`${apiBase}/assets/*`);
    await pageB.close();
    await deleteAssetIfExists(request, assetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});

test('race stress: rapid overlapping update + delete with delayed responses keeps final delete state', async ({ page, request }) => {
  const suffix = buildSuffix();
  const { categoryId, typeId } = await createCategoryAndType(request, suffix);

  const originalName = `${E2E_TAG}asset-race-rapid-original-${suffix}`;
  const firstUpdateName = `${E2E_TAG}asset-race-rapid-first-${suffix}`;
  const secondUpdateName = `${E2E_TAG}asset-race-rapid-second-${suffix}`;

  let assetId;
  const pageB = await page.context().newPage();
  const pageC = await page.context().newPage();

  let putCounter = 0;
  let listCounter = 0;

  await page.context().route(`${apiBase}/assets*`, async (route, req) => {
    if (req.method() === 'GET') {
      listCounter += 1;
      if (listCounter <= 4) {
        await sleep(250 + listCounter * 100);
      }
    }

    await route.continue();
  });

  await page.context().route(`${apiBase}/assets/*`, async (route, req) => {
    const requestMethod = req.method();

    if (!assetId || !req.url().endsWith(`/assets/${assetId}`)) {
      await route.continue();
      return;
    }

    if (requestMethod === 'PUT') {
      putCounter += 1;

      // First optimistic update response is intentionally delayed and fails,
      // while the second update is quicker. This stresses stale rollback guards.
      if (putCounter === 1) {
        await sleep(1500);
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Simulated stale update conflict in stress test' }),
        });
        return;
      }

      await sleep(650);
      await route.continue();
      return;
    }

    if (requestMethod === 'DELETE') {
      await sleep(180);
      await route.continue();
      return;
    }

    await route.continue();
  });

  try {
    const asset = await createAssetViaApi(request, {
      name: originalName,
      asset_code: `${E2E_TAG}code-race-rapid-${suffix}`,
      barcode: `${E2E_TAG}barcode-race-rapid-${suffix}`,
      status: 'available',
      category_id: categoryId,
      asset_type_id: typeId,
    });

    assetId = asset.id;

    await page.goto('/assets');
    await pageB.goto('/assets');
    await pageC.goto('/assets');

    await expectVisibleInSingleRow(page, originalName);
    await expectVisibleInSingleRow(pageB, originalName);

    // First update (stale and failing, delayed).
    await page.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /edit/i }).click();
    await page.getByPlaceholder('Asset Name').fill(firstUpdateName);

    const firstUpdateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    await page.getByRole('button', { name: /update asset/i }).click();

    // Second update (newer and successful).
    await pageB.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /edit/i }).click();
    await pageB.getByPlaceholder('Asset Name').fill(secondUpdateName);

    const secondUpdateResponsePromise = pageB.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    await pageB.getByRole('button', { name: /update asset/i }).click();

    // Newest mutation is delete; final state must be removed.
    pageC.once('dialog', (dialog) => dialog.accept());
    const deleteResponsePromise = pageC.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'DELETE'
    );
    await pageC.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /delete/i }).click();

    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);

    const secondUpdateResponse = await secondUpdateResponsePromise;
    expect([200, 404]).toContain(secondUpdateResponse.status());

    const firstUpdateResponse = await firstUpdateResponsePromise;
    expect(firstUpdateResponse.status()).toBe(409);

    // Ensure stale responses never resurrect a deleted row.
    await expectNoRowsForNames(page, [originalName, firstUpdateName, secondUpdateName]);
    await expectNoRowsForNames(pageB, [originalName, firstUpdateName, secondUpdateName]);
    await expectNoRowsForNames(pageC, [originalName, firstUpdateName, secondUpdateName]);

    await page.reload();
    await expectNoRowsForNames(page, [originalName, firstUpdateName, secondUpdateName]);
    await expect(page.getByText('No assets found.')).toBeVisible();

    assetId = null;
  } finally {
    await page.context().unroute(`${apiBase}/assets*`);
    await page.context().unroute(`${apiBase}/assets/*`);
    await pageB.close();
    await pageC.close();
    await deleteAssetIfExists(request, assetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});
