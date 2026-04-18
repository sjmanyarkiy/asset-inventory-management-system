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
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  return api.post("/assets", data, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
};

/* =========================
   UPDATE ASSET
========================= */
export const updateAsset = (id, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  return api.put(
    `/assets/${id}`,
    data,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
  );
};

/* =========================
   DELETE ASSET
========================= */
export const deleteAsset = (id) => {
  return api.delete(`/assets/${id}`);
};