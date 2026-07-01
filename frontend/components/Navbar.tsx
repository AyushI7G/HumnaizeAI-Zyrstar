import Link from "next/link";

const NAV_LINKS = [
  { href: "/humanizer", label: "Humanizer" },
  { href: "/detector", label: "AI Detector" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-mist-200 bg-mist-50/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="container-page flex h-16 items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink-900">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-sm font-bold text-white"
          >
            Z
          </span>
          <span className="text-lg">Zyrstar</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-mist-500 transition-colors hover:text-ink-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-ink-900 sm:inline-block">
            Log in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
