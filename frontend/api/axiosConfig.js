import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://asset-inventory-management-system-gkjx.onrender.com/api',
});

// Attach JWT token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;