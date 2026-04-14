import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../src/services/api";

/* =========================
   FETCH (LIVE SEARCH READY)
========================= */
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ page = 1, search = "" }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/categories?page=${page}&search=${search}`
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch categories"
      );
    }
  }
);

/* =========================
   CREATE
========================= */
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/categories/", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Create failed"
      );
    }
  }
);

/* =========================
   UPDATE
========================= */
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Update failed"
      );
    }
  }
);

/* =========================
   DELETE
========================= */
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Delete failed"
      );
    }
  }
);

/* =========================
   SLICE
========================= */
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; // backend paginated response
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* CREATE */
      .addCase(createCategory.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export default categorySlice.reducer;