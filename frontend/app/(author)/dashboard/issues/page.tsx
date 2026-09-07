"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, CalendarDays, FileText, Newspaper } from "lucide-react";
import { getPublicIssues, IssueModel } from "@/lib/api/journals";

export default function AvailableIssuesPage() {
  const [issues, setIssues] = useState<IssueModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIssues() {
      try {
        const res = await getPublicIssues();
        if (res.success && res.data) {
          setIssues(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load issues");
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, []);

  const grouped = issues.reduce<Record<string, IssueModel[]>>((acc, issue) => {
    const journalName = issue.journal?.name || "Unknown Journal";
    if (!acc[journalName]) acc[journalName] = [];
    acc[journalName].push(issue);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Available Issues</h1>
        <p className="text-slate-500 mt-1">
          Browse published issues across the UORA portfolio and open their full contents.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-24">{error}</div>
      ) : issues.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-24 border-2 border-dashed border-slate-100 rounded-xl">
          No published issues are available yet.
        </div>
      ) : (
        Object.entries(grouped).map(([journalName, journalIssues], groupIndex) => (
          <motion.div
            key={journalName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#DDF6F4] text-[#0B8A83]">
                <Newspaper size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{journalName}</h2>
                <p className="text-xs text-slate-500">{journalIssues.length} published {journalIssues.length === 1 ? "issue" : "issues"}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {journalIssues.map((issue) => {
                const volume = issue.volume?.volumeNumber ?? "–";
                const articleCount = issue._count?.articles ?? issue.articles?.length ?? 0;
                return (
                  <div key={issue.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          Vol {volume} • Issue {issue.issueNumber}
                        </span>
                        {issue.publishedAt && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <CalendarDays size={13} />
                            {new Date(issue.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900">
                        {issue.title || `Volume ${volume} Issue ${issue.issueNumber}`}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <FileText size={13} />
                        {articleCount} {articleCount === 1 ? "article" : "articles"}
                      </p>
                    </div>
                    <Link
                      href={`/journals/${issue.journal?.slug || ""}/volumes/${issue.volumeId}/issues/${issue.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 text-sm font-semibold text-[#0B8A83] hover:border-[#0B8A83] hover:bg-[#DDF6F4] transition-all shrink-0"
                    >
                      <BookOpen size={16} />
                      View Issue
                    </Link>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
