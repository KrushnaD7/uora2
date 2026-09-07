"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, getMe, logout as apiLogout, getStoredToken } from "../api/auth";
import { persistSession, clearSession, ApiError } from "../api/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  // True when the API could not be reached at all (network/DNS/CORS failure,
  // or a 5xx) — as opposed to the token genuinely being invalid (401/403).
  // Lets the UI distinguish "your backend isn't reachable" from "please log
  // in again" instead of silently logging the user out on a network blip.
  apiUnreachable: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  apiUnreachable: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiUnreachable, setApiUnreachable] = useState(false);

  const verifyAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getMe();
      if (res.data) {
        setUser(res.data);
        setApiUnreachable(false);
        persistSession(getStoredToken() || "");
      }
    } catch (error) {
      // Only clear the stored session when the SERVER told us the token is
      // genuinely invalid/expired (401/403). Any other failure — a network
      // error, DNS failure, CORS rejection, or a 5xx — means we simply
      // couldn't reach the API, and wiping a perfectly good token on a
      // transient outage would force every user to log in again the moment
      // the backend hiccups. Keep the token and surface `apiUnreachable`
      // instead so the UI can show a "can't reach the server" state.
      const isAuthRejection =
        error instanceof ApiError && (error.status === 401 || error.status === 403);

      if (isAuthRejection) {
        clearSession();
        setUser(null);
        setApiUnreachable(false);
      } else {
        setApiUnreachable(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const handleLogin = useCallback((token: string, userData: User) => {
    persistSession(token);
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await verifyAuth();
  }, [verifyAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        apiUnreachable,
        login: handleLogin,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
