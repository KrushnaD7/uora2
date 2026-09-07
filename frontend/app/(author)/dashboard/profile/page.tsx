"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Building, Globe, Phone, Calendar, BadgeCheck, X, Edit2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateProfile, changePassword } from "@/lib/api/auth";

export default function AuthorProfilePage() {
  const { user, refreshUser } = useAuth();
  const profile = user?.authorProfile;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: "",
    mobile: "",
    country: "",
    institution: "",
    designation: "",
    orcid: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        mobile: profile?.mobile || "",
        country: profile?.country || "",
        institution: profile?.institution || "",
        designation: profile?.designation || "",
        orcid: profile?.orcid || "",
      });
    }
  }, [user, isEditModalOpen]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");

    try {
      const res = await updateProfile(editForm);
      if (!res.success) throw new Error(res.message);
      
      await refreshUser();
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (!res.success) throw new Error(res.message);

      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-slate-500 mt-1">Your author profile information.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-[#0B8A83] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#09756f] transition-colors shadow-sm text-sm"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
          <button
            onClick={() => {
              setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
              setPasswordError("");
              setPasswordSuccess("");
              setIsPasswordModalOpen(true);
            }}
            className="flex items-center gap-2 border border-slate-200 text-slate-700 bg-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            <Lock size={16} /> Change Password
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0B8A83] to-[#0F608A] flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user?.name || "Author"}</h2>
          <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
          <div className="mt-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-600 border-green-100">
              {user?.role}
            </span>
          </div>
          <div className="mt-4 w-full pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—"}
            </p>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6">Profile Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
                <p className="text-slate-900 font-medium mt-0.5">{profile?.fullName || user?.name || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-slate-900 font-medium mt-0.5">{user?.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600 mt-0.5">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</p>
                <p className="text-slate-900 font-medium mt-0.5">{profile?.mobile || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 mt-0.5">
                <Building size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution</p>
                <p className="text-slate-900 font-medium mt-0.5">{profile?.institution || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mt-0.5">
                <BadgeCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</p>
                <p className="text-slate-900 font-medium mt-0.5">{profile?.designation || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ORCID</p>
                <p className="text-slate-900 font-medium mt-0.5">
                  {profile?.orcid ? (
                    <a href={`https://orcid.org/${profile.orcid}`} target="_blank" rel="noreferrer" className="text-[#0B8A83] hover:underline">
                      {profile.orcid}
                    </a>
                  ) : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 mt-0.5">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</p>
                <p className="text-slate-900 font-medium mt-0.5">{profile?.country || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-600 mt-0.5">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</p>
                <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-md text-xs font-semibold mt-0.5 inline-block">
                  {user?.status || "—"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ORCID ID</label>
                  <input
                    type="text"
                    value={editForm.orcid}
                    onChange={(e) => setEditForm({ ...editForm, orcid: e.target.value })}
                    placeholder="0000-0000-0000-0000"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm font-medium">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] transition-all"
                  />
                </div>

                <div className="mt-8 flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
