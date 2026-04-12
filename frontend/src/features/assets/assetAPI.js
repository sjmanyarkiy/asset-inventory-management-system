import api from "../../services/api";

/* =========================
   GET ALL ASSETS
========================= */
export const getAssets = (params = {}) => {
  return api.get("/assets", { params });
};

/* =========================
   GET SINGLE ASSET
========================= */
export const getAssetById = (id) => {
  return api.get(`/assets/${id}`);
};

/* =========================
   CREATE ASSET
========================= */
export const createAsset = (data) => {
  return api.post("/assets", data);
};

/* =========================
   UPDATE ASSET
========================= */
export const updateAsset = (id, data) => {
  return api.put(`/assets/${id}`, data);
};

/* =========================
   DELETE ASSET
========================= */
export const deleteAsset = (id) => {
  return api.delete(`/assets/${id}`);
};