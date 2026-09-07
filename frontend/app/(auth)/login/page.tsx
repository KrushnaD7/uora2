"use client";

import { motion } from "framer-motion";
import { LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth/AuthContext";
import { login as apiLogin } from "@/lib/api/auth";
import PublicLayout from "@/components/layout/PublicLayout";
import Container from "@/components/ui/Container";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiLogin(email, password);
      if (!data.success || !data.data) throw new Error(data.message || "Failed to login");

      login(data.data.token, data.data.user);

      // Redirect based on role — use router.push for client-side navigation
      const role = data.data.user.role;
      if (role === "ADMIN") router.push("/admin");
      else if (role === "EDITOR") router.push("/editor/dashboard");
      else if (role === "REVIEWER") router.push("/reviewer/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

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
              Sign in to UORA
            </h2>
            <p className="mt-2 text-center text-sm text-ink-600">
              <Link href="/register" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">
                Create Author Account
              </Link>
              {" "} • {" "}
              <Link href="/apply" className="font-medium text-brand-700 hover:text-brand-800 hover:underline">
                Apply as Reviewer
              </Link>
            </p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    suppressHydrationWarning
                    className="h-14 w-full rounded-2xl border border-line bg-white px-5 text-ink-700 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                    placeholder="author@university.edu"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-line bg-white px-5 text-ink-700 outline-none transition-all duration-300 placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-8 text-base font-semibold text-white shadow-brand transition-all duration-300 hover:bg-brand-700 hover:shadow-lg disabled:opacity-50"
              >
                <LogIn size={20} />
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </motion.div>
        </Container>
      </section>
    </PublicLayout>
  );
}
