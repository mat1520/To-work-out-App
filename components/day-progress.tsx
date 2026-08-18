"use client";

import { useEffect, useState } from "react";

export default function DayProgress({ hechas, total }: { hechas: number; total: number }) {
  const [ancho, setAncho] = useState(0);
  const completo = total > 0 && hechas >= total;

  useEffect(() => {
    const objetivo = total > 0 ? Math.min(100, (hechas / total) * 100) : 0;
    const raf = requestAnimationFrame(() => setAncho(objetivo));
    return () => cancelAnimationFrame(raf);
  }, [hechas, total]);

  return (
    <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white py-2 pl-4 pr-2 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="shrink-0 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {hechas} de {total} series
      </p>
      <div
        role="progressbar"
        aria-label="Series completadas hoy"
        aria-valuenow={hechas}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${
            completo ? "bg-green-500" : "bg-orange-500"
          }`}
          style={{ width: `${ancho}%` }}
        />
      </div>
      {completo ? (
        <span className="shrink-0 text-xs font-bold text-green-600 dark:text-green-400">
          Día completo
        </span>
      ) : null}
    </div>
  );
}