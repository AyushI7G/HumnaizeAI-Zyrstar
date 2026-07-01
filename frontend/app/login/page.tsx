"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-ink-900">Log in</h1>
        <p className="mt-1 text-sm text-mist-500">Welcome back to Zyrstar.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-ink-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-ink-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-mist-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-signal-red">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-ink-900">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
