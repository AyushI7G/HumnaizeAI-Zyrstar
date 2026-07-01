import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zyrstar.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zyrstar — Humanize AI Text & Detect AI Content",
    template: "%s | Zyrstar",
  },
  description:
    "Zyrstar's Humanize AI turns AI-generated text into natural, human-sounding writing, and its proprietary AI Detection Engine scores text for AI-generation probability across eight linguistic signals.",
  applicationName: "Zyrstar",
  keywords: [
    "humanize ai text",
    "ai humanizer",
    "ai content detector",
    "ai detection score",
    "bypass ai detection",
    "undetectable ai",
    "zyrstar",
  ],
  authors: [{ name: "Zyrstar" }],
  creator: "Zyrstar",
  publisher: "Zyrstar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Zyrstar",
    title: "Zyrstar — Humanize AI Text & Detect AI Content",
    description:
      "Turn AI-generated text into natural human writing and measure AI-generation probability with the Zyrstar Detection Engine.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zyrstar Humanize AI" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zyrstar — Humanize AI Text & Detect AI Content",
    description:
      "Turn AI-generated text into natural human writing and measure AI-generation probability with the Zyrstar Detection Engine.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0B",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Zyrstar Humanize AI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Zyrstar provides a proprietary AI Humanizer and AI Detection Engine to rewrite AI-generated text naturally and estimate AI-generation probability.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense — must remain in <head> on every page for site verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5391102490492056"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
