"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Search, AlertCircle, X, Send, Star } from "lucide-react";
import { api } from "@/lib/api/client";

export default function EditorialDecisionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Decision modal state
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("INITIAL_SCREENING");
  const [remarks, setRemarks] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState("");
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const recommendationLabels: Record<string, { label: string; color: string }> = {
    ACCEPT: { label: "Accept", color: "bg-green-100 text-green-700 border-green-200" },
    MINOR_REVISION: { label: "Minor Revision", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    MAJOR_REVISION: { label: "Major Revision", color: "bg-orange-100 text-orange-700 border-orange-200" },
    REJECT: { label: "Reject", color: "bg-red-100 text-red-700 border-red-200" },
  };

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/submissions");
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    const maps: Record<string, string> = {
      DRAFT: "bg-slate-100 text-slate-700",
      SUBMITTED: "bg-blue-100 text-blue-700",
      INITIAL_SCREENING: "bg-indigo-100 text-indigo-700",
      UNDER_REVIEW: "bg-orange-100 text-orange-700",
      REVISION_REQUIRED: "bg-yellow-100 text-yellow-700",
      REVISED_SUBMITTED: "bg-amber-100 text-amber-700",
      ACCEPTED: "bg-emerald-100 text-emerald-700",
      REJECTED: "bg-red-100 text-red-700",
      PUBLISHED: "bg-green-100 text-green-700",
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold ${maps[status] || "bg-slate-100 text-slate-700"}`;
  };

  const formatStatus = (status: string) => status.replace(/_/g, " ");

  // Only show actionable submissions (exclude DRAFT, PUBLISHED, REJECTED)
  const actionableStatuses = ["SUBMITTED", "INITIAL_SCREENING", "UNDER_REVIEW", "REVISION_REQUIRED", "REVISED_SUBMITTED", "ACCEPTED"];
  const actionableSubmissions = submissions.filter((s) =>
    actionableStatuses.includes(s.status)
  );

  const filteredSubmissions = actionableSubmissions.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.paperId?.toLowerCase().includes(search.toLowerCase())
  );

  const statusTransitions: Record<string, string[]> = {
    SUBMITTED: ["INITIAL_SCREENING", "REJECTED"],
    INITIAL_SCREENING: ["UNDER_REVIEW", "REJECTED"],
    UNDER_REVIEW: ["REVISION_REQUIRED", "ACCEPTED", "REJECTED"],
    REVISION_REQUIRED: ["UNDER_REVIEW", "REJECTED"],
    REVISED_SUBMITTED: ["UNDER_REVIEW", "ACCEPTED", "REJECTED"],
    ACCEPTED: ["PUBLISHED"],
  };

  const openDecisionModal = async (submission: any) => {
    setSelectedSubmission(submission);
    const availableStatuses = statusTransitions[submission.status] || [];
    setNewStatus(availableStatuses[0] || "INITIAL_SCREENING");
    setRemarks("");
    setDecisionError("");
    setStatusHistory([]);
    setReviews([]);

    // Fetch status history
    try {
      const [historyRes, reviewsRes] = await Promise.all([
        api.get(`/editorial-decisions/${submission.id}/history`),
        api.get(`/submissions/${submission.id}/reviews`).catch(() => ({ success: false, data: [] })),
      ]);
      if (historyRes.success && historyRes.data) setStatusHistory(historyRes.data);
      if (reviewsRes.success && reviewsRes.data) setReviews(reviewsRes.data);
    } catch (err: any) {
      console.error("Failed to fetch status history:", err);
    }
  };

  const handleMakeDecision = async () => {
    if (!selectedSubmission) return;

    setDecisionLoading(true);
    setDecisionError("");

    try {
      const res = await api.patch(`/editorial-decisions/${selectedSubmission.id}/decision`, {
        status: newStatus,
        remarks: remarks || undefined,
      });

      if (!res.success) throw new Error(res.message);

      setSelectedSubmission(null);
      fetchSubmissions(); // Refresh list
    } catch (err: any) {
      setDecisionError(err.message || "Failed to record decision");
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editorial Decisions</h1>
        <p className="text-slate-500 mt-1">
          Make editorial decisions on manuscript submissions.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search submissions..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0B8A83] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-8 text-center flex flex-col items-center text-red-500">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p>{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Paper ID</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Journal</th>
                  <th className="p-4 font-semibold">Current Status</th>
                  <th className="p-4 font-semibold">Submitted</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
                      </div>
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <CheckSquare size={48} className="mx-auto mb-4 text-slate-300" />
                      No submissions awaiting editorial decision.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, index) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{sub.paperId}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 max-w-xs truncate">{sub.title}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {sub.journal?.shortName || "—"}
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadgeClass(sub.status)}>{formatStatus(sub.status)}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openDecisionModal(sub)}
                          className="px-4 py-2 bg-[#0B8A83] text-white hover:bg-[#09756f] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <CheckSquare size={14} /> Decide
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Editorial Decision</h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-md truncate">
                    {selectedSubmission.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {decisionError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    {decisionError}
                  </div>
                )}

                {/* Current Status */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Status</p>
                  <span className={getStatusBadgeClass(selectedSubmission.status)}>
                    {formatStatus(selectedSubmission.status)}
                  </span>
                </div>

                {/* Status History */}
                {statusHistory.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status History</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {statusHistory.map((h: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm p-2 bg-slate-50 rounded-lg">
                          <span className={getStatusBadgeClass(h.status || h.newStatus)}>
                            {formatStatus(h.status || h.newStatus)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(h.changedAt).toLocaleDateString()}
                          </span>
                          {h.remarks && (
                            <span className="text-xs text-slate-400 truncate max-w-[200px]">— {h.remarks}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {reviews.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Reviewer Reviews
                    </p>
                    <div className="space-y-3">
                      {reviews.map((rv: any, i: number) => (
                        <div key={rv.id || i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {rv.submissionReviewer?.reviewer?.fullName || "Reviewer"}
                            </p>
                            <div className="flex items-center gap-2">
                              {rv.recommendation && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${recommendationLabels[rv.recommendation]?.color || "bg-slate-100 text-slate-700"}`}>
                                  {recommendationLabels[rv.recommendation]?.label || rv.recommendation}
                                </span>
                              )}
                              {rv.overallRating && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                                  {rv.overallRating}/5
                                </span>
                              )}
                            </div>
                          </div>
                          {rv.commentsToAuthor && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-1">Comments to Author</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{rv.commentsToAuthor}</p>
                            </div>
                          )}
                          {rv.commentsToEditor && (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                              <p className="text-xs font-semibold text-amber-700 mb-1">
                                Confidential Comments to Editor
                              </p>
                              <p className="text-sm text-amber-900 leading-relaxed">{rv.commentsToEditor}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Decision */}
                <div className="pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">New Status *</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] bg-white transition-all"
                    >
                      {(statusTransitions[selectedSubmission.status] || []).map((s) => (
                        <option key={s} value={s}>
                          {formatStatus(s)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Remarks</label>
                    <textarea
                      rows={4}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Provide any notes or reasons for this decision..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={decisionLoading}
                    onClick={handleMakeDecision}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={16} />
                    {decisionLoading ? "Processing..." : "Record Decision"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
