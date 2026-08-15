import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-zinc-200 px-6 py-10 text-center dark:border-zinc-800">
        <p className="text-5xl font-semibold text-zinc-900 dark:text-zinc-50">404</p>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Página no encontrada
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition enabled:hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}