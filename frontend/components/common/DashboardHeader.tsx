"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, MailOpen, AlertCircle, RefreshCw, Menu } from "lucide-react";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);

    // Event listener for outside clicks to close dropdown
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`, {});
      if (res.success) {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-sm relative z-20">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-[#0B8A83] hover:bg-slate-50 rounded-xl transition-colors md:hidden cursor-pointer"
          >
            <Menu size={22} />
          </button>
        )}
        {user && (
          <div className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
            Logged in as: <span className="text-teal-700 font-bold">{user.name} ({user.role})</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4" ref={dropdownRef}>
        {/* Bell Icon Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 text-slate-500 hover:text-[#0B8A83] hover:bg-slate-50 rounded-xl transition-all duration-300 relative focus:outline-none cursor-pointer border border-slate-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Glassmorphic Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white/95 border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,.12)] backdrop-blur-md overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Dropdown Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="font-bold text-slate-800 text-sm">Notifications</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-teal-700 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <MailOpen size={24} className="opacity-40" />
                    <span>No notifications yet.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`p-4 hover:bg-slate-50/50 transition-colors cursor-pointer flex gap-3 ${
                        !n.isRead ? "bg-[#EFFBFA]/40 font-semibold" : ""
                      }`}
                    >
                      <div className="mt-0.5">
                        <AlertCircle
                          size={16}
                          className={!n.isRead ? "text-teal-600" : "text-slate-400"}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          • {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="self-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 block" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
