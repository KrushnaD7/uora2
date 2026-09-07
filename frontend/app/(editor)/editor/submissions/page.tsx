"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertCircle,
  Files,
  Eye,
  Download,
  Users,
  CheckSquare,
  X,
  FileText,
  User,
  Mail,
  Calendar,
  FileSearch,
  Star,
} from "lucide-react";
import { api, fetchProtectedFile, downloadProtectedFile } from "@/lib/api/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EditorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin" : "/editor";

  // Detail modal state
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [assignedReviewers, setAssignedReviewers] = useState<any[]>([]);
  const [submissionReviews, setSubmissionReviews] = useState<any[]>([]);

  // Manuscript preview modal state
  const [previewSub, setPreviewSub] = useState<any | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");

  useEffect(() => {
    async function fetchSubmissions() {
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
    }
    fetchSubmissions();
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

  const recommendationLabels: Record<string, { label: string; color: string }> = {
    ACCEPT: { label: "Accept", color: "bg-green-100 text-green-700 border-green-200" },
    MINOR_REVISION: { label: "Minor Revision", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    MAJOR_REVISION: { label: "Major Revision", color: "bg-orange-100 text-orange-700 border-orange-200" },
    REJECT: { label: "Reject", color: "bg-red-100 text-red-700 border-red-200" },
  };

  const allStatuses = [
    "ALL", "SUBMITTED", "INITIAL_SCREENING", "UNDER_REVIEW",
    "REVISION_REQUIRED", "REVISED_SUBMITTED", "ACCEPTED", "REJECTED", "PUBLISHED",
  ];

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.paperId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (subId: string) => {
    downloadProtectedFile(`/submissions/${subId}/download`);
  };

  const openDetailModal = async (sub: any) => {
    setSelectedSubmission(sub);
    setDetailLoading(true);
    setDetailData(null);
    setStatusHistory([]);
    setAssignedReviewers([]);
    setSubmissionReviews([]);

    try {
      const [detailRes, historyRes, reviewersRes, reviewsRes] = await Promise.all([
        api.get(`/submissions/${sub.id}`),
        api.get(`/editorial-decisions/${sub.id}/history`).catch(() => ({ success: false, data: [] })),
        api.get(`/submissions/${sub.id}/reviewers`).catch(() => ({ success: false, data: [] })),
        api.get(`/submissions/${sub.id}/reviews`).catch(() => ({ success: false, data: [] })),
      ]);

      if (detailRes.success && detailRes.data) setDetailData(detailRes.data);
      if (historyRes.success && historyRes.data) setStatusHistory(historyRes.data);
      if (reviewersRes.success && reviewersRes.data) setAssignedReviewers(reviewersRes.data);
      if (reviewsRes.success && reviewsRes.data) setSubmissionReviews(reviewsRes.data);
    } catch (err: any) {
      console.error("Failed to fetch submission details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const canDecide = (status: string) =>
    ["SUBMITTED", "INITIAL_SCREENING", "UNDER_REVIEW", "REVISION_REQUIRED", "REVISED_SUBMITTED", "ACCEPTED"].includes(status);

  const canAssign = (status: string) =>
    ["SUBMITTED", "INITIAL_SCREENING", "UNDER_REVIEW", "REVISED_SUBMITTED"].includes(status);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Submissions</h1>
        <p className="text-slate-500 mt-1">View and manage all manuscript submissions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or paper ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0B8A83] transition-colors text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0B8A83] text-sm"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "All Statuses" : formatStatus(s)}
              </option>
            ))}
          </select>
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
                  <th className="p-4 font-semibold">Status</th>
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
                      <Files size={48} className="mx-auto mb-4 text-slate-300" />
                      No submissions found.
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
                        <p className="text-xs text-slate-500 mt-0.5">{sub.correspondingEmail}</p>
                        {sub.reviewerRequested && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Reviewer Requested
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {sub.journal?.shortName || sub.journal?.name || "—"}
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadgeClass(sub.status)}>{formatStatus(sub.status)}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openDetailModal(sub)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {sub.files && sub.files.length > 0 && (
                            <>
                              <button
                                onClick={() => setPreviewSub(sub)}
                                className="p-2 text-[#0B8A83] hover:bg-teal-50 rounded-lg transition-colors"
                                title="Preview Manuscript"
                              >
                                <FileSearch size={16} />
                              </button>
                              <button
                                onClick={() => handleDownload(sub.id)}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Download Manuscript"
                              >
                                <Download size={16} />
                              </button>
                            </>
                          )}
                          {canDecide(sub.status) && (
                            <Link
                              href={`${basePath}/decisions`}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Make Decision"
                            >
                              <CheckSquare size={16} />
                            </Link>
                          )}
                          {canAssign(sub.status) && (
                            <Link
                              href={`${basePath}/assign`}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Assign Reviewers"
                            >
                              <Users size={16} />
                            </Link>
                          )}
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

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start p-6 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {selectedSubmission.paperId}
                    </span>
                    <span className={getStatusBadgeClass(selectedSubmission.status)}>
                      {formatStatus(selectedSubmission.status)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedSubmission.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">Journal: {selectedSubmission.journal?.name || "—"}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors ml-4 mt-1"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {detailLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
                  </div>
                ) : (
                  <>
                    {/* Abstract */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Abstract</h3>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {detailData?.abstract || selectedSubmission.abstract || "No abstract available."}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Mail size={16} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Corresponding Email</p>
                          <p className="text-sm text-slate-700">{selectedSubmission.correspondingEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Submitted On</p>
                          <p className="text-sm text-slate-700">
                            {new Date(selectedSubmission.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Authors */}
                    {detailData?.authors && detailData.authors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Authors</h3>
                        <div className="space-y-2">
                          {detailData.authors.map((a: any, i: number) => (
                            <div key={a.id || i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <User size={16} className="text-slate-400" />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {a.author?.fullName || "—"}
                                  {a.isCorresponding && (
                                    <span className="ml-2 text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Corresponding</span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {a.author?.institution || ""} {a.author?.email ? `• ${a.author.email}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Files */}
                    {detailData?.files && detailData.files.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Files</h3>
                        <div className="space-y-2">
                          {detailData.files.map((f: any, i: number) => (
                            <div key={f.id || i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                <FileText size={16} className="text-slate-400" />
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{f.originalName}</p>
                                  <p className="text-xs text-slate-500">
                                    {f.fileType} • {f.fileSize ? `${(f.fileSize / 1024).toFixed(1)} KB` : "—"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setPreviewSub(selectedSubmission)}
                                  className="p-2 text-[#0B8A83] hover:bg-teal-50 rounded-lg transition-colors"
                                  title="View Manuscript"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDownload(selectedSubmission.id)}
                                  className="p-2 text-[#0B8A83] hover:bg-teal-50 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Reviewers */}
                    {assignedReviewers.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Assigned Reviewers</h3>
                        <div className="space-y-2">
                          {assignedReviewers.map((ar: any, i: number) => (
                            <div key={ar.id || i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <Users size={16} className="text-indigo-400" />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{ar.reviewer?.fullName || "Reviewer"}</p>
                                <p className="text-xs text-slate-500">
                                  Status: <span className="font-semibold">{ar.status}</span>
                                  {ar.deadline && ` • Deadline: ${new Date(ar.deadline).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reviews */}
                    {submissionReviews.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Reviewer Reviews
                        </h3>
                        <div className="space-y-3">
                          {submissionReviews.map((rv: any, i: number) => (
                            <div key={rv.id || i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
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
                                      {rv.overallRating}/10
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

                    {/* Status History */}
                    {statusHistory.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Status History</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {statusHistory.map((h: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className={getStatusBadgeClass(h.status || h.newStatus)}>
                                {formatStatus(h.status || h.newStatus)}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(h.changedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                              {h.remarks && (
                                <span className="text-xs text-slate-400 truncate max-w-[200px]">— {h.remarks}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end p-6 border-t border-slate-100 bg-slate-50/50">
                {canAssign(selectedSubmission.status) && (
                  <Link
                    href={`${basePath}/assign`}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Users size={16} /> Assign Reviewers
                  </Link>
                )}
                {canDecide(selectedSubmission.status) && (
                  <Link
                    href={`${basePath}/decisions`}
                    className="px-5 py-2.5 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <CheckSquare size={16} /> Make Decision
                  </Link>
                )}
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manuscript Preview Modal */}
      {previewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900">Manuscript Preview</h2>
                <p className="text-sm text-slate-500 mt-0.5 truncate">
                  {previewSub.title} • {previewSub.paperId}
                </p>
              </div>
              <button
                onClick={() => setPreviewSub(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors ml-4"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-6 bg-slate-100">
              <iframe
                src={previewFileUrl}
                title="Manuscript Preview"
                className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="flex gap-3 justify-end p-4 border-t border-slate-100">
              <button
                onClick={() => downloadProtectedFile(`/submissions/${previewSub.id}/download`, previewSub.title)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-[#0B8A83] hover:bg-teal-50 border border-[#0B8A83]/20 transition-colors text-sm"
              >
                <Download size={16} /> Download Manuscript
              </button>
              <button
                onClick={() => setPreviewSub(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
