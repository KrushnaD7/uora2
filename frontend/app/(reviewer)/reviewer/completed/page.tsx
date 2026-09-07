"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, AlertCircle, Star } from "lucide-react";
import { api } from "@/lib/api/client";

export default function CompletedReviewsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await api.get("/reviewers/my/assignments");
        if (res.success && res.data) {
          setAssignments(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch assignments");
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  const completed = assignments.filter((a) => a.status === "COMPLETED");

  const getRecommendationBadge = (rec: string) => {
    const maps: Record<string, string> = {
      ACCEPT: "bg-green-100 text-green-700",
      MINOR_REVISION: "bg-yellow-100 text-yellow-700",
      MAJOR_REVISION: "bg-orange-100 text-orange-700",
      REJECT: "bg-red-100 text-red-700",
    };
    return `px-2.5 py-1 rounded-full text-xs font-semibold ${maps[rec] || "bg-slate-100 text-slate-700"}`;
  };

  const formatRecommendation = (rec: string) => rec.replace(/_/g, " ");

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Completed Reviews</h1>
        <p className="text-slate-500 mt-1">History of your submitted peer reviews.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                  <th className="p-4 font-semibold">Paper</th>
                  <th className="p-4 font-semibold">Journal</th>
                  <th className="p-4 font-semibold">Recommendation</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent" />
                      </div>
                    </td>
                  </tr>
                ) : completed.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
                      No completed reviews yet.
                    </td>
                  </tr>
                ) : (
                  completed.map((a, index) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 max-w-xs truncate">
                          {a.submission?.title || "Untitled"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: {a.submission?.paperId}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {a.submission?.journal?.name || "—"}
                      </td>
                      <td className="p-4">
                        {a.review?.recommendation ? (
                          <span className={getRecommendationBadge(a.review.recommendation)}>
                            {formatRecommendation(a.review.recommendation)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {a.review?.overallRating ? (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <Star
                                key={num}
                                size={14}
                                className={
                                  num <= a.review.overallRating
                                    ? "text-yellow-500"
                                    : "text-slate-200"
                                }
                                fill={num <= a.review.overallRating ? "currentColor" : "none"}
                              />
                            ))}
                            <span className="text-xs text-slate-500 ml-1">{a.review.overallRating}/5</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
