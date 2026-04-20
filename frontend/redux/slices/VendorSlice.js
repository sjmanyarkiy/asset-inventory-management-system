import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../src/services/api";

/* ---------------- FETCH ---------------- */
export const fetchVendors = createAsyncThunk(
  "vendors/fetch",
  async ({ page = 1, search = "" } = {}, thunkAPI) => {
    try {
      // const res = await api.get(`/vendors/?page=${page}&search=${search}`);
      const res = await api.get(`/vendors`, { params: { page, search } });
      console.log("FETCH VENDORS RESPONSE:", res.data);
      return res.data;
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue("Fetch failed");
    }
  }
);

/* ---------------- CREATE ---------------- */
export const createVendor = createAsyncThunk(
  "vendors/create",
  async (data, thunkAPI) => {
    try {
      console.log("CREATE PAYLOAD SENT:", data);

      const res = await api.post(`/vendors`, data);

      console.log("CREATE RESPONSE RECEIVED:", res.data);

      return res.data;
    } catch (err) {
      console.error("CREATE ERROR:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Create failed"
      );
    }
  }
);

/* ---------------- UPDATE ---------------- */
export const updateVendor = createAsyncThunk(
  "vendors/update",
  async ({ id, data }, thunkAPI) => {
    try {
      console.log("UPDATE ID:", id);
      console.log("UPDATE PAYLOAD SENT:", data);

      // const res = await api.put(`/vendors/${id}`, data);
      const res = await api.put(`/vendors/${id}`, data);

      console.log("UPDATE RESPONSE RECEIVED:", res.data);

      return res.data;
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Update failed"
      );
    }
  }
);

/* ---------------- DELETE ---------------- */
export const deleteVendor = createAsyncThunk(
  "vendors/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/vendors/${id}`);
      console.log("DELETED VENDOR ID:", id);
      return id;
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue("Delete failed");
    }
  }
);

/* ---------------- NORMALIZER (IMPORTANT FIX) ---------------- */
const normalizeVendor = (vendor) => ({
  id: vendor.id,
  name: vendor.name || "",
  vendor_code: vendor.vendor_code || "",
  email: vendor.email || "",
  phone: vendor.phone || "",
  contact_person: vendor.contact_person || "",
  status: vendor.status || "active",
  postal_address: vendor.postal_address || "",
  physical_address: vendor.physical_address || "",
  payment_terms: vendor.payment_terms || "",
  description: vendor.description || "",
  bank_name: vendor.bank_name || "",
  bank_account_number: vendor.bank_account_number || "",
  bank_branch: vendor.bank_branch || "",
});

/* ---------------- SLICE ---------------- */
const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    data: [],
    loading: false,
    error: null,
    total: 0,
    pages: 0,
    current_page: 1,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.data = (action.payload.data || []).map(normalizeVendor);
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.current_page = action.payload.current_page;
      })

      /* CREATE (SAFE PUSH) */
      .addCase(createVendor.fulfilled, (state, action) => {
        const vendor = normalizeVendor(action.payload);

        console.log("ADDING NEW VENDOR TO STATE:", vendor);

        state.data.unshift(vendor);
      })

      /* UPDATE (SAFE REPLACE) */
      .addCase(updateVendor.fulfilled, (state, action) => {
        const updated = normalizeVendor(action.payload);

        console.log("UPDATING VENDOR IN STATE:", updated);

        const index = state.data.findIndex(
          (v) => v.id === updated.id
        );

        if (index !== -1) {
          state.data[index] = updated;
        }
      })

      /* DELETE */
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (v) => v.id !== action.payload
        );
      });
  },
});

export default vendorSlice.reducer;