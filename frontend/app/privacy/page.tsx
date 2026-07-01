import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Zyrstar's privacy policy covering data collection, use, and retention.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-2xl py-16 prose prose-neutral">
      <h1 className="text-3xl font-bold text-ink-900">Privacy Policy</h1>
      <p className="mt-4 text-mist-500">
        This policy explains what data Zyrstar collects, how it is used, and the choices
        available to you. Replace this placeholder copy with counsel-reviewed language before
        launch — this section is a structural starting point, not legal advice.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-ink-900">Data we collect</h2>
      <p className="mt-2 text-mist-500">
        Account information (name, email, hashed password), text you submit to the Humanizer or
        Detector for processing, and standard technical logs (IP address, user agent) for
        security and abuse prevention.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-ink-900">How we use it</h2>
      <p className="mt-2 text-mist-500">
        To provide the humanization and detection services, secure your account, enforce usage
        limits, and improve the underlying models. We do not sell your text or personal data.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-ink-900">Advertising</h2>
      <p className="mt-2 text-mist-500">
        Zyrstar may display ads served by Google AdSense. Google may use cookies to serve ads
        based on your prior visits to this or other websites. You can opt out of personalized
        advertising through Google&apos;s Ads Settings.
      </p>
    </div>
  );
}
