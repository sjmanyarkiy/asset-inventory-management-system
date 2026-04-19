const DEFAULT_DEV_API_BASE = "http://127.0.0.1:5001/api";

const KNOWN_PRODUCTION_BACKEND_BY_FRONTEND_HOST = {
  "asset-inventory-management-system-1.onrender.com":
    "https://asset-inventory-management-system-gkjx.onrender.com/api",
};

const trimTrailingSlash = (value) => (value.endsWith("/") ? value.slice(0, -1) : value);

const isLocalhostValue = (value) => {
  if (!value || typeof value !== "string") return false;
  const normalized = value.toLowerCase();
  return normalized.includes("localhost") || normalized.includes("127.0.0.1");
};

const normalizeCandidate = (value) => {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("%VITE_")) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      const pathname = trimTrailingSlash(parsed.pathname || "");

      if (!pathname || pathname === "/") {
        return `${parsed.origin}/api`;
      }

      if (pathname === "/api") {
        return `${parsed.origin}/api`;
      }

      return `${parsed.origin}${pathname}`;
    } catch {
      return undefined;
    }
  }

  if (trimmed.startsWith("/")) {
    const normalizedPath = trimTrailingSlash(trimmed);
    if (normalizedPath === "/") return "/api";
    return normalizedPath === "/api" ? "/api" : normalizedPath;
  }

  return undefined;
};

const getViteEnv = () => {
  try {
    return Function(
      "return typeof import !== 'undefined' && typeof import.meta !== 'undefined' ? import.meta.env : undefined;"
    )();
  } catch {
    return undefined;
  }
};

const getKnownProductionFallback = () => {
  if (typeof window === "undefined") return undefined;
  return KNOWN_PRODUCTION_BACKEND_BY_FRONTEND_HOST[window.location.hostname];
};

const isProductionLikeRuntime = (viteEnv) => {
  const browserHost = typeof window !== "undefined" ? window.location.hostname : undefined;
  const isLocalBrowserHost = browserHost === "localhost" || browserHost === "127.0.0.1";

  if (isLocalBrowserHost) {
    return false;
  }

  const viteProd = Boolean(viteEnv?.PROD);
  const nodeProd = typeof process !== "undefined" && process?.env?.NODE_ENV === "production";
  const browserProd =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  return viteProd || nodeProd || browserProd;
};

export const resolveApiBaseUrl = () => {
  const viteEnv = getViteEnv();
  const isProdLike = isProductionLikeRuntime(viteEnv);

  const runtimeBase = normalizeCandidate(
    typeof window !== "undefined" ? window.__APP_CONFIG__?.API_BASE_URL : undefined
  );
  const viteBase = normalizeCandidate(viteEnv?.VITE_API_BASE_URL);
  const processBase = normalizeCandidate(
    typeof process !== "undefined" ? process?.env?.VITE_API_BASE_URL : undefined
  );

  const preferred = runtimeBase ?? viteBase ?? processBase;

  if (preferred && !(isProdLike && isLocalhostValue(preferred))) {
    return preferred;
  }

  if (isProdLike) {
    const mappedProdFallback = getKnownProductionFallback();
    if (mappedProdFallback) return mappedProdFallback;
    return "/api";
  }

  return DEFAULT_DEV_API_BASE;
};

export const toAssetFileUrl = (filePath) => {
  if (!filePath || typeof filePath !== "string") return null;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;

  const normalizedPath = filePath.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!normalizedPath) return null;

  const apiBase = resolveApiBaseUrl();

  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    try {
      return `${new URL(apiBase).origin}/${normalizedPath}`;
    } catch {
      return `/${normalizedPath}`;
    }
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/${normalizedPath}`;
  }

  return `/${normalizedPath}`;
};
