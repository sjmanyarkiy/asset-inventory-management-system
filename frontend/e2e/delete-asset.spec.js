import { expect, test } from '@playwright/test';
import {
  E2E_TAG,
  apiBase,
  cleanupCategoryAndType,
  createAssetViaApi,
  createCategoryAndType,
  deleteAssetIfExists,
} from './utils/assetApi';

test('@smoke delete asset flow: request + toast + row removal + reload persistence', async ({ page, request }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const { categoryId, typeId } = await createCategoryAndType(request, suffix);
  const assetName = `${E2E_TAG}asset-delete-${suffix}`;

  let assetId;

  try {
    const asset = await createAssetViaApi(request, {
      name: assetName,
      asset_code: `${E2E_TAG}code-delete-${suffix}`,
      barcode: `${E2E_TAG}barcode-delete-${suffix}`,
      status: 'available',
      category_id: categoryId,
      asset_type_id: typeId,
    });

    assetId = asset.id;

    await page.goto('/assets');
    const searchResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes('/assets') &&
        response.request().method() === 'GET' &&
        response.url().includes('q=')
    );
    await page.getByPlaceholder('Search assets...').fill(assetName);
    await searchResponsePromise;

    const row = page.locator('tbody tr', { hasText: assetName });
    await expect(row).toHaveCount(1);

    page.once('dialog', (dialog) => dialog.accept());

    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'DELETE'
    );

    await row.getByRole('button', { name: /delete/i }).click();

    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);

    await expect(page.getByText('Asset deleted successfully')).toBeVisible();
    await expect(page.locator('tbody tr', { hasText: assetName })).toHaveCount(0);

    assetId = null;

    await page.reload();
    const persistedSearchPromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes('/assets') &&
        response.request().method() === 'GET' &&
        response.url().includes('q=')
    );
    await page.getByPlaceholder('Search assets...').fill(assetName);
    await persistedSearchPromise;
    await expect(page.locator('tbody tr', { hasText: assetName })).toHaveCount(0);
    await expect(page.getByText('No assets found.')).toBeVisible();
  } finally {
    await deleteAssetIfExists(request, assetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});
