"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { api } from "@/lib/api/client";

export default function EditorSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null);
  const [actionRemarks, setActionRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get("/journals-suggestions");
      if (res.success && res.data) {
        setSuggestions(res.data);
      } else {
        throw new Error(res.message);
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

  const handleAction = async (id: string, status: string) => {
    if (!actionRemarks && (status === "CHANGES_REQUESTED" || status === "REJECTED")) {
      alert("Please provide remarks/reason for this action.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.patch(`/journals-suggestions/${id}/evaluate`, {
        status,
        remarks: actionRemarks,
      });

      if (res.success) {
        setActionRemarks("");
        setSelectedSuggestion(null);
        fetchSuggestions(); // Refresh queue
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      alert(err.message || "Failed to record evaluation");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string }> = {
      SUBMITTED: { bg: "bg-blue-50 text-blue-700 border-blue-100", },
      UNDER_EDITOR_REVIEW: { bg: "bg-indigo-50 text-indigo-700 border-indigo-100" },
      EDITOR_RECOMMENDED: { bg: "bg-purple-50 text-purple-700 border-purple-100" },
      ADMIN_REVIEW: { bg: "bg-amber-50 text-amber-700 border-amber-100" },
      CHANGES_REQUESTED: { bg: "bg-yellow-50 text-yellow-800 border-yellow-100" },
      APPROVED: { bg: "bg-green-50 text-green-700 border-green-100" },
      REJECTED: { bg: "bg-red-50 text-red-700 border-red-100" },
      CLOSED: { bg: "bg-slate-50 text-slate-700 border-slate-100" },
    };

    const config = configs[status] || { bg: "bg-slate-50 text-slate-700 border-slate-100" };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const filtered = suggestions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.author?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Journal Suggestions</h1>
        <p className="text-slate-500 mt-1">Review new journal proposals, request modifications, or forward recommendations to Administrators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Queue Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by title or author name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] transition-colors text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No suggestions in evaluation queue.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSuggestion(item)}
                    className={`p-6 cursor-pointer hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4 ${
                      selectedSuggestion?.id === item.id ? "bg-[#EFFBFA] border-l-4 border-[#0B8A83]" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-500">
                        Suggested by: {item.author?.fullName} • Domain: {item.subjectDomain}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details and Actions Column */}
        <div className="lg:col-span-1">
          {selectedSuggestion ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 sticky top-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded">
                  Proposal Detail
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-3">{selectedSuggestion.title}</h2>
                <p className="text-sm text-slate-500 mt-1">Suggested by {selectedSuggestion.author?.fullName}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-bold text-slate-700">Subject/Domain</h4>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg">{selectedSuggestion.subjectDomain}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Description</h4>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg whitespace-pre-wrap">{selectedSuggestion.description}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Reason for Request</h4>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg whitespace-pre-wrap">{selectedSuggestion.reason}</p>
                </div>
                {selectedSuggestion.supportingInfo && (
                  <div>
                    <h4 className="font-bold text-slate-700">Supporting Information</h4>
                    <p className="text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg">{selectedSuggestion.supportingInfo}</p>
                  </div>
                )}
              </div>

              {/* Action Form */}
              {["SUBMITTED", "UNDER_EDITOR_REVIEW", "CHANGES_REQUESTED"].includes(selectedSuggestion.status) ? (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <MessageSquare size={16} /> Evaluate Suggestion
                  </h3>

                  <textarea
                    rows={3}
                    placeholder="Provide review remarks or reasons for changes/rejection..."
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0B8A83] focus:bg-white transition-all text-xs font-semibold resize-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {selectedSuggestion.status === "SUBMITTED" && (
                      <button
                        onClick={() => handleAction(selectedSuggestion.id, "UNDER_EDITOR_REVIEW")}
                        disabled={actionLoading}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Start Review
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(selectedSuggestion.id, "EDITOR_RECOMMENDED")}
                      disabled={actionLoading}
                      className="p-2.5 bg-[#0B8A83] hover:bg-[#09756f] text-white text-xs font-bold rounded-xl transition-all cursor-pointer col-span-1"
                    >
                      Forward/Recommend
                    </button>
                    <button
                      onClick={() => handleAction(selectedSuggestion.id, "CHANGES_REQUESTED")}
                      disabled={actionLoading}
                      className="p-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Request Info
                    </button>
                    <button
                      onClick={() => handleAction(selectedSuggestion.id, "REJECTED")}
                      disabled={actionLoading}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer col-span-2"
                    >
                      Reject Suggestion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-500 italic">
                  Evaluation has been recorded. Current status: {selectedSuggestion.status.replace(/_/g, " ")}.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
              <p className="font-semibold text-sm">No proposal selected</p>
              <p className="text-xs text-slate-400 mt-1">Select a suggestion from the queue to view details and execute actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
