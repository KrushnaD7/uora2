"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, X, Send, Star, AlertCircle, Eye } from "lucide-react";
import { api, fetchProtectedFile, downloadProtectedFile } from "@/lib/api/client";

export default function PendingReviewsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewSub, setPreviewSub] = useState<any | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");

  // Review form state
  const [reviewingAssignment, setReviewingAssignment] = useState<any | null>(null);
  const [recommendation, setRecommendation] = useState<string>("ACCEPT");
  const [overallRating, setOverallRating] = useState<number>(3);
  const [commentsToAuthor, setCommentsToAuthor] = useState("");
  const [commentsToEditor, setCommentsToEditor] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/reviewers/my/assignments");
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch assignments");
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

  const pending = assignments.filter(
    (a) => a.status === "PENDING" || a.status === "ACCEPTED"
  );

  const handleDownload = (subId: string) => {
    downloadProtectedFile(`/submissions/${subId}/download`);
  };

  const openReviewForm = (assignment: any) => {
    setReviewingAssignment(assignment);
    setRecommendation("ACCEPT");
    setOverallRating(3);
    setCommentsToAuthor("");
    setCommentsToEditor("");
    setSubmitError("");
  };

  const handleSubmitReview = async () => {
    if (!reviewingAssignment) return;

    setSubmitLoading(true);
    setSubmitError("");

    try {
      const res = await api.post("/reviews", {
        submissionReviewerId: reviewingAssignment.id,
        recommendation,
        overallRating,
        commentsToAuthor: commentsToAuthor || undefined,
        commentsToEditor: commentsToEditor || undefined,
      });

      if (!res.success) throw new Error(res.message);

      setReviewingAssignment(null);
      fetchAssignments(); // Refresh the list
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  const recommendationLabels: Record<string, { label: string; color: string }> = {
    ACCEPT: { label: "Accept", color: "bg-green-100 text-green-700 border-green-200" },
    MINOR_REVISION: { label: "Minor Revision", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    MAJOR_REVISION: { label: "Major Revision", color: "bg-orange-100 text-orange-700 border-orange-200" },
    REJECT: { label: "Reject", color: "bg-red-100 text-red-700 border-red-200" },
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pending Reviews</h1>
        <p className="text-slate-500 mt-1">
          Review assigned manuscripts and submit your evaluations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                  <th className="p-4 font-semibold">Paper</th>
                  <th className="p-4 font-semibold">Journal</th>
                  <th className="p-4 font-semibold">Assigned</th>
                  <th className="p-4 font-semibold">Deadline</th>
                  <th className="p-4 font-semibold">Status</th>
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
                ) : pending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Search size={48} className="mx-auto mb-4 text-slate-300" />
                      No pending reviews at the moment.
                    </td>
                  </tr>
                ) : (
                  pending.map((a, index) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 max-w-xs truncate">
                          {a.submission?.title || "Untitled"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: {a.submission?.paperId}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {a.submission?.journal?.name || "—"}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {a.deadline
                          ? new Date(a.deadline).toLocaleDateString()
                          : "No deadline"}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setPreviewSub(a.submission || { id: a.submissionId })}
                            className="p-2 border border-slate-100 hover:border-slate-200 rounded-xl text-slate-700 bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
                            title="Preview Manuscript"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={() => handleDownload(a.submission?.id || a.submissionId)}
                            className="p-2 border border-slate-100 hover:border-slate-200 rounded-xl text-slate-700 bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
                            title="Download Manuscript"
                          >
                            <Download size={14} /> File
                          </button>
                          <button
                            onClick={() => openReviewForm(a)}
                            className="px-3.5 py-2 bg-[#0B8A83] text-white hover:bg-[#09756f] rounded-xl text-xs font-semibold"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {reviewingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Submit Review</h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-md truncate">
                    {reviewingAssignment.submission?.title}
                  </p>
                </div>
                <button
                  onClick={() => setReviewingAssignment(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    {submitError}
                  </div>
                )}

                {/* Recommendation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Recommendation *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(recommendationLabels).map(([key, { label, color }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setRecommendation(key)}
                        className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          recommendation === key
                            ? `${color} border-current`
                            : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Overall Rating (1–5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setOverallRating(num)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                          overallRating >= num
                            ? "bg-yellow-100 border-yellow-300 text-yellow-600"
                            : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        <Star size={20} fill={overallRating >= num ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments to Author */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Comments to Author
                  </label>
                  <textarea
                    rows={4}
                    value={commentsToAuthor}
                    onChange={(e) => setCommentsToAuthor(e.target.value)}
                    placeholder="Your feedback for the author(s)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all resize-none"
                  />
                </div>

                {/* Comments to Editor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Confidential Comments to Editor
                  </label>
                  <textarea
                    rows={3}
                    value={commentsToEditor}
                    onChange={(e) => setCommentsToEditor(e.target.value)}
                    placeholder="Private notes visible only to the editor..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReviewingAssignment(null)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitLoading}
                    onClick={handleSubmitReview}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={16} />
                    {submitLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <p className="text-sm text-slate-500 mt-0.5 max-w-xl truncate">{previewSub.title || "Untitled"}</p>
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

              <div className="p-4 border-t border-slate-100 flex justify-end items-center shrink-0">
                <button
                  onClick={() => downloadProtectedFile(`/submissions/${previewSub.id}/download`, previewSub.title)}
                  className="flex items-center gap-2 text-sm font-medium text-[#0B8A83] hover:underline"
                >
                  <Download size={16} /> Download Manuscript
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
