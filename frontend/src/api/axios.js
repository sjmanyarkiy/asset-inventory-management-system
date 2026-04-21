import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

// attach token if present
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  console.log("🔑 Token in interceptor:", token ? "✅ Present" : "❌ Missing");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
