import { createSlice } from '@reduxjs/toolkit';

// Safe storage helper
const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item);
    return parsed;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Clear corrupted data
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const initialState = {
  user: loadFromStorage('user'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      saveToStorage('user', action.payload);
    },

    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refresh_token');
    },

    clearError: (state) => {
      state.error = null;
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      saveToStorage('user', state.user);
    }
  }
});

export const {
  setUser,
  setToken,
  setLoading,
  setError,
  logout,
  clearError,
  updateUser
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;