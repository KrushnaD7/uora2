"use client";

import ReviewerSidebar from "@/components/reviewer/ReviewerSidebar";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import DashboardShell from "@/components/common/DashboardShell";

export default function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["REVIEWER"]}>
      <DashboardShell sidebar={<ReviewerSidebar />}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
