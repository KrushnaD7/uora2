"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  UserCircle, 
  LogOut,
  Lightbulb,
  Library
} from "lucide-react";
import { logout } from "@/lib/api/auth";

export default function AuthorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Submissions", href: "/dashboard/submissions", icon: FileText },
    { name: "Submit Paper", href: "/dashboard/submissions/new", icon: Send },
    { name: "Available Issues", href: "/dashboard/issues", icon: Library },
    { name: "Suggest a Journal", href: "/dashboard/suggestions", icon: Lightbulb },
    { name: "My Profile", href: "/dashboard/profile", icon: UserCircle },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-full shadow-sm relative z-10">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0B8A83] to-[#0F608A] bg-clip-text text-transparent tracking-tight">
          Author Portal
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
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
