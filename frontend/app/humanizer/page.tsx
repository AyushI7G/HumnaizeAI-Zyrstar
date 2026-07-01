import type { Metadata } from "next";
import HumanizerWorkspace from "@/components/HumanizerWorkspace";

export const metadata: Metadata = {
  title: "AI Humanizer — Rewrite AI Text Naturally",
  description:
    "Paste AI-generated text and let Zyrstar's proprietary Humanizer rewrite it into natural, human-sounding prose while preserving meaning.",
  alternates: { canonical: "/humanizer" },
};

export default function HumanizerPage() {
  return (
    <div className="container-page py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">AI Humanizer</h1>
        <p className="mt-2 text-mist-500">
          Paste your text below. Zyrstar will rewrite AI-flavored phrasing, vary sentence rhythm, and
          adjust tone — while preserving your original meaning.
        </p>
      </header>
      <HumanizerWorkspace />
    </div>
  );
}
