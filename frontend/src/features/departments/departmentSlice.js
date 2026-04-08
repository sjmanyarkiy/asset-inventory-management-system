import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch departments (paginated)
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async () => {
    const response = await api.get("/departments/");
    return response.data;
  }
);

const departmentSlice = createSlice({
  name: "departments",
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
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;

        // Extract backend structure
        state.data = action.payload.data;
        state.meta = {
          total: action.payload.total,
          pages: action.payload.pages,
          current_page: action.payload.current_page,
        };
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default departmentSlice.reducer;