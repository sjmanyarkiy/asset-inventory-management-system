import api from "../../services/api";

// --------------------
// GET all assets (with optional pagination)
// --------------------
export const getAssets = (params = {}) =>
  api.get("/assets/", { params });

// Example usage:
// getAssets({ page: 1, per_page: 10 })

// --------------------
// GET single asset
// --------------------
export const getAssetById = (id) =>
  api.get(`/assets/${id}`);

// --------------------
// CREATE asset
// --------------------
export const createAsset = (data) =>
  api.post("/assets/", data);

// --------------------
// UPDATE asset
// --------------------
export const updateAsset = (id, data) =>
  api.put(`/assets/${id}`, data);

// --------------------
// DELETE asset
// --------------------
export const deleteAsset = (id) =>
  api.delete(`/assets/${id}`);