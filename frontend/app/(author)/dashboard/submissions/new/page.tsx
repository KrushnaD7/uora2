"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileUp, ArrowLeft, Save, Send, CheckCircle2, CalendarDays, BookOpen } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { createSubmission, uploadManuscript } from "@/lib/api/submissions";
import { getPublicIssues, IssueModel } from "@/lib/api/journals";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<any[]>([]);
  const [journalId, setJournalId] = useState("");
  const [issues, setIssues] = useState<IssueModel[]>([]);
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [correspondingEmail, setCorrespondingEmail] = useState("");
  const [correspondingPhone, setCorrespondingPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadJournals() {
      try {
        const res = await api.get("/public/journals");
        if (res.success && res.data) {
          setJournals(res.data);
          if (res.data.length > 0) {
            setJournalId(res.data[0].id);
          }
        }
      } catch (err: any) {
        console.error("Failed to load journals", err);
      }
    }
    loadJournals();

    getPublicIssues()
      .then((res) => {
        if (res.success && res.data) setIssues(res.data);
      })
      .catch(() => {});
  }, []);

  const journalIssues = issues.filter((i) => i.journalId === journalId);
  const selectedJournal = journals.find((j) => j.id === journalId);

  const handleSubmit = async (submitStatus: "DRAFT" | "SUBMITTED") => {
    if (!journalId) {
      setError("Please select a target journal.");
      return;
    }
    if (title.length < 10) {
      setError("Title must be at least 10 characters long.");
      return;
    }
    if (abstract.length < 50) {
      setError("Abstract must be at least 50 characters long.");
      return;
    }
    if (!correspondingEmail) {
      setError("Corresponding email is required.");
      return;
    }
    if (submitStatus === "SUBMITTED" && !file) {
      setError("Manuscript file is required to submit the paper.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create the submission metadata
      const res = await createSubmission({
        journalId,
        title,
        abstract,
        correspondingEmail,
        correspondingPhone,
        status: submitStatus
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create submission");
      }

      const submissionId = res.data.id;

      // 2. Upload file if provided
      if (file) {
        const uploadRes = await uploadManuscript(submissionId, file);
        if (!uploadRes.success) {
          throw new Error(uploadRes.message || "Metadata saved, but file upload failed.");
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create submission");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Submission Successful!</h2>
          <p className="text-slate-600">
            Your manuscript has been registered. You will be redirected to the dashboard shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#0B8A83] font-semibold hover:underline mb-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Submit a Manuscript</h1>
          <p className="text-slate-500">Provide details and upload the manuscript file.</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Target Journal */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Target Journal *</label>
            <select
              value={journalId}
              onChange={(e) => setJournalId(e.target.value)}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all"
            >
              {journals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.shortName})
                </option>
              ))}
            </select>

            {/* Available Issues for the selected journal */}
            {selectedJournal && (
              <div className="mt-3 rounded-xl border border-[#DDF6F4] bg-[#F2FBFB] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    Available Issues — {selectedJournal.shortName}
                  </p>
                  <Link
                    href="/dashboard/issues"
                    className="text-xs font-semibold text-[#0B8A83] hover:underline"
                  >
                    View all available issues
                  </Link>
                </div>
                {journalIssues.length === 0 ? (
                  <p className="text-xs text-slate-500">No published issues yet for this journal.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {journalIssues.map((issue) => {
                      const volume = issue.volume?.volumeNumber ?? "–";
                      const articleCount = issue._count?.articles ?? issue.articles?.length ?? 0;
                      return (
                        <li key={issue.id}>
                          <Link
                            href={`/journals/${selectedJournal.slug}/volumes/${issue.volumeId}/issues/${issue.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white transition-colors border border-transparent hover:border-slate-100"
                          >
                            <span className="flex items-center gap-2 text-slate-700 font-medium">
                              <BookOpen size={14} className="text-[#0B8A83]" />
                              Vol {volume} • Issue {issue.issueNumber}
                              <span className="text-slate-500 font-normal">
                                {issue.title || `${articleCount} ${articleCount === 1 ? "article" : "articles"}`}
                              </span>
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                              <CalendarDays size={12} />
                              {issue.publishedAt
                                ? new Date(issue.publishedAt).toLocaleDateString()
                                : "—"}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Manuscript Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the full title of your research paper"
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Abstract * (Min 50 chars)</label>
            <textarea
              rows={6}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Provide a comprehensive abstract of your work..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all resize-none"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Corresponding Email *</label>
              <input
                type="email"
                value={correspondingEmail}
                onChange={(e) => setCorrespondingEmail(e.target.value)}
                placeholder="primary@university.edu"
                suppressHydrationWarning
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Corresponding Phone</label>
              <input
                type="tel"
                value={correspondingPhone}
                onChange={(e) => setCorrespondingPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 outline-none focus:border-[#0B8A83] focus:ring-2 focus:ring-[#DDF6F4] transition-all"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Manuscript File * (.pdf, .docx)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
              <div className="space-y-1 text-center">
                <FileUp className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600">
                  <span className="font-semibold text-[#0B8A83]">Upload a file</span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PDF, DOCX up to 10MB</p>
                {file && (
                  <p className="mt-2 text-sm font-bold text-teal-600">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("DRAFT")}
            className="flex-1 h-12 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} /> Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit("SUBMITTED")}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#0B8A83] to-[#0F608A] hover:opacity-95 font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={18} /> {loading ? "Submitting..." : "Submit Manuscript"}
          </button>
        </div>
      </div>
    </div>
  );
}
