"use client";

import { motion } from "framer-motion";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth/AuthContext";
import { register as apiRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import PublicLayout from "@/components/layout/PublicLayout";
import Container from "@/components/ui/Container";

const inputClass =
  "h-14 w-full rounded-2xl border border-line bg-white px-5 text-ink-700 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-200";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [designation, setDesignation] = useState("");
  const [orcid, setOrcid] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const data = await apiRegister({
        name,
        email,
        password,
        role: "AUTHOR",
        mobile,
        country,
        institution,
        designation,
        orcid
      });
      if (!data.success || !data.data) throw new Error(data.message || "Failed to register");

      login(data.data.token, data.data.user);

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const issue = err.errors[0];
        setError(
          issue?.message || err.message || "Failed to register"
        );
      } else {
        setError(err instanceof Error ? err.message : "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden bg-canvas pt-32 pb-20 sm:pt-36 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" />
          <div className="absolute -left-40 -top-52 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--color-navy-100)_0%,transparent_65%)] opacity-70" />
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
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-ink-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
                Sign in here
              </Link>
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    suppressHydrationWarning
                    className={inputClass}
                    placeholder="author@university.edu"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    ORCID iD
                  </label>
                  <input
                    type="text"
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-8 text-base font-semibold text-white shadow-brand transition-all duration-300 hover:bg-brand-700 hover:shadow-lg disabled:opacity-50"
              >
                <UserPlus size={20} />
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </motion.div>
        </Container>
      </section>
    </PublicLayout>
  );
}
