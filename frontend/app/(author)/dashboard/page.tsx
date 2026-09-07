"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, Edit3 } from "lucide-react";
import Link from "next/link";
import { getMySubmissions, SubmissionModel } from "@/lib/api/submissions";

export default function AuthorDashboard() {
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, []);

  const total = submissions.length;
  const underReview = submissions.filter(s => s.status === "UNDER_REVIEW").length;
  const published = submissions.filter(s => s.status === "PUBLISHED").length;
  const drafts = submissions.filter(s => s.status === "DRAFT").length;

  const stats = [
    { title: "Total Submissions", value: total.toString(), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Under Review", value: underReview.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Published", value: published.toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Drafts", value: drafts.toString(), icon: Edit3, color: "text-purple-600", bg: "bg-purple-50" },
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Author Overview</h1>
        <p className="text-slate-500 mt-1">Welcome to your publication workspace.</p>
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
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Submissions</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-12">{error}</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              Your recent submissions will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((sub) => (
                <div key={sub.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{sub.title}</p>
                    <p className="text-xs text-slate-500">
                      ID: {sub.paperId} • Journal: {sub.journal.shortName} • Created: {new Date(sub.createdAt).toLocaleDateString()}
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
              href="/dashboard/submissions/new"
              className="block w-full p-4 text-center border border-slate-100 rounded-xl hover:border-[#0B8A83] hover:bg-[#DDF6F4] transition-all font-semibold text-[#0B8A83]"
            >
              Submit New Paper
            </Link>
            <Link 
              href="/journals"
              className="block w-full p-4 text-center border border-slate-100 rounded-xl hover:border-slate-300 transition-all font-medium text-slate-700 bg-slate-50"
            >
              Browse Journals
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
