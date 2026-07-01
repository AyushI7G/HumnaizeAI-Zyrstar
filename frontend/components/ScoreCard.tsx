import clsx from "clsx";
import type { DetectionResult } from "@/lib/api";

function scoreColor(score: number) {
  if (score < 35) return "text-signal-green";
  if (score < 65) return "text-signal-amber";
  return "text-signal-red";
}

function ringColor(score: number) {
  if (score < 35) return "stroke-signal-green";
  if (score < 65) return "stroke-signal-amber";
  return "stroke-signal-red";
}

export function DetectionScoreCard({
  title,
  result,
}: {
  title: string;
  result: DetectionResult;
}) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (result.ai_probability / 100) * circumference;

  return (
    <div className="card p-6" role="region" aria-label={title}>
      <div className="flex items-center gap-6">
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`AI probability score: ${result.ai_probability} out of 100`}
        >
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E4E4E7" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            className={ringColor(result.ai_probability)}
          />
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className={clsx("text-xl font-bold", scoreColor(result.ai_probability))}
            fill="currentColor"
          >
            {Math.round(result.ai_probability)}
          </text>
        </svg>
        <div>
          <h3 className="text-sm font-semibold text-mist-500">{title}</h3>
          <p className={clsx("text-lg font-semibold", scoreColor(result.ai_probability))}>
            {result.verdict}
          </p>
          <p className="text-xs text-mist-400">
            {result.word_count} words · {result.sentence_count} sentences · confidence: {result.confidence}
          </p>
        </div>
      </div>

      {result.metrics.length > 0 && (
        <dl className="mt-6 space-y-3">
          {result.metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex items-center justify-between text-sm">
                <dt className="font-medium text-ink-900">{metric.label}</dt>
                <dd className="text-mist-500">{Math.round(metric.score)}/100</dd>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-mist-100">
                <div
                  className={clsx("h-1.5 rounded-full", scoreColor(metric.score).replace("text-", "bg-"))}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-mist-400">{metric.description}</p>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function HumanizationScoreBadge({ score }: { score: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-4 py-2 shadow-soft">
      <span className="text-xs font-medium text-mist-500">Zyrstar Humanization Score</span>
      <span className={clsx("text-sm font-bold", scoreColor(100 - score))}>{Math.round(score)}/100</span>
    </div>
  );
}
