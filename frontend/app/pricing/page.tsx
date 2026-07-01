import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Zyrstar's AI Humanizer and AI Detection Engine.",
  alternates: { canonical: "/pricing" },
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    words: "1,000 words / month",
    features: ["AI Humanizer", "AI Detector", "Metric breakdown"],
  },
  {
    name: "Pro",
    price: "$19",
    words: "50,000 words / month",
    features: ["Everything in Free", "Priority processing", "Document history"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "$49",
    words: "200,000 words / month",
    features: ["Everything in Pro", "Team seats", "API access"],
  },
];

export default function PricingPage() {
  return (
    <div className="container-page py-16">
      <h1 className="text-center text-4xl font-bold text-ink-900">Simple, transparent pricing</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-mist-500">
        Start free. Upgrade when you need more words.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card p-8 ${plan.highlighted ? "border-2 border-ink-900 shadow-elevated" : ""}`}
          >
            <h2 className="text-lg font-semibold text-ink-900">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold text-ink-900">
              {plan.price}
              <span className="text-base font-normal text-mist-400">/mo</span>
            </p>
            <p className="mt-1 text-sm text-mist-500">{plan.words}</p>
            <ul className="mt-6 space-y-2 text-sm text-mist-500">
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary mt-8 w-full">
              Get started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
