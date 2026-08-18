import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 block">
        <p className="font-display text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
          Sobrecarga<span className="text-orange-500">.</span>Progresiva
        </p>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
        Hecho por{" "}
        <Link
          href="https://github.com/mat1520"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-zinc-700 underline decoration-orange-500/50 underline-offset-2 transition hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-400"
        >
          mat1520
        </Link>
      </p>
    </main>
  );
}