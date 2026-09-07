"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Shield, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and platform configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <p className="text-slate-900 font-medium text-lg">{user?.name || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <p className="text-slate-900 font-medium">{user?.email || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100">
                {user?.role || "—"}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Status</label>
              <span className="text-green-500 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">
                {user?.status || "—"}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Member Since</label>
              <p className="text-slate-700 text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-1">Password</p>
              <p className="text-xs text-slate-500">Password management is handled through the authentication system.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-1">Session</p>
              <p className="text-xs text-slate-500">Your session is secured with JWT authentication. You will be automatically logged out when your token expires.</p>
            </div>
          </div>
        </motion.div>

        {/* Platform Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <SettingsIcon size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Platform Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Platform</p>
              <p className="text-slate-900 font-semibold">UORA Journals</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Version</p>
              <p className="text-slate-900 font-semibold">1.0.0</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">API Server</p>
              <p className="text-slate-900 font-semibold text-sm">{process.env.NEXT_PUBLIC_API_URL || "/api"}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
