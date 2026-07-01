"use client";

import { useState } from "react";
import { api, ApiError, type DetectionResult } from "@/lib/api";
import { DetectionScoreCard } from "@/components/ScoreCard";

export default function DetectorWorkspace() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  async function handleDetect() {
    setError(null);
    setLoading(true);
    try {
      const data = await api.detect(input);
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card flex flex-col p-6" aria-labelledby="detect-input-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="detect-input-heading" className="text-sm font-semibold text-ink-900">
            Text to analyze
          </h2>
          <span className="text-xs text-mist-400">{wordCount} words</span>
        </div>
        <label htmlFor="detect-text" className="sr-only">
          Text to analyze for AI generation probability
        </label>
        <textarea
          id="detect-text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to check for AI-generated content…"
          rows={14}
          maxLength={15000}
          className="w-full flex-1 resize-none rounded-lg border border-mist-200 p-4 text-sm leading-relaxed text-ink-900 focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={handleDetect}
          disabled={loading || input.trim().length === 0}
          className="btn-primary mt-4 self-end"
        >
          {loading ? "Analyzing…" : "Analyze text"}
        </button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-signal-red">
            {error}
          </p>
        )}
      </section>

      <section aria-labelledby="detect-output-heading">
        <h2 id="detect-output-heading" className="sr-only">
          Detection results
        </h2>
        {!result && (
          <div className="card p-6 text-sm text-mist-400">
            Your AI-detection score and metric breakdown will appear here.
          </div>
        )}
        {result && <DetectionScoreCard title="Zyrstar AI Detection Score" result={result} />}
      </section>
    </div>
  );
}
