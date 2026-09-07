"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type UserRole = "ADMIN" | "SUB_ADMIN" | "EDITOR" | "REVIEWER" | "AUTHOR";
type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  initialData?: User | null;
  loading?: boolean;
}

export default function UserModal({ isOpen, onClose, onSave, initialData, loading }: UserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
    role: "AUTHOR",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        status: initialData.status,
        password: "", // Don't pre-fill password on edit
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "AUTHOR",
        status: "ACTIVE",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? "Edit User" : "Create New User"}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password {initialData && "(Leave blank to keep current)"}
              </label>
              <input
                type="password"
                required={!initialData} // Required only for new users
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] bg-white transition-all"
                >
                  <option value="AUTHOR">Author</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="EDITOR">Editor</option>
                  <option value="SUB_ADMIN">Sub Admin</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] bg-white transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
