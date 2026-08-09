"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/movements", label: "Movimientos" },
  { href: "/accounts", label: "Cuentas" },
  { href: "/business-lines", label: "Líneas" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gold/15 bg-ink/95 backdrop-blur sm:relative sm:mb-8 sm:rounded-2xl sm:border sm:bg-ink-light/70">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-2 sm:px-4">
        <div className="flex flex-1 justify-around sm:justify-start sm:gap-1">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-2 py-3 font-label text-[10px] uppercase tracking-widest2 transition-colors sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-[11px] ${
                  active
                    ? "text-amber sm:border sm:border-amber/40 sm:bg-amber/10"
                    : "text-stone hover:text-champagne"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full sm:hidden ${active ? "bg-amber" : "bg-transparent"}`}
                />
                {tab.label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={handleLogout}
          className="hidden font-label text-[11px] uppercase tracking-widest2 text-stone transition-colors hover:text-champagne sm:block"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
