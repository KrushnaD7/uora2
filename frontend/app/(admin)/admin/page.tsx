"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        const res = await api.get("/dashboard");
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    loadAdminDashboard();
  }, []);

  const totalUsers = data?.statistics?.authors + data?.statistics?.reviewers || 0;
  const activeJournals = data?.statistics?.journals || 0;
  const publishedArticles = data?.statistics?.published || 0;
  const underReview = data?.statistics?.underReview || 0;
  const rejected = data?.statistics?.rejected || 0;

  const stats = [
    { title: "Authors & Reviewers", value: totalUsers.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Under Review", value: underReview.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Active Journals", value: activeJournals.toString(), icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { title: "Published Articles", value: publishedArticles.toString(), icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Rejected Papers", value: rejected.toString(), icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const recentSubmissions = data?.recentSubmissions || [];
  const rejectedSubmissions = data?.recentRejectedSubmissions || [];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back to the Admin control panel.</p>
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
          ) : recentSubmissions.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              No recent submissions.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map((sub: any) => (
                <div key={sub.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{sub.title}</p>
                    <p className="text-xs text-slate-500">
                      ID: {sub.paperId} • Journal: {sub.journal?.name} • Created: {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recently Rejected Papers</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-12">{error}</div>
          ) : rejectedSubmissions.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
              No rejected papers.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rejectedSubmissions.map((sub: any) => (
                <div key={sub.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">{sub.title}</p>
                    <p className="text-xs text-slate-500">
                      ID: {sub.paperId} • Journal: {sub.journal?.name} • Updated: {new Date(sub.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">{sub.status}</span>
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
              href="/admin/users"
              className="block w-full p-4 text-center border border-slate-100 rounded-xl hover:border-[#0B8A83] hover:bg-[#DDF6F4] transition-all font-semibold text-[#0B8A83]"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/applications"
              className="block w-full p-4 text-center border border-slate-100 rounded-xl hover:border-slate-300 transition-all font-medium text-slate-700 bg-slate-50"
            >
              Review Applications
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

