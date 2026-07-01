"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type UserProfile } from "@/lib/api";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container-page py-16 text-mist-500">Loading your dashboard…</div>;
  }

  if (!profile) {
    return (
      <div className="container-page py-16">
        <p className="text-mist-500">
          You need to{" "}
          <Link href="/login" className="font-medium text-ink-900">
            log in
          </Link>{" "}
          to view your dashboard.
        </p>
      </div>
    );
  }

  const usagePct = Math.min((profile.words_used_this_period / profile.words_quota) * 100, 100);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-ink-900">Welcome back, {profile.full_name.split(" ")[0]}</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-mist-500">Plan</h2>
          <p className="mt-1 text-2xl font-bold capitalize text-ink-900">{profile.plan}</p>
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-mist-500">Word usage this period</h2>
          <p className="mt-1 text-2xl font-bold text-ink-900">
            {profile.words_used_this_period.toLocaleString()} / {profile.words_quota.toLocaleString()}
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-mist-100">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/humanizer" className="btn-primary">
          Humanize text
        </Link>
        <Link href="/detector" className="btn-secondary">
          Run AI detector
        </Link>
      </div>
    </div>
  );
}
