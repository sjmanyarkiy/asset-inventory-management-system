const API_BASE = process.env.PW_BACKEND_URL || 'http://127.0.0.1:5001';
export const E2E_TAG = 'e2e-test-';

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const assertOk = async (response, context) => {
  if (response.ok()) return;
  const body = await parseJson(response);
  throw new Error(`${context} failed with ${response.status()}: ${JSON.stringify(body)}`);
};

export const createCategoryAndType = async (request, suffix) => {
  const token = suffix.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
  const categoryPayload = {
    name: `${E2E_TAG}category-${suffix}`,
    category_code: `C${token}`,
  };

  const categoryResponse = await request.post(`${API_BASE}/categories`, { data: categoryPayload });
  await assertOk(categoryResponse, 'Create category');
  const categoryBody = await parseJson(categoryResponse);
  const categoryId = categoryBody?.id ?? categoryBody?.data?.id;

  if (!categoryId) {
    throw new Error(`Create category did not return id: ${JSON.stringify(categoryBody)}`);
  }

  const typePayload = {
    name: `${E2E_TAG}type-${suffix}`,
    type_code: `T${token}`,
    category_id: categoryId,
  };

  const typeResponse = await request.post(`${API_BASE}/types`, { data: typePayload });
  await assertOk(typeResponse, 'Create type');
  const typeBody = await parseJson(typeResponse);
  const typeId = typeBody?.id ?? typeBody?.data?.id;

  if (!typeId) {
    throw new Error(`Create type did not return id: ${JSON.stringify(typeBody)}`);
  }

  return {
    categoryId,
    typeId,
    categoryName: categoryPayload.name,
    typeName: typePayload.name,
  };
};

export const createAssetViaApi = async (request, data) => {
  const multipart = Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  );

  const response = await request.post(`${API_BASE}/assets`, {
    multipart,
  });

  await assertOk(response, 'Create asset via API');
  const body = await parseJson(response);
  const asset = body?.data;

  if (!asset?.id) {
    throw new Error(`Create asset response missing data.id: ${JSON.stringify(body)}`);
  }

  return asset;
};

export const deleteAssetIfExists = async (request, id) => {
  if (!id) return;
  const response = await request.delete(`${API_BASE}/assets/${id}`);
  if (response.status() === 404) return;
  await assertOk(response, 'Delete asset');
};

export const cleanupTaggedAssets = async (request, tag = E2E_TAG) => {
  const response = await request.get(`${API_BASE}/assets`, {
    params: {
      q: tag,
      per_page: 200,
      page: 1,
    },
  });

  if (!response.ok()) return;

  const body = await parseJson(response);
  const assets = body?.data || [];

  for (const asset of assets) {
    await deleteAssetIfExists(request, asset.id);
  }
};

export const cleanupCategoryAndType = async (request, categoryId, typeId) => {
  if (typeId) {
    const typeResp = await request.delete(`${API_BASE}/types/${typeId}`);
    if (typeResp.status() !== 404) {
      await assertOk(typeResp, 'Delete type');
    }
  }

  if (categoryId) {
    const categoryResp = await request.delete(`${API_BASE}/categories/${categoryId}`);
    if (categoryResp.status() !== 404) {
      await assertOk(categoryResp, 'Delete category');
    }
  }
};

export const apiBase = API_BASE;
