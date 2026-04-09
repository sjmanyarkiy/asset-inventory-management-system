import { configureStore } from "@reduxjs/toolkit";

// Reducers
import assetReducer from "../features/assetManagement/assetSlice";
import vendorReducer from "../features/vendors/VendorSlice";
import departmentReducer from "../features/departments/departmentSlice";
import categoryReducer from "../features/categories/categorySlice";
import typeReducer from "../features/types/typeSlice";

export const store = configureStore({
  reducer: {
    assets: assetReducer,
    vendors: vendorReducer,
    departments: departmentReducer,
    categories: categoryReducer,
    types: typeReducer,
  },
});
