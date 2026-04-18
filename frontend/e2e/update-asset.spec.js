import { expect, test } from '@playwright/test';
import {
  E2E_TAG,
  apiBase,
  cleanupCategoryAndType,
  createAssetViaApi,
  createCategoryAndType,
  deleteAssetIfExists,
} from './utils/assetApi';

test('@smoke update asset flow: request + toast + no duplicates + reload persistence', async ({ page, request }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const { categoryId, typeId } = await createCategoryAndType(request, suffix);

  const originalName = `${E2E_TAG}asset-update-original-${suffix}`;
  const updatedName = `${E2E_TAG}asset-update-final-${suffix}`;

  let assetId;

  try {
    const asset = await createAssetViaApi(request, {
      name: originalName,
      asset_code: `${E2E_TAG}code-update-${suffix}`,
      barcode: `${E2E_TAG}barcode-update-${suffix}`,
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
    await page.getByPlaceholder('Search assets...').fill(originalName);
    await searchResponsePromise;
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(1);

    await page.locator('tbody tr', { hasText: originalName }).getByRole('button', { name: /edit/i }).click();

    const nameInput = page.getByPlaceholder('Asset Name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(updatedName);
    await page.locator('form select[name="status"]').selectOption('under_repair');

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes(`/assets/${assetId}`) &&
        response.request().method() === 'PUT'
    );

    await page.getByRole('button', { name: /update asset/i }).click();

    const updateResponse = await updateResponsePromise;
    expect(updateResponse.status()).toBe(200);

    await expect(page.getByText('Asset updated successfully')).toBeVisible();

    const refetchAfterUpdatePromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes('/assets') &&
        response.request().method() === 'GET'
    );
    await page.getByPlaceholder('Search assets...').fill(updatedName);
    await refetchAfterUpdatePromise;
    await expect(page.locator('tbody tr', { hasText: updatedName })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: originalName })).toHaveCount(0);

    await page.reload();
    const persistedSearchPromise = page.waitForResponse(
      (response) =>
        response.url().startsWith(apiBase) &&
        response.url().includes('/assets') &&
        response.request().method() === 'GET' &&
        response.url().includes('q=')
    );
    await page.getByPlaceholder('Search assets...').fill(updatedName);
    await persistedSearchPromise;
    await expect(page.locator('tbody tr', { hasText: updatedName })).toHaveCount(1);
  } finally {
    await deleteAssetIfExists(request, assetId);
    await cleanupCategoryAndType(request, categoryId, typeId);
  }
});
