"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveLog } from "@/actions/logs";
import { isNewPr } from "@/lib/progress";

interface RecordInputProps {
  ejercicioId: string;
  nombre: string;
  gifUrl?: string;
  prevPeso: number | null;
  prevReps: number | null;
}

export default function RecordInput({
  ejercicioId,
  nombre,
  gifUrl,
  prevPeso,
  prevReps,
}: RecordInputProps) {
  const router = useRouter();
  const [peso, setPeso] = useState("");
  const [reps, setReps] = useState("");
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pr, setPr] = useState(false);
  const prTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (prTimer.current) clearTimeout(prTimer.current);
    };
  }, []);

  const pesoNum = parseFloat(peso);
  const repsNum = parseInt(reps, 10);
  const valid =
    !Number.isNaN(pesoNum) &&
    pesoNum > 0 &&
    !Number.isNaN(repsNum) &&
    repsNum > 0;
  const esPR =
    valid && prevPeso !== null && prevReps !== null && isNewPr(prevPeso, prevReps, pesoNum, repsNum);

  async function handleSave() {
    if (!valid) return;
    setSaveError(null);
    setPending(true);
    try {
      await saveLog(ejercicioId, pesoNum, repsNum);
      if (esPR) {
        setPr(true);
        if (prTimer.current) clearTimeout(prTimer.current);
        prTimer.current = setTimeout(() => setPr(false), 2500);
      }
      setPeso("");
      setReps("");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo guardar la serie.");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100";

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <header className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
          {gifUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gifUrl} alt={nombre} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-400 dark:text-zinc-500">
              {nombre.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">{nombre}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {prevPeso !== null && prevReps !== null
              ? `Último: ${prevPeso} kg x ${prevReps} reps`
              : "Sin registros previos"}
          </p>
        </div>
      </header>

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Peso (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            step={0.5}
            min={0}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="0"
            aria-label={`Peso levantado en ${nombre}`}
            className={inputClass}
          />
        </label>
        <label className="flex w-20 flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Reps</span>
          <input
            type="number"
            inputMode="numeric"
            step={1}
            min={1}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="0"
            aria-label={`Repeticiones en ${nombre}`}
            className={inputClass}
          />
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={!valid || pending}
          className="h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition enabled:hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          {pending ? "Guardando..." : "Guardar Serie"}
        </button>
      </div>

      {pr && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        >
          ¡Nuevo PR!
        </p>
      )}
      {saveError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {saveError}
        </p>
      )}
    </section>
  );
}