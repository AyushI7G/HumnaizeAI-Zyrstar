import type { Metadata } from "next";
import DetectorWorkspace from "@/components/DetectorWorkspace";

export const metadata: Metadata = {
  title: "AI Detector — Check AI-Generation Probability",
  description:
    "Zyrstar's proprietary AI Detection Engine analyzes perplexity, burstiness, semantic similarity, and more to estimate the probability that text is AI-generated.",
  alternates: { canonical: "/detector" },
};

export default function DetectorPage() {
  return (
    <div className="container-page py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">AI Detector</h1>
        <p className="mt-2 text-mist-500">
          Paste any text to get a Zyrstar AI Detection Score with a full breakdown across eight
          linguistic signals.
        </p>
      </header>
      <DetectorWorkspace />
    </div>
  );
}
