"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ClipboardCheck, Star, AlertCircle, Download, Eye, X } from "lucide-react";
import Link from "next/link";
import { api, fetchProtectedFile, downloadProtectedFile } from "@/lib/api/client";

export default function ReviewerDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewSub, setPreviewSub] = useState<any | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");

  const handlePreview = (sub: any) => {
    setPreviewSub(sub);
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/reviewers/my/assignments");
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch reviewer assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!previewSub) {
      setPreviewFileUrl("");
      return;
    }
    let cancelled = false;
    fetchProtectedFile(`/submissions/${previewSub.id}/download`)
      .then((result) => {
        if (!cancelled) setPreviewFileUrl(result.url);
      })
      .catch(() => {
        if (!cancelled) setPreviewFileUrl("");
      });
    return () => { cancelled = true; };
  }, [previewSub]);

  const pending = assignments.filter(a => a.status === "PENDING" || a.status === "ACCEPTED");
  const completed = assignments.filter(a => a.status === "COMPLETED");
  const newRequests = assignments.filter(a => a.status === "PENDING");

  const stats = [
    { title: "Pending Reviews", value: pending.length.toString(), icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Completed Reviews", value: completed.length.toString(), icon: ClipboardCheck, color: "text-green-600", bg: "bg-green-50" },
    { title: "New Requests", value: newRequests.length.toString(), icon: Search, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Avg Rating", value: "N/A", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const handleDownload = (subId: string) => {
    downloadProtectedFile(`/submissions/${subId}/download`);
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reviewer Overview</h1>
        <p className="text-slate-500 mt-1">Manage your peer review assignments.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pending Assignments</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-12">{error}</div>
          ) : pending.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              Your pending review assignments will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map((a) => (
                <div key={a.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{a.submission.title}</p>
                    <p className="text-xs text-slate-500">
                      ID: {a.submission.paperId} • Journal: {a.submission.journal.name} • Deadline: {a.deadline ? new Date(a.deadline).toLocaleDateString() : "No deadline set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePreview(a.submission)}
                      className="p-2 border border-slate-100 hover:border-slate-200 rounded-xl text-slate-700 bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
                      title="Preview Manuscript"
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <Link
                      href="/reviewer/pending"
                      className="px-3.5 py-2 bg-[#0B8A83] text-white hover:bg-[#09756f] rounded-xl text-xs font-semibold"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/guidelines"
              className="w-full p-4 text-center border border-slate-100 rounded-xl hover:border-[#0B8A83] hover:bg-[#DDF6F4] transition-all font-semibold text-[#0B8A83] block"
            >
              View Guidelines
            </Link>
            <Link
              href="/reviewer/completed"
              className="w-full p-4 text-center border border-slate-100 rounded-xl hover:border-slate-300 transition-all font-medium text-slate-700 bg-slate-50 block"
            >
              Completed Reviews
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Manuscript Preview Modal */}
      <AnimatePresence>
        {previewSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Manuscript Preview</h2>
                  <p className="text-sm text-slate-500 mt-0.5 max-w-xl truncate">{previewSub.title}</p>
                </div>
                <button onClick={() => setPreviewSub(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <iframe
                src={previewFileUrl}
                title="Manuscript Preview"
                className="w-full flex-1 min-h-[62vh] border-0 bg-slate-100"
              />

              <div className="p-4 border-t border-slate-100 flex justify-between items-center shrink-0">
                <button
                  onClick={() => downloadProtectedFile(`/submissions/${previewSub.id}/download`, previewSub.title)}
                  className="flex items-center gap-2 text-sm font-medium text-[#0B8A83] hover:underline"
                >
                  <Download size={16} /> Download Manuscript
                </button>
                <Link
                  href="/reviewer/pending"
                  className="px-4 py-2 bg-[#0B8A83] text-white hover:bg-[#09756f] rounded-xl text-sm font-semibold"
                >
                  Go to Review
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

