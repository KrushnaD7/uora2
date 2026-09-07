"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BookOpen, 
  LogOut,
  ClipboardCheck,
  Lightbulb,
  Files,
  CheckSquare
} from "lucide-react";
import { logout } from "@/lib/api/auth";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Reviewer Applications", href: "/admin/applications", icon: ClipboardCheck },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Journals", href: "/admin/journals", icon: BookOpen },
    { name: "Journal Suggestions", href: "/admin/suggestions", icon: Lightbulb },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Submissions", href: "/admin/submissions", icon: Files },
    { name: "Assign Reviewers", href: "/admin/assign", icon: Users },
    { name: "Editorial Decisions", href: "/admin/decisions", icon: CheckSquare },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-full shadow-sm relative z-10">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0B8A83] to-[#0F608A] bg-clip-text text-transparent tracking-tight">
          UORA Admin
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#DDF6F4] text-[#0F608A] font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-[#0B8A83]" : ""} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
