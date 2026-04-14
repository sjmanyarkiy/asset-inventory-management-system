import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../src/services/api";

/* =========================
   FETCH TYPES (with search)
========================= */
export const fetchAssetTypes = createAsyncThunk(
  "types/fetchAssetTypes",
  async ({ page = 1, search = "" }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/types?page=${page}&search=${search}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch asset types"
      );
    }
  }
);

/* =========================
   CREATE TYPE
========================= */
export const createAssetType = createAsyncThunk(
  "types/createAssetType",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/types", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create asset type"
      );
    }
  }
);

/* =========================
   UPDATE TYPE
========================= */
export const updateAssetType = createAsyncThunk(
  "types/updateAssetType",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/types/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update asset type"
      );
    }
  }
);

/* =========================
   DELETE TYPE
========================= */
export const deleteAssetType = createAsyncThunk(
  "types/deleteAssetType",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/types/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete asset type"
      );
    }
  }
);

/* =========================
   SLICE
========================= */
const typeSlice = createSlice({
  name: "types",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchAssetTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || action.payload;
      })
      .addCase(fetchAssetTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE */
      .addCase(createAssetType.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateAssetType.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(deleteAssetType.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export default typeSlice.reducer;
