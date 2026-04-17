import { configureStore } from "@reduxjs/toolkit";

// Reducers
import assetReducer from "../../redux/slices/assetSlice";
import vendorReducer from "../../redux/slices/VendorSlice";
import departmentReducer from "../../redux/slices/departmentSlice";
import categoryReducer from "../../redux/slices/categorySlice";
import typeReducer from "../../redux/slices/typeSlice";

export const store = configureStore({
  reducer: {
    assets: assetReducer,
    vendors: vendorReducer,
    departments: departmentReducer,
    categories: categoryReducer,
    types: typeReducer,
  },
});
