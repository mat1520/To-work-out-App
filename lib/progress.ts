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

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export function getStreak(logs: { fecha: string }[], hoy: string): number {
  const dias = new Set(logs.map((l) => l.fecha));
  // Comparación de días calendario en UTC para evitar bugs de timezone
  let cursor = new Date(`${hoy}T00:00:00Z`);
  if (!dias.has(toISODate(cursor))) {
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    if (!dias.has(toISODate(cursor))) return 0;
  }
  let streak = 0;
  while (dias.has(toISODate(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

export function detectPRs(
  logs: { id_ejercicio: string; fecha: string; peso_levantado: number }[],
): Array<{ id_ejercicio: string; fecha: string; peso: number }> {
  const ordenados = [...logs].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const diasPorEjercicio = new Map<string, { fecha: string; max: number }[]>();
  for (const l of ordenados) {
    const dias = diasPorEjercicio.get(l.id_ejercicio) ?? [];
    const ultimo = dias.at(-1);
    if (ultimo && ultimo.fecha === l.fecha) {
      ultimo.max = Math.max(ultimo.max, l.peso_levantado);
    } else {
      dias.push({ fecha: l.fecha, max: l.peso_levantado });
    }
    diasPorEjercicio.set(l.id_ejercicio, dias);
  }
  const prs: Array<{ id_ejercicio: string; fecha: string; peso: number }> = [];
  for (const [idEjercicio, dias] of diasPorEjercicio) {
    let maxAnterior = -Infinity;
    for (const dia of dias) {
      if (maxAnterior !== -Infinity && dia.max > maxAnterior) {
        prs.push({ id_ejercicio: idEjercicio, fecha: dia.fecha, peso: dia.max });
      }
      maxAnterior = Math.max(maxAnterior, dia.max);
    }
  }
  return prs;
}

export function getLogros(
  logs: { id_ejercicio: string; fecha: string; peso_levantado: number }[],
  streak: number,
): Array<{ id: string; titulo: string; desbloqueado: boolean }> {
  const dias = new Set(logs.map((l) => l.fecha)).size;
  const prCount = detectPRs(logs).length;
  return [
    { id: 'primer_entrenamiento', titulo: 'Primer entrenamiento', desbloqueado: dias >= 1 },
    { id: 'diez_entrenamientos', titulo: '10 entrenamientos', desbloqueado: dias >= 10 },
    { id: 'primer_pr', titulo: 'Primer PR', desbloqueado: prCount >= 1 },
    { id: 'racha_3', titulo: 'Racha de 3 días', desbloqueado: streak >= 3 },
    { id: 'racha_7', titulo: 'Racha de 7 días', desbloqueado: streak >= 7 },
  ];
}