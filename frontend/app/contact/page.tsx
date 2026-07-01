import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Zyrstar team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="text-3xl font-bold text-ink-900">Contact us</h1>
      <p className="mt-4 text-mist-500">
        Questions, feedback, or partnership inquiries? Reach us at{" "}
        <a href="mailto:hello@zyrstar.com" className="font-medium text-ink-900">
          hello@zyrstar.com
        </a>
        .
      </p>
    </div>
  );
}
