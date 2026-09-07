"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/client";

export default function NewSuggestionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    subjectDomain: "",
    description: "",
    reason: "",
    supportingInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/journals-suggestions", formData);
      if (res.success) {
        router.push("/dashboard/suggestions");
      } else {
        throw new Error(res.message || "Failed to submit request");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 md:space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard/suggestions"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold"
      >
        <ArrowLeft size={16} /> Back to suggestions
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Lightbulb className="text-teal-600 animate-pulse" size={28} />
          Suggest a New Journal
        </h1>
        <p className="text-slate-500 mt-1">Submit proposal details for review by our editors and super administrator.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 text-sm items-start">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Proposed Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Universal Journal of Quantum Computing"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Subject / Domain *</label>
          <input
            type="text"
            name="subjectDomain"
            required
            value={formData.subjectDomain}
            onChange={handleChange}
            placeholder="e.g. Physics & Computer Science"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Journal Description *</label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the target audience, core themes, and objectives of the journal..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] focus:bg-white transition-all text-sm font-medium resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Reason for Suggestion *</label>
          <textarea
            name="reason"
            required
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            placeholder="Why is this journal needed? Detail research gaps or academic interest..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] focus:bg-white transition-all text-sm font-medium resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Supporting Information / Links (Optional)</label>
          <textarea
            name="supportingInfo"
            rows={2}
            value={formData.supportingInfo}
            onChange={handleChange}
            placeholder="Provide links to similar publications, indexing info, or names of potential board members..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] focus:bg-white transition-all text-sm font-medium resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B8A83] hover:bg-[#09756f] text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
        >
          <Send size={16} />
          {loading ? "Submitting..." : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
}
