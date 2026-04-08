import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch vendors (paginated)
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async () => {
    const response = await api.get("/vendors/");
    return response.data;
  }
);

const vendorSlice = createSlice({
  name: "vendors",
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
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;

        // Extract backend structure
        state.data = action.payload.data;
        state.meta = {
          total: action.payload.total,
          pages: action.payload.pages,
          current_page: action.payload.current_page,
        };
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default vendorSlice.reducer;