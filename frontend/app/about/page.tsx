import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Zyrstar",
  description: "Learn about Zyrstar's mission to build transparent, in-house AI writing tools.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="text-3xl font-bold text-ink-900">About Zyrstar</h1>
      <p className="mt-4 text-mist-500">
        Zyrstar builds writing tools centered on transparency. Our AI Humanizer and AI Detection
        Engine are developed entirely in-house — no third-party AI-detection APIs, no black-box
        scores. Every metric we show you is one we can explain.
      </p>
      <p className="mt-4 text-mist-500">
        We believe people should be able to see exactly why a piece of text scores the way it
        does, whether they&apos;re a student, a content team, or a solo writer trying to make AI
        assistance sound like themselves.
      </p>
    </div>
  );
}
