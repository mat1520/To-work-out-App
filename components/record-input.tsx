"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveLog } from "@/actions/logs";
import { isNewPr } from "@/lib/progress";

interface RecordInputProps {
  ejercicioId: string;
  nombre: string;
  prevPeso: number | null;
  prevReps: number | null;
  seriesHoy: number;
  seriesObjetivo: number;
}

export default function RecordInput({
  ejercicioId,
  nombre,
  prevPeso,
  prevReps,
  seriesHoy,
  seriesObjetivo,
}: RecordInputProps) {
  const router = useRouter();
  const [peso, setPeso] = useState("");
  const [reps, setReps] = useState("");
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pr, setPr] = useState(false);
  const [saved, setSaved] = useState(false);
  const prTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (prTimer.current) clearTimeout(prTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
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
  const objetivoCumplido = seriesObjetivo > 0 && seriesHoy >= seriesObjetivo;
  const progreso =
    seriesObjetivo > 0 ? Math.min(100, (seriesHoy / seriesObjetivo) * 100) : 0;

  async function handleSave() {
    if (!valid) return;
    setSaveError(null);
    setPending(true);
    try {
      await saveLog(ejercicioId, pesoNum, repsNum);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 400);
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
    "h-full w-full bg-transparent px-3 text-lg font-semibold text-zinc-900 outline-none dark:text-zinc-50";

  return (
    <section className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {prevPeso !== null && prevReps !== null
          ? `Último: ${prevPeso} kg × ${prevReps} reps`
          : "Sin registros previos"}
      </p>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Peso (kg)</span>
            <div className="flex h-14 items-center rounded-xl border border-zinc-200 bg-white transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950">
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
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Reps</span>
            <div className="flex h-14 items-center rounded-xl border border-zinc-200 bg-white transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 dark:border-zinc-800 dark:bg-zinc-950">
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
            </div>
          </label>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!valid || pending}
          className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wide transition-colors duration-150 enabled:hover:bg-orange-400 disabled:opacity-50 ${
            saved ? "bg-green-500 text-zinc-950" : "bg-orange-500 text-zinc-950"
          }`}
        >
          {saved ? (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span>Serie guardada</span>
            </>
          ) : pending ? (
            "Guardando..."
          ) : (
            "Guardar Serie"
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <p
          className={`text-xs font-semibold ${
            objetivoCumplido
              ? "text-green-600 dark:text-green-400"
              : "text-zinc-600 dark:text-zinc-300"
          }`}
        >
          {objetivoCumplido
            ? "Objetivo de hoy cumplido"
            : `Series de hoy: ${seriesHoy} / ${seriesObjetivo}`}
        </p>
        <div
          role="progressbar"
          aria-label={`Progreso de series de hoy en ${nombre}`}
          aria-valuenow={seriesHoy}
          aria-valuemin={0}
          aria-valuemax={seriesObjetivo}
          className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${progreso}%` }}
          />
        </div>
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