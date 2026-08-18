import { describe, it, expect } from 'vitest';
import { getLastRecord, buildBanner, isNewPr, getStreak, detectPRs, getLogros } from '@/lib/progress';

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

describe('getStreak', () => {
  const dias = [
    { fecha: '2026-08-10' },
    { fecha: '2026-08-11' },
    { fecha: '2026-08-12' },
    { fecha: '2026-08-14' },
    { fecha: '2026-08-15' },
  ];

  it('cuenta días consecutivos terminando en hoy', () => {
    expect(getStreak(dias, '2026-08-15')).toBe(2);
  });
  it('si hoy no tiene logs pero ayer sí, la racha vive desde ayer', () => {
    expect(getStreak(dias, '2026-08-16')).toBe(2);
  });
  it('racha rota si ni hoy ni ayer entrenaron', () => {
    expect(getStreak(dias, '2026-08-17')).toBe(0);
  });
  it('cuenta 3 días consecutivos hacia atrás', () => {
    expect(getStreak(dias, '2026-08-12')).toBe(3);
  });
  it('un solo día es racha 1', () => {
    expect(getStreak([{ fecha: '2026-08-10' }], '2026-08-10')).toBe(1);
  });
  it('cero sin logs', () => {
    expect(getStreak([], '2026-08-15')).toBe(0);
  });
});

describe('detectPRs', () => {
  const logs = [
    { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 80 },
    { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 75 },
    { id_ejercicio: '0043', fecha: '2026-08-01', peso_levantado: 100 },
    { id_ejercicio: '0025', fecha: '2026-08-08', peso_levantado: 85 },
    { id_ejercicio: '0025', fecha: '2026-08-15', peso_levantado: 82 },
    { id_ejercicio: '0025', fecha: '2026-08-22', peso_levantado: 90 },
  ];

  it('el primer día con datos no es PR', () => {
    const prs = detectPRs(logs);
    expect(prs.some((p) => p.id_ejercicio === '0025' && p.fecha === '2026-08-01')).toBe(false);
    expect(prs.some((p) => p.id_ejercicio === '0043' && p.fecha === '2026-08-01')).toBe(false);
  });
  it('marca PR cuando el máximo del día supera todo lo anterior', () => {
    expect(detectPRs(logs)).toContainEqual({ id_ejercicio: '0025', fecha: '2026-08-08', peso: 85 });
    expect(detectPRs(logs)).toContainEqual({ id_ejercicio: '0025', fecha: '2026-08-22', peso: 90 });
  });
  it('no marca PR un día que no supera el máximo anterior', () => {
    expect(detectPRs(logs).some((p) => p.id_ejercicio === '0025' && p.fecha === '2026-08-15')).toBe(false);
  });
});

describe('getLogros', () => {
  const unDia = [
    { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 80 },
    { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 85 },
  ];
  const diezDias = Array.from({ length: 10 }, (_, i) => ({
    id_ejercicio: '0025',
    fecha: `2026-07-${String(i + 1).padStart(2, '0')}`,
    peso_levantado: 60,
  }));

  it('todos bloqueados sin datos', () => {
    const logros = getLogros([], 0);
    expect(logros.every((l) => !l.desbloqueado)).toBe(true);
    expect(logros.map((l) => l.id)).toEqual([
      'primer_entrenamiento',
      'diez_entrenamientos',
      'primer_pr',
      'racha_3',
      'racha_7',
    ]);
  });
  it('primer entrenamiento con un día', () => {
    const logros = getLogros(unDia, 1);
    expect(logros.find((l) => l.id === 'primer_entrenamiento')?.desbloqueado).toBe(true);
    expect(logros.find((l) => l.id === 'primer_entrenamiento')?.titulo).toBe('Primer entrenamiento');
  });
  it('primer PR cuando un día posterior supera el máximo anterior', () => {
    const conPr = [
      { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 80 },
      { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 85 },
      { id_ejercicio: '0025', fecha: '2026-08-08', peso_levantado: 90 },
    ];
    expect(getLogros(conPr, 2).find((l) => l.id === 'primer_pr')?.desbloqueado).toBe(true);
    expect(getLogros(unDia, 1).find((l) => l.id === 'primer_pr')?.desbloqueado).toBe(false);
  });
  it('diez entrenamientos con 10 días', () => {
    expect(getLogros(diezDias, 10).find((l) => l.id === 'diez_entrenamientos')?.desbloqueado).toBe(true);
  });
  it('racha_3 y racha_7 según el streak', () => {
    expect(getLogros(unDia, 3).find((l) => l.id === 'racha_3')?.desbloqueado).toBe(true);
    expect(getLogros(unDia, 2).find((l) => l.id === 'racha_3')?.desbloqueado).toBe(false);
    expect(getLogros(unDia, 7).find((l) => l.id === 'racha_7')?.desbloqueado).toBe(true);
    expect(getLogros(unDia, 6).find((l) => l.id === 'racha_7')?.desbloqueado).toBe(false);
  });
});