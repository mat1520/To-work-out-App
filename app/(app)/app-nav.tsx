"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppNav({ primerDiaSlug }: { primerDiaSlug: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [signOutError, setSignOutError] = useState(false);

  const workoutHref = primerDiaSlug ? `/workout/${primerDiaSlug}` : "/rutinas";

  async function handleSignOut() {
    setSignOutError(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSignOutError(true);
    }
  }

  const linkClass = (href: string) =>
    `flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
      pathname.startsWith(href)
        ? "text-zinc-900 dark:text-zinc-50"
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
      <button
        type="button"
        onClick={handleSignOut}
        className="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium text-zinc-500 transition hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
      >
        Salir
      </button>
      {signOutError && (
        <p
          role="alert"
          className="fixed inset-x-0 bottom-16 mx-auto w-fit rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          No se pudo cerrar sesión. Inténtalo de nuevo.
        </p>
      )}
    </nav>
  );
}
