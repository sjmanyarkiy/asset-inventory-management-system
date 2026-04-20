// import axios from "axios";
import axios from "../../src/api/axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* -----------------------------
   REQUEST INTERCEPTOR
   (Attach auth token if available)
----------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* -----------------------------
   RESPONSE INTERCEPTOR
   (Global error handling)
----------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors globally
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("Unauthorized - redirect to login");
        // optional: redirect user
      }

      if (status === 500) {
        console.error("Server error");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
