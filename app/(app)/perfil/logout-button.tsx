"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState(false);

  async function handleLogout() {
    setError(false);
    try {
      await createClient().auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setError(true);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleLogout}
        className="h-11 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 transition enabled:hover:border-red-400 enabled:hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300 dark:enabled:hover:border-red-500 dark:enabled:hover:text-red-400"
      >
        Cerrar sesión
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          No se pudo cerrar sesión. Inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}