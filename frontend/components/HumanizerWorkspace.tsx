"use client";

import { useState } from "react";
import { api, ApiError, type HumanizeResult } from "@/lib/api";
import { DetectionScoreCard, HumanizationScoreBadge } from "@/components/ScoreCard";

const TONES = [
  { value: "balanced", label: "Balanced" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "academic", label: "Academic" },
  { value: "creative", label: "Creative" },
];

const STRENGTHS = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "aggressive", label: "Aggressive" },
];

export default function HumanizerWorkspace() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("balanced");
  const [strength, setStrength] = useState("medium");
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  async function handleHumanize() {
    setError(null);
    setLoading(true);
    try {
      const data = await api.humanize(input, tone, strength);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Please log in to use the Humanizer." : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card flex flex-col p-6" aria-labelledby="input-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="input-heading" className="text-sm font-semibold text-ink-900">
            Your text
          </h2>
          <span className="text-xs text-mist-400">{wordCount} words</span>
        </div>
        <label htmlFor="source-text" className="sr-only">
          Text to humanize
        </label>
        <textarea
          id="source-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your AI-generated text here…"
          rows={14}
          maxLength={15000}
          className="w-full flex-1 resize-none rounded-lg border border-mist-200 p-4 text-sm leading-relaxed text-ink-900 focus:border-brand-500 focus:outline-none"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium text-mist-500" htmlFor="tone-select">
            Tone
          </label>
          <select
            id="tone-select"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="rounded-lg border border-mist-200 px-3 py-1.5 text-sm"
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="text-xs font-medium text-mist-500" htmlFor="strength-select">
            Strength
          </label>
          <select
            id="strength-select"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            className="rounded-lg border border-mist-200 px-3 py-1.5 text-sm"
          >
            {STRENGTHS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleHumanize}
            disabled={loading || input.trim().length === 0}
            className="btn-primary ml-auto"
          >
            {loading ? "Humanizing…" : "Humanize text"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-signal-red">
            {error}
          </p>
        )}
      </section>

      <section className="card p-6" aria-labelledby="output-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="output-heading" className="text-sm font-semibold text-ink-900">
            Humanized result
          </h2>
          {result && <HumanizationScoreBadge score={result.humanization_score} />}
        </div>

        {!result && (
          <p className="text-sm text-mist-400">
            Your humanized text and score breakdown will appear here.
          </p>
        )}

        {result && (
          <div className="space-y-6">
            <div
              className="max-h-64 overflow-y-auto rounded-lg border border-mist-200 bg-mist-50 p-4 text-sm leading-relaxed text-ink-900"
              aria-label="Humanized text output"
            >
              {result.humanized_text}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetectionScoreCard title="Before" result={result.detection_before} />
              <DetectionScoreCard title="After" result={result.detection_after} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink-900">What changed</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-mist-500">
                {result.changes_made.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
