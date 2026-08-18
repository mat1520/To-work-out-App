"use client";

import { useState } from "react";
import RecordInput from "@/components/record-input";

export interface SavedSet {
  peso: number;
  reps: number;
}

interface ExerciseCardProps {
  ejercicioId: string;
  nombre: string;
  gifUrl?: string;
  musculo?: string;
  equipo?: string;
  objetivo?: string;
  prevPeso: number | null;
  prevReps: number | null;
  seriesHoy: number;
  seriesObjetivo: number;
  savedSets: SavedSet[];
  nuevoRecord: number | null;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ExerciseCard({
  ejercicioId,
  nombre,
  gifUrl,
  musculo,
  equipo,
  objetivo,
  prevPeso,
  prevReps,
  seriesHoy,
  seriesObjetivo,
  savedSets,
  nuevoRecord,
}: ExerciseCardProps) {
  const [gifError, setGifError] = useState(false);
  const gifDisponible = Boolean(gifUrl) && !gifError;

  return (
    <section
      aria-label={nombre}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {gifDisponible ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gifUrl}
            alt={nombre}
            loading="lazy"
            onError={() => setGifError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-10 w-10 text-zinc-300 dark:text-zinc-600"
            >
              <path d="M14.4 14.4 9.6 9.6" />
              <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
              <path d="m21.5 21.5-1.4-1.4" />
              <path d="M3.9 3.9 2.5 2.5" />
              <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
            </svg>
            <span className="px-4 text-center text-sm font-medium text-zinc-400 dark:text-zinc-500">
              {nombre}
            </span>
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent"
        />
        <h2 className="absolute left-3 top-2.5 max-w-[72%] truncate font-display text-xl font-bold uppercase tracking-tight text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.5)]">
          {nombre}
        </h2>
        {nuevoRecord !== null ? (
          <span className="absolute right-3 top-2.5 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-zinc-950 shadow-md shadow-black/20">
            Nuevo PR · {nuevoRecord} kg
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {musculo ? (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {capitalize(musculo)}
            </span>
          ) : null}
          {equipo ? (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {equipo}
            </span>
          ) : null}
          {objetivo ? (
            <span className="ml-auto text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Meta: {objetivo}
            </span>
          ) : null}
        </div>

        {savedSets.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label={`Series guardadas de ${nombre}`}>
            {savedSets.map((set, i) => (
              <li
                key={`${i}-${set.peso}-${set.reps}`}
                className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <span>Set {i + 1}</span>
                <strong className="font-bold text-zinc-900 dark:text-zinc-50">{set.peso} kg</strong>
                <span>× {set.reps}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <RecordInput
          ejercicioId={ejercicioId}
          nombre={nombre}
          prevPeso={prevPeso}
          prevReps={prevReps}
          seriesHoy={seriesHoy}
          seriesObjetivo={seriesObjetivo}
        />
      </div>
    </section>
  );
}