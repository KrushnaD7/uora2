/**
 * Centralized API client for UORA frontend.
 * All API requests should go through this module.
 */

// API base URL. In development this resolves to the Next.js `/api` proxy, which
// rewrites to the local backend. In production, set NEXT_PUBLIC_API_URL to the
// full public URL of the deployed backend (e.g. https://api.uorapublications.com)
// so the browser calls the real backend instead of localhost.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

class ApiError extends Error {
  status: number;
  errors?: any[];

  constructor(message: string, status: number, errors?: any[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

/** Persist the session access token (and optionally the refresh token) only.
 *  The user profile/role is deliberately NOT stored in localStorage: it is
 *  fetched from /auth/me on load, which reduces the surface exposed to XSS
 *  and prevents stale/forged client-side role data from being trusted.
 *
 *  A `session-token` cookie is also set so the Edge middleware can read the
 *  JWT without making a server-side API call, eliminating the "render then
 *  redirect" pattern for protected routes. */
export function persistSession(
  token: string,
  refreshToken?: string | null
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  // 7 days — matches typical JWT expiry; middleware will still reject expired tokens
  setCookie("session-token", token, 7 * 24 * 60 * 60);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  deleteCookie("session-token");
}

/**
 * Attempt to mint a fresh access token using the stored refresh token.
 * Returns true on success (tokens updated in localStorage).
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success || !data.data?.token) return false;
    persistSession(data.data.token, data.data.refreshToken || refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses (e.g., file downloads)
  const contentType = res.headers.get("content-type");
  if (contentType && !contentType.includes("application/json")) {
    if (!res.ok) {
      throw new ApiError("Request failed", res.status);
    }
    return { success: true, message: "OK", data: res as any };
  }

  const data: ApiResponse<T> = await res.json();

  if (!res.ok || !data.success) {
    // Handle 401 — attempt a single silent token refresh, then clear auth.
    if (res.status === 401) {
      const isAuthCall =
        endpoint === "/auth/login" ||
        endpoint === "/auth/refresh" ||
        endpoint === "/auth/register";
      if (!isAuthCall && !isRetry && (await tryRefreshToken())) {
        // Retry once with the freshly minted access token.
        return request<T>(endpoint, options, true);
      }
      if (typeof window !== "undefined") {
        clearSession();
        // Only redirect if not already on login page
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Surface friendly 429 (rate limited) messages.
    if (res.status === 429) {
      throw new ApiError(
        data.message || "Too many requests, please try again later.",
        res.status
      );
    }

    throw new ApiError(
      data.message || "Request failed",
      res.status,
      data.errors
    );
  }

  return data;
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),

  // For file uploads
  upload: <T = any>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: "POST",
      body: formData,
    }),
};

/**
 * Fetch a protected file (manuscript, CV, etc.) with the auth token and return
 * an object URL. Required because download links cannot send Authorization
 * headers, and the backend does not accept tokens in the query string.
 */
export async function fetchProtectedFile(
  endpoint: string
): Promise<{ url: string; filename: string; contentType: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { headers });

  if (!res.ok) {
    let message = "Download failed";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      /* not JSON */
    }
    throw new ApiError(message, res.status);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : "download";
  const contentType = res.headers.get("content-type") || blob.type || "application/octet-stream";

  return {
    url: URL.createObjectURL(blob),
    filename,
    contentType,
  };
}

/**
 * Trigger a browser download of a protected file using an auth header.
 */
export async function downloadProtectedFile(endpoint: string, fallbackName?: string): Promise<void> {
  const { url, filename, contentType } = await fetchProtectedFile(endpoint);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || fallbackName || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export { ApiError };
export type { ApiResponse };
