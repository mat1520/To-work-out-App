// lib/routines.ts
import type { Objetivo } from '@/lib/types';

export interface RoutineItem { ejercicioId: string; series: number; reps: number }
export interface RoutineDay { dia: string; items: RoutineItem[] }

const COMPOUNDS = new Set(['0025', '0043', '0032', '0085', '0091', '0027']);

const DAYS: Record<string, string[]> = {
  'Full Body A': ['0043', '0025', '0027', '0294', '0201'],
  'Full Body B': ['0085', '0091', '0652', '0334'],
  'Push A': ['0025', '0091', '0201', '0334'],
  'Pull A': ['0027', '0652', '0294', '2330'],
  'Legs A': ['0043', '0085', '1409', '1385'],
  'Push B': ['0047', '0091', '0201', '0334'],
  'Pull B': ['0032', '0652', '0294', '2330'],
  'Legs B': ['0043', '0085', '1409', '1385'],
};

const SCHEDULES: Record<number, string[]> = {
  1: ['Full Body A'],
  2: ['Full Body A', 'Full Body B'],
  3: ['Full Body A', 'Full Body B', 'Full Body A'],
  4: ['Push A', 'Pull A', 'Legs A', 'Full Body A'],
  5: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B'],
  6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
  7: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Full Body A'],
};

function seriesReps(objetivo: Objetivo, isCompound: boolean) {
  if (objetivo === 'potencia') return isCompound ? { series: 5, reps: 5 } : { series: 3, reps: 8 };
  if (objetivo === 'hipertrofia') return isCompound ? { series: 4, reps: 8 } : { series: 3, reps: 12 };
  return isCompound ? { series: 4, reps: 6 } : { series: 3, reps: 10 };
}

export function getTemplate(diasPorSemana: number, objetivo: Objetivo): RoutineDay[] {
  return (SCHEDULES[diasPorSemana] ?? SCHEDULES[3]).map((dia) => ({
    dia,
    items: DAYS[dia].map((ejercicioId) => ({
      ejercicioId,
      ...seriesReps(objetivo, COMPOUNDS.has(ejercicioId)),
    })),
  }));
}