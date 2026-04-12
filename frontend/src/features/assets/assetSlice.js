import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssets,
  createAsset as createAssetAPI,
  updateAsset as updateAssetAPI,
  deleteAsset as deleteAssetAPI,
} from "./assetAPI";

/* =========================
   FETCH ASSETS
========================= */
export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (params = {}) => {
    const res = await getAssets(params);
    return res.data; // { data, total, pages, current_page }
  }
);

/* =========================
   CREATE ASSET
========================= */
export const createAsset = createAsyncThunk(
  "assets/createAsset",
  async (assetData, { dispatch, rejectWithValue }) => {
    try {
      const res = await createAssetAPI(assetData);

      // refresh list (MVP-safe approach)
      dispatch(fetchAssets());

      return res.data.data; // created asset
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Create failed");
    }
  }
);

/* =========================
   UPDATE ASSET
========================= */
export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const res = await updateAssetAPI(id, data);

      dispatch(fetchAssets());

      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Update failed");
    }
  }
);

/* =========================
   DELETE ASSET
========================= */
export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteAssetAPI(id);

      dispatch(fetchAssets());

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Delete failed");
    }
  }
);

/* =========================
   SLICE
========================= */
const assetSlice = createSlice({
  name: "assets",

  initialState: {
    data: [],
    meta: {
      total: 0,
      pages: 0,
      current_page: 1,
    },
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;

        state.data = action.payload?.data || [];
        state.meta = {
          total: action.payload?.total || 0,
          pages: action.payload?.pages || 0,
          current_page: action.payload?.current_page || 1,
        };
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      /* CREATE (optional local optimism if needed later) */
      .addCase(createAsset.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* UPDATE */
      .addCase(updateAsset.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteAsset.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default assetSlice.reducer;