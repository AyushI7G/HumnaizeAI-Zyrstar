import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/humanizer", label: "AI Humanizer" },
      { href: "/detector", label: "AI Detector" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-mist-200 bg-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="text-lg font-semibold text-ink-900">
            Zyrstar
          </Link>
          <p className="mt-3 text-sm text-mist-500">
            Proprietary AI humanization and AI-content detection, built in-house.
          </p>
        </div>
        {FOOTER_SECTIONS.map((section) => (
          <nav key={section.title} aria-label={section.title}>
            <h2 className="text-sm font-semibold text-ink-900">{section.title}</h2>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-mist-500 hover:text-ink-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-mist-200 py-6">
        <p className="container-page text-xs text-mist-400">
          © {new Date().getFullYear()} Zyrstar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
