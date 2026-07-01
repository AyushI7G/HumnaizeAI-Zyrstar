import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-ink-900">404</h1>
      <p className="mt-4 text-mist-500">This page doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
