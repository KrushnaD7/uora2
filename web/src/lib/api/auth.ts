/**
 * Auth API functions
 */
import { api, persistSession, clearSession } from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "REVIEWER" | "AUTHOR";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
  authorProfile?: {
    id: string;
    fullName: string;
    mobile?: string;
    country?: string;
    institution?: string;
    designation?: string;
    orcid?: string;
  } | null;
  reviewerProfile?: {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
    country?: string;
    institution?: string;
    designation?: string;
    expertise?: string;
  } | null;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  mobile?: string;
  country?: string;
  institution?: string;
  designation?: string;
  orcid?: string;
}

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  if (res.data) {
    persistSession(
      res.data.token,
      res.data.refreshToken || null
    );
  }
  return res;
}

export async function register(data: RegisterData) {
  const res = await api.post<LoginResponse>("/auth/register", data);
  if (res.data) {
    persistSession(
      res.data.token,
      res.data.refreshToken || null
    );
  }
  return res;
}

export async function getMe() {
  return api.get<User>("/auth/me");
}

export async function logout() {
  try {
    await api.post("/auth/logout", { refreshToken: getStoredRefreshToken() });
  } catch {
    /* best-effort server-side revocation */
  }
  clearSession();
}

export async function updateProfile(data: any) {
  const res = await api.patch<User>("/auth/profile", data);
  // The returned user is the authoritative profile, but it is intentionally
  // NOT written to localStorage (see persistSession). Consumers should read
  // updates from the response / a refetched /auth/me.
  return res;
}

export async function changePassword(data: any) {
  return api.post("/auth/change-password", data);
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}
