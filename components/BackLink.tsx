import Link from "next/link";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 font-label text-xs uppercase tracking-widest2 text-stone transition-colors hover:text-champagne"
    >
      ← {label}
    </Link>
  );
}
