"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import DashboardShell from "@/components/common/DashboardShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardShell sidebar={<AdminSidebar />}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
