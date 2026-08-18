"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav({ primerDiaSlug }: { primerDiaSlug: string | null }) {
  const pathname = usePathname();

  const workoutHref = primerDiaSlug ? `/workout/${primerDiaSlug}` : "/rutinas";

  const linkClass = (href: string) =>
    `flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
      pathname.startsWith(href)
        ? "text-orange-600 dark:text-orange-400"
        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Link href="/dashboard" className={linkClass("/dashboard")}>
        Dashboard
      </Link>
      <Link href={workoutHref} className={linkClass("/workout")}>
        Entrenar
      </Link>
      <Link href="/rutinas" className={linkClass("/rutinas")}>
        Rutinas
      </Link>
      <Link href="/perfil" className={linkClass("/perfil")}>
        Perfil
      </Link>
    </nav>
  );
}
