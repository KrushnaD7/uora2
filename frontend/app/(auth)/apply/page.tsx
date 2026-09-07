"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { api } from "@/lib/api/client";
import type { JournalModel } from "@/lib/api/journals";
import PublicLayout from "@/components/layout/PublicLayout";
import Container from "@/components/ui/Container";

const inputClass =
  "h-14 w-full rounded-2xl border border-line bg-white px-5 text-ink-700 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-200";

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    institution: "",
    designation: "",
    expertise: "",
    journalId: ""
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [journals, setJournals] = useState<JournalModel[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const data = await api.get("/public/journals");
        if (data.success && data.data) {
          setJournals(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, journalId: data.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch journals", err);
      }
    };
    fetchJournals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.journalId) {
      setError("Please select a journal to apply for.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (cvFile) {
        submitData.append("cv", cvFile);
      }

      const data = await api.upload("/auth/apply", submitData);
      if (!data.success) throw new Error(data.message);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout>
        <section className="flex min-h-[70vh] items-center justify-center bg-canvas px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6 rounded-2xl border border-line bg-white p-10 text-center shadow-lg"
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <ClipboardCheck size={32} />
            </div>
            <h2 className="font-display text-2xl font-semibold text-navy-950">Application Received!</h2>
            <p className="text-ink-600">
              Thank you for applying to be a reviewer. Our editorial team will review your CV and contact you soon.
            </p>
            <Link href="/" className="mt-4 inline-block font-semibold text-brand-700 hover:underline">
              Return to Home
            </Link>
          </motion.div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden bg-canvas pt-32 pb-20 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -right-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-brand-100)_0%,transparent_65%)] opacity-80" />
        </div>

        <Container width="narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-2xl border border-line bg-white p-8 shadow-lg sm:p-12"
          >
            <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h2 className="font-display text-center text-display-sm font-semibold text-navy-950">
              Join as a Reviewer
            </h2>
            <p className="mt-2 text-center text-sm text-ink-600">
              Contribute to the academic community by reviewing papers.
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Select Journal *</label>
                  <select
                    required
                    value={formData.journalId}
                    onChange={(e) => setFormData({...formData, journalId: e.target.value})}
                    className={inputClass}
                  >
                    <option value="" disabled>Select a journal</option>
                    {journals.map(j => (
                      <option key={j.id} value={j.id}>{j.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Full Name *</label>
                  <input
                    type="text" required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Email *</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    suppressHydrationWarning
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Institution *</label>
                  <input
                    type="text" required
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Designation</label>
                  <input
                    type="text" required
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className={inputClass}
                    placeholder="e.g. Professor"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Area of Expertise</label>
                  <input
                    type="text" required
                    value={formData.expertise}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    className={inputClass}
                    placeholder="e.g. Machine Learning"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">Upload CV (PDF/DOC) *</label>
                  <input
                    type="file" required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full cursor-pointer rounded-2xl border border-dashed border-line p-2 text-sm text-ink-500 transition-all file:mr-4 file:rounded-xl file:border-0 file:bg-brand-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-8 text-base font-semibold text-white shadow-brand transition-all duration-300 hover:bg-brand-700 hover:shadow-lg disabled:opacity-50"
              >
                <ClipboardCheck size={20} />
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </motion.div>
        </Container>
      </section>
    </PublicLayout>
  );
}
