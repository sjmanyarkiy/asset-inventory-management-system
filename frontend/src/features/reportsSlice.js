import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axios";

export const fetchAssigned = createAsyncThunk("reports/fetchAssigned", async (params) => {
  const res = await axios.get('/api/reports/assigned', { params });
  return res.data;
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState: { assigned: { items: [], total: 0 }, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssigned.pending, (state) => { state.loading = true; })
      .addCase(fetchAssigned.fulfilled, (state, action) => { state.loading = false; state.assigned = action.payload; })
      .addCase(fetchAssigned.rejected, (state, action) => { state.loading = false; state.error = action.error; });
  }
});

export default reportsSlice.reducer;
