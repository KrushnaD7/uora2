"use client";

import EditorSidebar from "@/components/editor/EditorSidebar";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import DashboardShell from "@/components/common/DashboardShell";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["EDITOR", "SUB_ADMIN", "ADMIN"]}>
      <DashboardShell sidebar={<EditorSidebar />}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
