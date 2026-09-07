"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/api/client";

export default function AuthorSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSuggestions = async () => {
    try {
      const res = await api.get("/journals-suggestions");
      if (res.success && res.data) {
        setSuggestions(res.data);
      } else {
        throw new Error(res.message || "Failed to load suggestions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      SUBMITTED: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700", icon: Clock },
      UNDER_EDITOR_REVIEW: { bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-700", icon: Clock },
      EDITOR_RECOMMENDED: { bg: "bg-purple-50 border-purple-100", text: "text-purple-700", icon: CheckCircle2 },
      ADMIN_REVIEW: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: Clock },
      CHANGES_REQUESTED: { bg: "bg-yellow-50 border-yellow-100", text: "text-yellow-800", icon: AlertCircle },
      APPROVED: { bg: "bg-green-50 border-green-100", text: "text-green-700", icon: CheckCircle2 },
      REJECTED: { bg: "bg-red-50 border-red-100", text: "text-red-700", icon: XCircle },
      CLOSED: { bg: "bg-slate-50 border-slate-100", text: "text-slate-700", icon: XCircle },
    };

    const config = configs[status] || { bg: "bg-slate-50 border-slate-100", text: "text-slate-700", icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const filtered = suggestions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subjectDomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suggest a Journal</h1>
          <p className="text-slate-500 mt-1">Submit new journal ideas and monitor their approval lifecycle.</p>
        </div>
        <Link
          href="/dashboard/suggestions/new"
          className="inline-flex items-center gap-2 bg-[#0B8A83] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#09756f] transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} /> New Request
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Data Table / Content */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
              <AlertCircle size={40} className="opacity-50" />
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="p-20 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center border-dashed border-2 border-slate-100 m-6 rounded-2xl">
              <p className="text-slate-400 font-medium">No journal suggestions found.</p>
              <p className="text-sm text-slate-400 mt-1">Get started by clicking the "New Request" button.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-5">Title & Domain</th>
                  <th className="p-5">Reason</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">History / Remarks</th>
                  <th className="p-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((suggestion) => {
                  const latestHistory = suggestion.history?.[suggestion.history.length - 1];
                  return (
                    <tr key={suggestion.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <p className="font-bold text-slate-900 leading-snug">{suggestion.title}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {suggestion.subjectDomain}
                        </span>
                      </td>
                      <td className="p-5 max-w-xs">
                        <p className="text-sm text-slate-600 line-clamp-2">{suggestion.reason}</p>
                      </td>
                      <td className="p-5">{getStatusBadge(suggestion.status)}</td>
                      <td className="p-5 max-w-xs">
                        {latestHistory ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-700">
                              By {latestHistory.user?.name || "System"} ({latestHistory.user?.role})
                            </p>
                            <p className="text-xs text-slate-500 italic">"{latestHistory.remarks || "No remarks"}"</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No history</span>
                        )}
                      </td>
                      <td className="p-5 text-sm text-slate-500 flex items-center gap-1.5 mt-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
