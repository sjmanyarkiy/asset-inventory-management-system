import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ================= FETCH ================= */
export const fetchVendors = createAsyncThunk(
  "vendors/fetch",
  async ({ page = 1, search = "" } = {}, thunkAPI) => {
    try {
      const res = await api.get(
        `/vendors?page=${page}&search=${search}`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Fetch failed");
    }
  }
);

/* ================= CREATE ================= */
export const createVendor = createAsyncThunk(
  "vendors/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/vendors", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Create failed");
    }
  }
);

/* ================= UPDATE ================= */
export const updateVendor = createAsyncThunk(
  "vendors/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/vendors/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Update failed");
    }
  }
);

/* ================= DELETE ================= */
export const deleteVendor = createAsyncThunk(
  "vendors/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/vendors/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue("Delete failed");
    }
  }
);

/* ================= NORMALIZER ================= */
const normalize = (v) => ({
  id: v.id,
  name: v.name || "",
  vendor_code: v.vendor_code || "",
  email: v.email || "",
  phone: v.phone || "",
  status: v.status || "active",
  contact_person: v.contact_person || "",
  postal_address: v.postal_address || "",
  physical_address: v.physical_address || "",
  payment_terms: v.payment_terms || "",
  description: v.description || "",
  bank_name: v.bank_name || "",
  bank_account_number: v.bank_account_number || "",
  bank_branch: v.bank_branch || "",
});

/* ================= SLICE ================= */
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
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;

        state.data = (action.payload.data || []).map(normalize);
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 1;
        state.current_page = action.payload.current_page || 1;
      })
      .addCase(fetchVendors.rejected, (state) => {
        state.loading = false;
      })

      /* CREATE */
      .addCase(createVendor.fulfilled, (state, action) => {
        state.data.unshift(normalize(action.payload));
      })

      /* UPDATE */
      .addCase(updateVendor.fulfilled, (state, action) => {
        const updated = normalize(action.payload);

        const index = state.data.findIndex((v) => v.id === updated.id);
        if (index !== -1) state.data[index] = updated;
      })

      /* DELETE */
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.data = state.data.filter((v) => v.id !== action.payload);
      });
  },
});

export default vendorSlice.reducer;