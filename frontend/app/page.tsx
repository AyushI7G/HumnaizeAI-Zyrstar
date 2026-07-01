import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Humanize AI Text & Detect AI Content",
  description:
    "Zyrstar's proprietary AI Humanizer rewrites AI-generated text to sound naturally human, while the AI Detection Engine scores text across eight linguistic signals — no third-party APIs.",
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    title: "Proprietary AI Humanizer",
    body: "Rewrites AI-flavored phrasing, varies sentence rhythm, and adjusts tone — while preserving your original meaning.",
  },
  {
    title: "Proprietary AI Detection Engine",
    body: "Analyzes perplexity, burstiness, semantic similarity, structure variation, vocabulary diversity, repetition, and coherence — all in-house, no third-party APIs.",
  },
  {
    title: "Transparent scoring",
    body: "See your Zyrstar Humanization Score and AI Detection Score with a full metric-by-metric breakdown, not just a black-box number.",
  },
  {
    title: "Built for speed",
    body: "A lightweight, CPU-only architecture means fast analysis without sacrificing accuracy or requiring GPU infrastructure.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="container-page py-20 text-center sm:py-28">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-6xl">
          Humanize AI text.
          <br />
          Detect it with confidence.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist-500">
          Zyrstar&apos;s in-house AI Humanizer and AI Detection Engine work together — rewrite
          AI-flavored writing into natural prose, and measure exactly how AI-generated any text is.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/humanizer" className="btn-primary">
            Try the Humanizer
          </Link>
          <Link href="/detector" className="btn-secondary">
            Try the AI Detector
          </Link>
        </div>
      </section>

      <section className="container-page pb-24" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="card p-6">
              <h3 className="text-lg font-semibold text-ink-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-mist-500">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
