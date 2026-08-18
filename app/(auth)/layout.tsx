import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% -10%, rgba(249,115,22,0.18), transparent), radial-gradient(ellipse 45% 40% at 90% 25%, rgba(34,197,94,0.08), transparent), radial-gradient(ellipse 50% 40% at 5% 70%, rgba(249,115,22,0.07), transparent)",
        }}
      />
      <div className="relative flex w-full max-w-sm flex-col items-center">
        <Link
          href="/"
          className="group mb-8 flex flex-col items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/25 transition-colors group-hover:bg-orange-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-zinc-950"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
          <p className="text-center font-display text-2xl font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
            Sobrecarga<span className="text-orange-500">.</span>Progresiva
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Entrena. Supera. Crece.
          </p>
        </Link>
        <div className="w-full">{children}</div>
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
      </div>
    </main>
  );
}
