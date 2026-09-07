"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, AlertCircle, Eye, Download, Send, UploadCloud, Users, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { getMySubmissions, SubmissionModel, transitionSubmissionStatus, uploadManuscript, requestReviewer } from "@/lib/api/submissions";
import { fetchProtectedFile, downloadProtectedFile } from "@/lib/api/client";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Manuscript preview modal state
  const [previewSub, setPreviewSub] = useState<SubmissionModel | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");

  // Upload manuscript modal state
  const [uploadingSubId, setUploadingSubId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleSubmitPaper = async (sub: SubmissionModel) => {
    if (!sub.files || sub.files.length === 0) {
      setUploadingSubId(sub.id);
      setSelectedFile(null);
      setUploadError("");
      return;
    }

    try {
      setLoading(true);
      const res = await transitionSubmissionStatus(sub.id, "SUBMITTED");
      if (res.success) {
        const reloadRes = await getMySubmissions();
        if (reloadRes.success && reloadRes.data) {
          setSubmissions(reloadRes.data);
        }
      } else {
        alert(res.message || "Failed to submit paper");
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit paper");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReviewer = async (subId: string) => {
    try {
      setLoading(true);
      const res = await requestReviewer(subId);
      if (res.success) {
        const reloadRes = await getMySubmissions();
        if (reloadRes.success && reloadRes.data) {
          setSubmissions(reloadRes.data);
        }
      } else {
        alert(res.message || "Failed to request reviewer");
      }
    } catch (err: any) {
      alert(err.message || "Failed to request reviewer");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndSubmit = async () => {
    if (!uploadingSubId || !selectedFile) return;

    setUploadLoading(true);
    setUploadError("");

    try {
      const uploadRes = await uploadManuscript(uploadingSubId, selectedFile);
      if (!uploadRes.success) {
        throw new Error(uploadRes.message || "File upload failed.");
      }

      const statusRes = await transitionSubmissionStatus(uploadingSubId, "SUBMITTED");
      if (!statusRes.success) {
        throw new Error(statusRes.message || "File uploaded, but status transition failed.");
      }

      setUploadingSubId(null);
      setSelectedFile(null);

      const reloadRes = await getMySubmissions();
      if (reloadRes.success && reloadRes.data) {
        setSubmissions(reloadRes.data);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload and submit.");
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await getMySubmissions();
        if (res.success && res.data) {
          setSubmissions(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
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

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.paperId.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (subId: string) => {
    downloadProtectedFile(`/submissions/${subId}/download`);
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Submissions</h1>
          <p className="text-slate-500 mt-1">Track all your manuscript submissions.</p>
        </div>
        <Link
          href="/dashboard/submissions/new"
          className="flex items-center gap-2 bg-[#0B8A83] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#09756f] transition-colors shadow-sm"
        >
          <FileText size={18} /> New Submission
        </Link>
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
              placeholder="Search by title or paper ID..."
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
                      <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                      {search ? "No submissions match your search." : "No submissions yet. Submit your first paper!"}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub, index) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{sub.paperId}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 max-w-xs truncate">{sub.title}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600">{sub.journal.shortName}</p>
                      </td>
                      <td className="p-4">
                        <span className={getStatusBadgeClass(sub.status)}>{formatStatus(sub.status)}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {sub.status === "DRAFT" && (
                            <button
                              onClick={() => handleSubmitPaper(sub)}
                              className="px-3 py-1.5 bg-[#0B8A83] text-white hover:bg-[#09756f] rounded-lg text-xs font-semibold flex items-center gap-1"
                              title="Submit for Review"
                            >
                              <Send size={12} /> Submit
                            </button>
                          )}

                          {(sub.status === "SUBMITTED" || sub.status === "INITIAL_SCREENING") && !sub.reviewerRequested && (
                            <button
                              onClick={() => handleRequestReviewer(sub.id)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                              title="Request Reviewer Assignment"
                            >
                              <Users size={12} /> Request Reviewer
                            </button>
                          )}

                          {(sub.status === "SUBMITTED" || sub.status === "INITIAL_SCREENING") && sub.reviewerRequested && (
                            <span className="px-2.5 py-1 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Requested
                            </span>
                          )}

                          {sub.files && sub.files.length > 0 && (
                            <>
                              <button
                                onClick={() => setPreviewSub(sub)}
                                className="p-2 text-[#0B8A83] hover:bg-teal-50 rounded-lg transition-colors"
                                title="Preview Manuscript"
                              >
                                <Eye size={16} />
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

      {/* Upload File and Submit Modal */}
      {uploadingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-100 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">Upload Manuscript</h3>
              <button onClick={() => setUploadingSubId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                {uploadError}
              </div>
            )}

            <p className="text-sm text-slate-500">
              Please upload your research paper manuscript (.pdf, .docx, or .doc) to submit it for review.
            </p>

            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center text-center">
              <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-[#0B8A83]">Choose file</span>
              <span className="text-[10px] text-slate-500 mt-1">PDF, DOCX up to 10MB</span>
              {selectedFile && (
                <span className="mt-2 text-xs font-bold text-teal-600 truncate max-w-full px-2">
                  Selected: {selectedFile.name}
                </span>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setUploadingSubId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || uploadLoading}
                onClick={handleUploadAndSubmit}
                className="px-4 py-2 rounded-xl bg-[#0B8A83] text-white hover:bg-[#09756f] transition-all text-sm font-semibold disabled:opacity-50"
              >
                {uploadLoading ? "Uploading..." : "Upload & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
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
