import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssets,
  createAsset as createAssetAPI,
  updateAsset as updateAssetAPI,
  deleteAsset as deleteAssetAPI,
} from "../../src/features/assetManagement/assetAPI";

// --------------------
// FETCH ASSETS
// --------------------
export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async () => {
    const response = await getAssets();
    return response.data;
  }
);

// --------------------
// CREATE ASSET
// --------------------
export const createAsset = createAsyncThunk(
  "assets/createAsset",
  async (assetData) => {
    const response = await createAssetAPI(assetData);
    return response.data;
  }
);

// --------------------
// UPDATE ASSET
// --------------------
export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async ({ id, data }) => {
    const response = await updateAssetAPI(id, data);
    return response.data;
  }
);

// --------------------
// DELETE ASSET
// --------------------
export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (id) => {
    await deleteAssetAPI(id);
    return id;
  }
);

// --------------------
// SLICE
// --------------------
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
      // FETCH
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;

        state.data = action.payload.data;
        state.meta = {
          total: action.payload.total,
          pages: action.payload.pages,
          current_page: action.payload.current_page,
        };
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // CREATE
      .addCase(createAsset.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateAsset.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (asset) => asset.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (asset) => asset.id !== action.payload
        );
      });
  },
});

export default assetSlice.reducer;
