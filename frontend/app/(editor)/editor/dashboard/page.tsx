"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Files, Clock, Users, CheckSquare } from "lucide-react";
import { api } from "@/lib/api/client";
import Link from "next/link";

export default function EditorDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEditorDashboard() {
      try {
        const [dashRes, subsRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/submissions")
        ]);

        if (dashRes.success && dashRes.data) {
          setStatsData(dashRes.data);
        }
        if (subsRes.success && subsRes.data) {
          setSubmissions(subsRes.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadEditorDashboard();
  }, []);

  const stats = [
    { title: "New Submissions", value: statsData?.statistics?.submissions?.toString() || "0", icon: Files, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Under Review", value: statsData?.statistics?.underReview?.toString() || "0", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Active Reviewers", value: statsData?.statistics?.reviewers?.toString() || "0", icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { title: "Published", value: statsData?.statistics?.published?.toString() || "0", icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const recent = submissions.slice(0, 5);

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

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Editorial Overview</h1>
        <p className="text-slate-500 mt-1">Manage submissions and peer review workflow.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Latest Submissions</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-12">{error}</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              Recent paper submissions will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((sub: any) => (
                <div key={sub.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{sub.title}</p>
                    <p className="text-xs text-slate-500">
                      ID: {sub.paperId} • Journal: {sub.journal?.shortName} • Created: {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={getStatusBadgeClass(sub.status)}>{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/editor/submissions"
              className="w-full p-4 text-center border border-slate-100 rounded-xl hover:border-[#0B8A83] hover:bg-[#DDF6F4] transition-colors font-semibold text-[#0B8A83] block"
            >
              Review Screening Queue
            </Link>
            <Link
              href="/editor/assign"
              className="w-full p-4 text-center border border-slate-100 rounded-xl hover:border-slate-300 transition-colors font-medium text-slate-700 bg-slate-50 block"
            >
              All Submissions
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

