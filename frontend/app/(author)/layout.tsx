"use client";

import AuthorSidebar from "@/components/author/AuthorSidebar";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import DashboardShell from "@/components/common/DashboardShell";

export default function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["AUTHOR"]}>
      <DashboardShell sidebar={<AuthorSidebar />}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
