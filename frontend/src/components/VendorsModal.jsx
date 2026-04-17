import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "/vendors";

// -------------------- THUNKS --------------------

// Fetch vendors (with optional search)
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (search = "") => {
    const res = await axios.get(
      `${API_URL}?search=${search}`
    );
    return res.data.data; // because backend returns { data: [...] }
  }
);

// Create vendor
export const createVendor = createAsyncThunk(
  "vendors/createVendor",
  async (vendorData) => {
    const res = await axios.post(`${API_URL}/`, vendorData);
    return res.data;
  }
);

// Update vendor
export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, data }) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  }
);

// Delete vendor
export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

// -------------------- SLICE --------------------

const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // CREATE (✅ THIS IS THE KEY FIX)
      .addCase(createVendor.fulfilled, (state, action) => {
        // Add new vendor to top of list
        state.vendors.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(
          (v) => v.id === action.payload.id
        );
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(
          (v) => v.id !== action.payload
        );
      });
  },
});

export default vendorSlice.reducer;