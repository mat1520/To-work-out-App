// lib/progress.ts
import type { LogRow } from '@/lib/types';

export function getLastRecord(ejercicioId: string, logs: LogRow[]) {
  const mine = logs
    .filter((l) => l.id_ejercicio === ejercicioId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.id ?? '').localeCompare(a.id ?? ''));
  if (mine.length === 0) return null;
  return { peso: mine[0].peso_levantado, reps: mine[0].reps_logradas, fecha: mine[0].fecha };
}

export function buildBanner(last: { peso: number; reps: number } | null) {
  if (!last) return 'Primera vez con este ejercicio. ¡Registra tu base!';
  return `Tu último récord fue ${last.peso} kg x ${last.reps} reps. Meta de hoy: superarlo.`;
}

export function isNewPr(prevPeso: number, prevReps: number, peso: number, reps: number) {
  return peso > prevPeso || (peso === prevPeso && reps > prevReps);
}