"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const roleRedirects: Record<string, string> = {
        ADMIN: "/admin",
        SUB_ADMIN: "/editor/dashboard",
        EDITOR: "/editor/dashboard",
        REVIEWER: "/reviewer/dashboard",
        AUTHOR: "/dashboard",
      };
      router.replace(roleRedirects[user.role] || "/login");
    }
  }, [mounted, loading, isAuthenticated, user, allowedRoles, router]);

  // During SSR and initial client hydration, render children to match the server HTML
  if (!mounted || loading) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
