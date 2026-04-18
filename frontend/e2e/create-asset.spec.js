import { expect, test } from '@playwright/test';
import {
  E2E_TAG,
  apiBase,
  cleanupCategoryAndType,
  createCategoryAndType,
  deleteAssetIfExists,
} from './utils/assetApi';

test('@smoke create asset flow: request + toast + table + reload persistence', async ({ page, request }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const { categoryId, typeId, categoryName, typeName } = await createCategoryAndType(request, suffix);

  const assetName = `${E2E_TAG}asset-create-${suffix}`;
  const assetCode = `${E2E_TAG}code-create-${suffix}`;
  const barcode = `${E2E_TAG}barcode-create-${suffix}`;
  let createdAssetId;

  try {
    await page.goto('/assets');

    await page.getByRole('button', { name: /add asset/i }).click();

    await expect(page.getByPlaceholder('Asset Name')).toBeVisible();
    await page.getByPlaceholder('Asset Name').fill(assetName);
    await page.getByPlaceholder('Asset Code').fill(assetCode);
    await page.getByPlaceholder('Barcode').fill(barcode);

    await page.locator('form select[name="category_id"]').selectOption({ label: categoryName });
    await page.locator('form select[name="asset_type_id"]').selectOption({ label: typeName });

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes('/assets') &&
        response.request().method() === 'POST'
    );

    await page.getByRole('button', { name: /create asset/i }).click();

    const createResponse = await createResponsePromise;
    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    createdAssetId = createBody?.data?.id;

    await expect(page.getByText('Asset created successfully')).toBeVisible();

    const createdRow = page.locator('tbody tr', { hasText: assetName });
    await expect(createdRow).toHaveCount(1);

    const persistedFetchPromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes('/assets') &&
        response.request().method() === 'GET' &&
        response.url().includes('q=')
    );

    await page.reload();
    await page.getByPlaceholder('Search assets...').fill(assetName);
    await persistedFetchPromise;

    await expect(page.locator('tbody tr', { hasText: assetName })).toHaveCount(1);
  } finally {
    await deleteAssetIfExists(request, createdAssetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});
