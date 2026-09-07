"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, AlertCircle, Plus, X, Trash2, Calendar, Check } from "lucide-react";
import { api } from "@/lib/api/client";

export default function AssignReviewersPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Assignment modal state
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [assignedReviewers, setAssignedReviewers] = useState<any[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [editingDeadlineValue, setEditingDeadlineValue] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [subsRes, revRes] = await Promise.all([
          api.get("/submissions"),
          api.get("/reviewers"),
        ]);
        if (subsRes.success && subsRes.data) {
          setSubmissions(subsRes.data);
        }
        if (revRes.success && revRes.data) {
          setReviewers(revRes.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const reviewableStatuses = ["SUBMITTED", "INITIAL_SCREENING", "UNDER_REVIEW", "REVISED_SUBMITTED"];
  const reviewableSubmissions = submissions.filter((s) =>
    reviewableStatuses.includes(s.status)
  );

  const filteredSubmissions = reviewableSubmissions
    .filter(
      (s) =>
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.paperId?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aReq = a.reviewerRequested ? 1 : 0;
      const bReq = b.reviewerRequested ? 1 : 0;
      return bReq - aReq; // sort requested to the top
    });

  const openAssignModal = async (submission: any) => {
    setSelectedSubmission(submission);
    setAssignedReviewers([]);
    setSelectedReviewerId("");
    setDeadline("");
    setAssignError("");

    // Fetch current reviewers for this submission
    try {
      const res = await api.get(`/submissions/${submission.id}/reviewers`);
      if (res.success && res.data) {
        setAssignedReviewers(res.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch assigned reviewers:", err);
    }
  };

  const handleAssign = async () => {
    if (!selectedReviewerId || !selectedSubmission) return;

    setAssignLoading(true);
    setAssignError("");

    try {
      const res = await api.post(`/submissions/${selectedSubmission.id}/reviewers`, {
        reviewerId: selectedReviewerId,
        deadline: deadline || undefined,
      });

      if (!res.success) throw new Error(res.message);

      // Refresh assigned reviewers
      const refreshRes = await api.get(`/submissions/${selectedSubmission.id}/reviewers`);
      if (refreshRes.success && refreshRes.data) {
        setAssignedReviewers(refreshRes.data);
      }

      setSelectedReviewerId("");
      setDeadline("");
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign reviewer");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!window.confirm("Remove this reviewer assignment?")) return;

    try {
      await api.delete(`/submissions/assignments/${assignmentId}`);

      // Refresh
      if (selectedSubmission) {
        const res = await api.get(`/submissions/${selectedSubmission.id}/reviewers`);
        if (res.success && res.data) {
          setAssignedReviewers(res.data);
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove assignment");
    }
  };

  const handleUpdateDeadline = async (assignmentId: string) => {
    try {
      const res = await api.patch(`/submissions/assignments/${assignmentId}`, {
        deadline: editingDeadlineValue || null,
      });
      if (!res.success) throw new Error(res.message);

      // Refresh
      if (selectedSubmission) {
        const refreshRes = await api.get(`/submissions/${selectedSubmission.id}/reviewers`);
        if (refreshRes.success && refreshRes.data) {
          setAssignedReviewers(refreshRes.data);
        }
      }
      setEditingDeadlineId(null);
      setEditingDeadlineValue("");
    } catch (err: any) {
      alert(err.message || "Failed to update deadline");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const maps: Record<string, string> = {
      SUBMITTED: "bg-blue-100 text-blue-700",
      INITIAL_SCREENING: "bg-indigo-100 text-indigo-700",
      UNDER_REVIEW: "bg-orange-100 text-orange-700",
      REVISED_SUBMITTED: "bg-amber-100 text-amber-700",
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold ${maps[status] || "bg-slate-100 text-slate-700"}`;
  };

  const formatStatus = (status: string) => status.replace(/_/g, " ");

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assign Reviewers</h1>
        <p className="text-slate-500 mt-1">
          Assign peer reviewers to submissions that need evaluation.
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
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
                      </div>
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <Users size={48} className="mx-auto mb-4 text-slate-300" />
                      No submissions currently need reviewer assignment.
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
                        {sub.reviewerRequested && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            Reviewer Requested
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {sub.journal?.shortName || "—"}
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadgeClass(sub.status)}>{formatStatus(sub.status)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openAssignModal(sub)}
                          className="px-4 py-2 bg-[#0B8A83] text-white hover:bg-[#09756f] rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Users size={14} /> Assign
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

      {/* Assign Reviewer Modal */}
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
                  <h2 className="text-xl font-bold text-slate-900">Assign Reviewers</h2>
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
                {assignError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    {assignError}
                  </div>
                )}

                {/* Current Assigned Reviewers */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Currently Assigned</h3>
                  {assignedReviewers.length === 0 ? (
                    <div className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                      No reviewers assigned yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assignedReviewers.map((ar) => (
                        <div
                          key={ar.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm">
                              {ar.reviewer?.fullName || "Reviewer"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {ar.reviewer?.email} {ar.reviewer?.expertise ? `• ${ar.reviewer.expertise}` : ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              Status: <span className="font-semibold">{ar.status}</span>
                            </p>
                            {editingDeadlineId === ar.id ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="date"
                                  value={editingDeadlineValue}
                                  onChange={(e) => setEditingDeadlineValue(e.target.value)}
                                  className="h-8 px-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-[#0B8A83]"
                                />
                                <button
                                  onClick={() => handleUpdateDeadline(ar.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => { setEditingDeadlineId(null); setEditingDeadlineValue(""); }}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingDeadlineId(ar.id);
                                  setEditingDeadlineValue(ar.deadline ? new Date(ar.deadline).toISOString().split("T")[0] : "");
                                }}
                                className="flex items-center gap-1 mt-1 text-xs text-slate-500 hover:text-[#0B8A83] transition-colors cursor-pointer"
                              >
                                <Calendar size={12} />
                                {ar.deadline ? `Deadline: ${new Date(ar.deadline).toLocaleDateString()}` : "No deadline — click to set"}
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(ar.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Reviewer */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Reviewer</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Select Reviewer *</label>
                      <select
                        value={selectedReviewerId}
                        onChange={(e) => setSelectedReviewerId(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] bg-white transition-all text-sm"
                      >
                        <option value="">— Select a reviewer —</option>
                        {reviewers
                          .filter((r) => !assignedReviewers.some((ar) => ar.reviewerId === r.id))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.fullName} ({r.email}){r.expertise ? ` — ${r.expertise}` : ""}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Deadline (Optional)</label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] transition-all text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!selectedReviewerId || assignLoading}
                      onClick={handleAssign}
                      className="w-full h-12 rounded-xl font-medium text-white bg-[#0B8A83] hover:bg-[#09756f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      {assignLoading ? "Assigning..." : "Assign Reviewer"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
