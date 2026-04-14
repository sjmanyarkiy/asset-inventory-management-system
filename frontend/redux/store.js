import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

import assetReducer from "../redux/slices/assetSlice";
import vendorReducer from "../redux/slices/VendorSlice";
import departmentReducer from "../redux/slices/departmentSlice";
import categoryReducer from "../redux/slices/categorySlice";
import typeReducer from "../redux/slices/typeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other slices here
    assets: assetReducer,
    vendors: vendorReducer,
    departments: departmentReducer,
    categories: categoryReducer,
    types: typeReducer,
  }
});

export default store;

