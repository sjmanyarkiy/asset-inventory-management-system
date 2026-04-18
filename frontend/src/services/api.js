import axios from "axios";

export const getApiErrorMessage = (error) => {
  if (!error?.response) {
    return "Cannot reach server. Please check your connection and try again.";
  }

  const status = error.response.status;
  const serverMessage = error.response?.data?.error;

  if (serverMessage) {
    return serverMessage;
  }

  if (status === 400) return "Invalid request. Please check your input and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "Requested resource was not found.";
  if (status >= 500) return "Server error. Please try again shortly.";

  return "Request failed. Please try again.";
};

const resolveApiBaseUrl = () => {
  const normalizeBase = (value) => {
    if (!value || typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("%VITE_")) return undefined;

    // Preserve empty string semantics when caller intentionally wants same-origin.
    if (trimmed === "") return "";

    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  };

  const getViteEnv = () => {
    try {
      // Avoid direct import.meta access so Jest can parse this module in CJS mode.
      return Function(
        "return typeof import !== 'undefined' && typeof import.meta !== 'undefined' ? import.meta.env : undefined;"
      )();
    } catch {
      return undefined;
    }
  };

  const viteEnv = getViteEnv();
  const isViteDev = Boolean(viteEnv?.DEV);

  const runtimeBase = normalizeBase(
    typeof window !== "undefined" ? window.__APP_CONFIG__?.API_BASE_URL : undefined
  );

  const viteBase = normalizeBase(viteEnv?.VITE_API_BASE_URL);

  const processBase = normalizeBase(
    typeof process !== "undefined" ? process.env?.VITE_API_BASE_URL : undefined
  );

  if (runtimeBase !== undefined) return runtimeBase;
  if (viteBase !== undefined) return viteBase;
  if (processBase !== undefined) return processBase;

  // Local development convenience fallback only.
  if (isViteDev) {
    return "http://127.0.0.1:5001";
  }

  // Production-safe fallback: same origin (for reverse-proxy/fullstack deployments).
  return "";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =============================
   REQUEST INTERCEPTOR
   Attach auth token if available
============================= */
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

/* =============================
   RESPONSE INTERCEPTOR
   Global error handling
============================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getApiErrorMessage(error);
    error.userMessage = message;

    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("Unauthorized - token expired or missing");
      }

      if (status === 500) {
        console.error("Server error");
      }
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(
        new CustomEvent("api:error", {
          detail: {
            message,
            status: error.response?.status || null,
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;