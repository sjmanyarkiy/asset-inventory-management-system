import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../src/services/api";

/* FETCH */
export const fetchDepartments = createAsyncThunk(
  "departments/fetch",
  async ({ page = 1, search = "" } = {}, thunkAPI) => {
    try {
      const res = await api.get(
        `/departments/?page=${page}&search=${search}`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch departments");
    }
  }
);

/* CREATE */
export const createDepartment = createAsyncThunk(
  "departments/create",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/departments/", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Create failed");
    }
  }
);

/* UPDATE */
export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/departments/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Update failed");
    }
  }
);

/* DELETE */
export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/departments/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue("Delete failed");
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.data = action.payload.data;
      })

      /* CREATE */
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) state.data[index] = action.payload;
      })

      /* DELETE */
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.data = state.data.filter((d) => d.id !== action.payload);
      });
  },
});

export default departmentSlice.reducer;