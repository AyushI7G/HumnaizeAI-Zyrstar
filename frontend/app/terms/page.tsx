import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Zyrstar's terms of service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="text-3xl font-bold text-ink-900">Terms of Service</h1>
      <p className="mt-4 text-mist-500">
        By using Zyrstar, you agree to use the service lawfully and not to submit content you do
        not have the right to process. This placeholder should be replaced with counsel-reviewed
        terms before launch, covering acceptable use, liability limits, billing terms, and
        termination.
      </p>
    </div>
  );
}
