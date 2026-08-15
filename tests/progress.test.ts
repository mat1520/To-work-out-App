import { describe, it, expect } from 'vitest';
import { getLastRecord, buildBanner, isNewPr } from '@/lib/progress';

const logs = [
  { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 80, reps_logradas: 8 },
  { id_ejercicio: '0025', fecha: '2026-08-08', peso_levantado: 85, reps_logradas: 6 },
];

describe('progress', () => {
  it('devuelve el registro más reciente por fecha', () => {
    expect(getLastRecord('0025', logs)).toEqual({ peso: 85, reps: 6, fecha: '2026-08-08' });
  });
  it('null si no hay registros', () => {
    expect(getLastRecord('0043', logs)).toBeNull();
  });
  it('banner con récord', () => {
    expect(buildBanner({ peso: 85, reps: 6 })).toBe('Tu último récord fue 85 kg x 6 reps. Meta de hoy: superarlo.');
  });
  it('banner primera vez', () => {
    expect(buildBanner(null)).toBe('Primera vez con este ejercicio. ¡Registra tu base!');
  });
  it('PR por más peso o mismas reps', () => {
    expect(isNewPr(85, 6, 90, 5)).toBe(true);
    expect(isNewPr(85, 6, 85, 7)).toBe(true);
    expect(isNewPr(85, 6, 85, 5)).toBe(false);
  });
});