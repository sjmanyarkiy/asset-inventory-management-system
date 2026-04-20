import axios from "../../api/axios";

// --------------------
// GET all assets (with optional pagination)
// --------------------
export const getAssets = (params = {}) =>
  axios.get("/assets/", { params });

// Example usage:
// getAssets({ page: 1, per_page: 10 })

// --------------------
// GET single asset
// --------------------
export const getAssetById = (id) =>
  axios.get(`/assets/${id}`);

// --------------------
// CREATE asset
// --------------------
export const createAsset = (data) =>
  axios.post("/assets/", data);

// --------------------
// UPDATE asset
// --------------------
export const updateAsset = (id, data) =>
  axios.put(`/assets/${id}`, data);

// --------------------
// DELETE asset
// --------------------
export const deleteAsset = (id) =>
  axios.delete(`/assets/${id}`);