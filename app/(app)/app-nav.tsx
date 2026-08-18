"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_CLASS = "h-5 w-5";

const HomeIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const DumbbellIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
  </svg>
);

const CalendarIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M16 2.5v4M8 2.5v4M3 10h18" />
  </svg>
);

const UserIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function AppNav({ primerDiaSlug }: { primerDiaSlug: string | null }) {
  const pathname = usePathname();

  const workoutHref = primerDiaSlug ? `/workout/${primerDiaSlug}` : "/rutinas";

  const items = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon, isActive: pathname.startsWith("/dashboard") },
    { href: workoutHref, label: "Entrenar", icon: DumbbellIcon, isActive: pathname.startsWith("/workout") },
    { href: "/rutinas", label: "Rutinas", icon: CalendarIcon, isActive: pathname === "/rutinas" },
    { href: "/perfil", label: "Perfil", icon: UserIcon, isActive: pathname.startsWith("/perfil") },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex">
        {items.map(({ href, label, icon, isActive }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150 ${
              isActive
                ? "font-semibold text-orange-500 dark:text-orange-400"
                : "font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
            }`}
          >
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-orange-500 dark:bg-orange-400"
              />
            ) : null}
            {icon}
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}