"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Search, AlertCircle, Eye, Download, X } from "lucide-react";

import { api, fetchProtectedFile, downloadProtectedFile } from "@/lib/api/client";

export default function ReviewerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewApp, setPreviewApp] = useState<any | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>("");

  const fetchApplications = async () => {
    try {
      const data = await api.get("/reviewers/applications");
      if (data.success && data.data) {
        setApplications(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (!previewApp) {
      setPreviewFileUrl("");
      return;
    }
    let cancelled = false;
    fetchProtectedFile(`/reviewers/applications/${previewApp.id}/cv`)
      .then((result) => {
        if (!cancelled) setPreviewFileUrl(result.url);
      })
      .catch(() => {
        if (!cancelled) setPreviewFileUrl("");
      });
    return () => { cancelled = true; };
  }, [previewApp]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (!window.confirm(`Are you sure you want to ${action} this application?`)) return;
    
    try {
      const data = await api.post(`/reviewers/applications/${id}/${action}`);
      if (!data.success) throw new Error(data.message);
      
      alert(data.message + (data.data?.tempPassword ? `\n\nTemporary Password generated: ${data.data.tempPassword}` : ""));
      setPreviewApp(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} application`);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reviewer Applications</h1>
          <p className="text-slate-500 mt-1">Review applicant CVs and approve new reviewers.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search applications..." 
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
                  <th className="p-4 font-semibold">Applicant</th>
                  <th className="p-4 font-semibold">Expertise & Journal</th>
                  <th className="p-4 font-semibold">CV File</th>
                  <th className="p-4 font-semibold">Applied Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading applications...</td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No pending applications.</td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{app.fullName}</p>
                        <p className="text-sm text-slate-500">{app.email}</p>
                        <p className="text-xs text-slate-400 mt-1">{app.designation} at {app.institution}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-700">{app.expertise}</p>
                        <p className="text-sm text-slate-500">For: {app.journal?.name}</p>
                      </td>
                      <td className="p-4">
                        {app.cvFile ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewApp(app)}
                              className="flex items-center gap-1.5 text-sm font-medium text-[#0B8A83] hover:underline"
                            >
                              <Eye size={16} /> Preview
                            </button>
                            <button
                              onClick={() => downloadProtectedFile(`/reviewers/applications/${app.id}/cv`, `${app.fullName}-cv`)}
                              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B8A83]"
                              title="Download CV"
                            >
                              <Download size={14} /> CV
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No CV</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleAction(app.id, "approve")}
                          className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium text-sm mr-2 inline-flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(app.id, "reject")}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-1"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CV Preview Modal */}
      <AnimatePresence>
        {previewApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">CV Preview</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {previewApp.fullName} — {previewApp.designation || "Reviewer"} at {previewApp.institution || "—"}
                  </p>
                </div>
                <button onClick={() => setPreviewApp(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <iframe
                src={previewFileUrl}
                title="CV Preview"
                className="w-full flex-1 min-h-[62vh] border-0 bg-slate-100"
              />

              <div className="p-4 border-t border-slate-100 flex justify-between items-center shrink-0">
                <button
                  onClick={() => downloadProtectedFile(`/reviewers/applications/${previewApp.id}/cv`, `${previewApp.fullName}-cv`)}
                  className="flex items-center gap-2 text-sm font-medium text-[#0B8A83] hover:underline"
                >
                  <Download size={16} /> Download CV
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(previewApp.id, "reject")}
                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-1"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(previewApp.id, "approve")}
                    className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-1"
                  >
                    <CheckCircle size={14} /> Approve
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
