"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/client";
import { 
  ArrowLeft, Plus, Book, FileText, LayoutTemplate, 
  X, CheckCircle2, ChevronRight, AlertCircle, FileLock2, Globe, FileIcon, Eye, Download
} from "lucide-react";
import Link from "next/link";

const API_URL = "/api";

interface Article {
  id: string;
  title: string;
  doi: string | null;
  pages: string | null;
  pdfUrl: string | null;
  publishedAt: string;
}

interface Issue {
  id: string;
  issueNumber: number;
  title: string | null;
  status: "UPCOMING" | "PUBLISHED";
  publishedAt: string | null;
  articles: Article[];
}

interface Volume {
  id: string;
  volumeNumber: number;
  year: number;
  issues: Issue[];
}

interface Journal {
  id: string;
  name: string;
  shortName: string;
}

export default function JournalWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id: journalId } = unwrappedParams;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<"VOLUME" | "ISSUE" | "ARTICLE" | null>(null);
  const [modalTargetId, setModalTargetId] = useState<string | null>(null); // For VolumeId or IssueId
  const [modalLoading, setModalLoading] = useState(false);

  // Form States
  const [volumeForm, setVolumeForm] = useState({ year: new Date().getFullYear(), volumeNumber: 1 });
  const [issueForm, setIssueForm] = useState({ issueNumber: 1, title: "", status: "UPCOMING" as const });
  const [articleForm, setArticleForm] = useState({ submissionId: "", title: "", doi: "", pages: "", scheduledPublishAt: "" });

  // Accepted-submission picker state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [subSearch, setSubSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [jRes, vRes] = await Promise.all([
        api.get(`/journals/${journalId}`),
        api.get(`/volumes/journal/${journalId}`)
      ]);
      if (jRes.success) setJournal(jRes.data.data || jRes.data);
      if (vRes.success) setVolumes(vRes.data.data || vRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [journalId]);

  // Modals Openers with Auto-Increment Logic
  const openVolumeModal = () => {
    const nextVolNumber = volumes.length > 0 ? Math.max(...volumes.map(v => v.volumeNumber)) + 1 : 1;
    setVolumeForm({ year: new Date().getFullYear(), volumeNumber: nextVolNumber });
    setActiveModal("VOLUME");
  };

  const openIssueModal = (volume: Volume) => {
    const nextIssueNum = volume.issues.length > 0 ? Math.max(...volume.issues.map(i => i.issueNumber)) + 1 : 1;
    setIssueForm({ issueNumber: nextIssueNum, title: "", status: "UPCOMING" });
    setModalTargetId(volume.id);
    setActiveModal("ISSUE");
  };

  const openArticleModal = async (issueId: string) => {
    setArticleForm({ submissionId: "", title: "", doi: "", pages: "", scheduledPublishAt: "" });
    setSelectedSubmission(null);
    setSubSearch("");
    setPickerOpen(false);
    setModalTargetId(issueId);
    setActiveModal("ARTICLE");
    try {
      const res = await api.get("/submissions");
      setSubmissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSubmissions([]);
    }
  };

  const availableSubs = submissions.filter(
    (s: any) =>
      s.journalId === journalId &&
      s.status === "ACCEPTED" &&
      (s.title?.toLowerCase().includes(subSearch.toLowerCase()) ||
        s.paperId?.toLowerCase().includes(subSearch.toLowerCase()))
  );

  const selectSubmission = (s: any) => {
    setSelectedSubmission(s);
    setArticleForm((f) => ({ ...f, submissionId: s.id, title: s.title }));
    setPickerOpen(false);
    setSubSearch("");
  };

  const formatAuthors = (s: any) =>
    s.authors?.map((a: any) => a.author?.fullName).filter(Boolean).join(", ") || "—";

  const handleCreateVolume = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.post("/volumes", { journalId, ...volumeForm });
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error creating volume");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await api.post("/issues", { 
        journalId, 
        volumeId: modalTargetId, 
        ...issueForm 
      });
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error creating issue");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload: any = {
        journalId,
        issueId: modalTargetId,
        submissionId: articleForm.submissionId,
        title: articleForm.title,
        doi: articleForm.doi,
        pages: articleForm.pages,
      };
      if (articleForm.scheduledPublishAt) {
        payload.scheduledPublishAt = new Date(articleForm.scheduledPublishAt).toISOString();
      }
      await api.post("/articles/publish", payload);
      setActiveModal(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error creating article");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center text-slate-500">Loading Workspace...</div>;
  }

  const selectedIssue = volumes.flatMap(v => v.issues).find(i => i.id === selectedIssueId);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/admin/journals" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{journal?.name}</h1>
            <p className="text-xs text-slate-500 font-medium">WORKSPACE</p>
          </div>
        </div>
        <button
          onClick={openVolumeModal}
          className="flex items-center gap-2 bg-[#0B8A83] hover:bg-[#09756f] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Plus size={16} /> New Volume
        </button>
      </div>

      {/* Main Split Pane */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* Left Pane: Volumes & Issues */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {volumes.length === 0 ? (
            <div className="text-center py-20">
              <LayoutTemplate className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-700">No Volumes Yet</h3>
              <p className="text-sm text-slate-500 mt-2">Create the first volume for this journal.</p>
            </div>
          ) : (
            volumes.map(volume => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={volume.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-100/50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <Book size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Volume {volume.volumeNumber}</h3>
                      <p className="text-xs text-slate-500">Year: {volume.year}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openIssueModal(volume)}
                    className="text-xs font-semibold text-[#0B8A83] hover:bg-[#0B8A83]/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    + Add Issue
                  </button>
                </div>
                
                <div className="p-2 space-y-1">
                  {volume.issues.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No issues in this volume yet.</p>
                  ) : (
                    volume.issues.map(issue => (
                      <div 
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedIssueId === issue.id 
                            ? "bg-[#0B8A83]/5 border-[#0B8A83]/20" 
                            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className={selectedIssueId === issue.id ? "text-[#0B8A83]" : "text-slate-400"} />
                          <div>
                            <p className={`font-semibold text-sm ${selectedIssueId === issue.id ? "text-[#0B8A83]" : "text-slate-700"}`}>
                              Issue {issue.issueNumber} {issue.title && `- ${issue.title}`}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                issue.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {issue.status}
                              </span>
                              <span className="text-[10px] text-slate-400">{issue.articles?.length || 0} Articles</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className={selectedIssueId === issue.id ? "text-[#0B8A83]" : "text-slate-300 opacity-0 group-hover:opacity-100"} />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Right Pane: Articles Display */}
        <div className="w-full md:w-1/2 bg-white overflow-y-auto">
          {!selectedIssueId ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Globe className="mb-4 opacity-20" size={64} />
              <h2 className="text-xl font-semibold text-slate-700">Select an Issue</h2>
              <p className="text-sm mt-2 max-w-sm">Click on any issue from the left panel to manage its published articles and content.</p>
            </div>
          ) : (
            <div className="p-4 md:p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Articles in Issue {selectedIssue?.issueNumber}</h2>
                  <p className="text-slate-500 mt-1">{selectedIssue?.articles?.length || 0} Published Articles</p>
                </div>
                <button
                  onClick={() => openArticleModal(selectedIssueId)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus size={16} /> Add Article
                </button>
              </div>

              <div className="space-y-4">
                {selectedIssue?.articles?.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                    <FileIcon className="mx-auto text-slate-300 mb-3" size={32} />
                    <p className="text-slate-500 font-medium">No articles published in this issue yet.</p>
                  </div>
                ) : (
                  selectedIssue?.articles?.map(article => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={article.id} 
                      className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-[#0B8A83] transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          {article.doi && (
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                              <FileLock2 size={12} /> DOI: {article.doi}
                            </span>
                          )}
                          {article.pages && <span>Pages: {article.pages}</span>}
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-green-500" /> Published
                          </span>
                        </div>
                      </div>
                      {article.pdfUrl && (
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`${API_URL}/public/articles/${article.id}/download?view=1`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                            title="View PDF"
                          >
                            <Eye size={14} /> View PDF
                          </a>
                          <a
                            href={`${API_URL}/public/articles/${article.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                            title="Download PDF"
                          >
                            <Download size={14} /> PDF
                          </a>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals using Framer Motion */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">
                  {activeModal === "VOLUME" && "Create New Volume"}
                  {activeModal === "ISSUE" && "Create New Issue"}
                  {activeModal === "ARTICLE" && "Publish Article"}
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {activeModal === "VOLUME" && (
                  <form onSubmit={handleCreateVolume} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Volume Number *</label>
                      <input type="number" required value={volumeForm.volumeNumber} onChange={e => setVolumeForm({...volumeForm, volumeNumber: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Year *</label>
                      <input type="number" required value={volumeForm.year} onChange={e => setVolumeForm({...volumeForm, year: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" />
                    </div>
                    <button type="submit" disabled={modalLoading} className="w-full h-12 bg-[#0B8A83] text-white font-bold rounded-xl hover:bg-[#09756f] mt-4">{modalLoading ? "Saving..." : "Create Volume"}</button>
                  </form>
                )}

                {activeModal === "ISSUE" && (
                  <form onSubmit={handleCreateIssue} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Number *</label>
                      <input type="number" required value={issueForm.issueNumber} onChange={e => setIssueForm({...issueForm, issueNumber: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Title (Optional)</label>
                      <input type="text" value={issueForm.title} onChange={e => setIssueForm({...issueForm, title: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" placeholder="Special Edition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                      <select value={issueForm.status} onChange={e => setIssueForm({...issueForm, status: e.target.value as any})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] bg-white">
                        <option value="UPCOMING">Upcoming</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </div>
                    <button type="submit" disabled={modalLoading} className="w-full h-12 bg-[#0B8A83] text-white font-bold rounded-xl hover:bg-[#09756f] mt-4">{modalLoading ? "Saving..." : "Create Issue"}</button>
                  </form>
                )}

                {activeModal === "ARTICLE" && (
                  <form onSubmit={handleCreateArticle} className="space-y-4">
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex items-start gap-2 mb-1">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>Pick an <strong>ACCEPTED</strong> submission to publish as an article. Submissions must complete peer review and be accepted before publishing.</p>
                    </div>

                    {/* Accepted Submission Picker */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Accepted Submission *</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPickerOpen((o) => !o)}
                          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 text-left outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83] bg-white"
                        >
                          {selectedSubmission ? (
                            <>
                              <span className="block font-semibold text-slate-800 text-sm">{selectedSubmission.title}</span>
                              <span className="block text-xs text-slate-500 mt-0.5">
                                {selectedSubmission.paperId} • {formatAuthors(selectedSubmission)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">Select an accepted submission…</span>
                          )}
                        </button>

                        {pickerOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                            <input
                              type="text"
                              value={subSearch}
                              onChange={(e) => setSubSearch(e.target.value)}
                              placeholder="Search by title or paper ID…"
                              className="w-full px-4 py-2.5 text-sm border-b border-slate-100 outline-none focus:border-[#0B8A83]"
                            />
                            <div className="max-h-56 overflow-y-auto">
                              {availableSubs.length === 0 ? (
                                <div className="p-4 text-center">
                                  <p className="text-sm text-slate-500 font-medium">No accepted submissions found.</p>
                                  <p className="text-xs text-slate-400 mt-1">Submissions must be in &quot;ACCEPTED&quot; status before publishing.</p>
                                </div>
                              ) : (
                                availableSubs.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => selectSubmission(s)}
                                    className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="block text-sm font-semibold text-slate-800 truncate">{s.title}</span>
                                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">ACCEPTED</span>
                                    </div>
                                    <span className="block text-xs text-slate-500 mt-0.5">
                                      <span className="font-mono text-[#0B8A83]">{s.paperId}</span> • {formatAuthors(s)}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Submission Details */}
                    {selectedSubmission && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">STATUS</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{selectedSubmission.status}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">Journal:</span> {selectedSubmission.journal?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-600">Authors:</span> {formatAuthors(selectedSubmission)}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-semibold text-slate-600">Abstract:</span>{" "}
                          {selectedSubmission.abstract
                            ? selectedSubmission.abstract.slice(0, 160) + (selectedSubmission.abstract.length > 160 ? "…" : "")
                            : "—"}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Article Title *</label>
                      <input type="text" required value={articleForm.title} onChange={(e) => setArticleForm({...articleForm, title: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">DOI (Optional)</label>
                        <input type="text" value={articleForm.doi} onChange={(e) => setArticleForm({...articleForm, doi: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" placeholder="10.5678/uora.2026.…" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Pages</label>
                        <input type="text" value={articleForm.pages} onChange={(e) => setArticleForm({...articleForm, pages: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]" placeholder="1-15" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule Publish Date (Optional)</label>
                      <input
                        type="datetime-local"
                        value={articleForm.scheduledPublishAt}
                        onChange={(e) => setArticleForm({...articleForm, scheduledPublishAt: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-[#0B8A83] focus:ring-1 focus:ring-[#0B8A83]"
                      />
                      <p className="text-xs text-slate-400 mt-1">Leave empty to publish immediately. Set a future date to schedule auto-publishing.</p>
                    </div>
                    <button type="submit" disabled={modalLoading || !selectedSubmission} className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 mt-4 disabled:opacity-50">{modalLoading ? "Publishing..." : "Publish Article"}</button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
