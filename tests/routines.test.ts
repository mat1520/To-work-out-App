import { describe, it, expect } from 'vitest';
import { getTemplate } from '@/lib/routines';

describe('getTemplate', () => {
  it('genera 3 días para 3 días/semana', () => {
    expect(getTemplate(3, 'hipertrofia')).toHaveLength(3);
  });
  it('genera PPL x2 para 6 días/semana', () => {
    expect(getTemplate(6, 'potencia').map((d) => d.dia)).toEqual(
      ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
    );
  });
  it('potencia = 5x5 en compuestos, 3x8 en accesorios', () => {
    const t = getTemplate(6, 'potencia');
    const bench = t[0].items.find((i) => i.ejercicioId === '0025');
    const lateral = t[0].items.find((i) => i.ejercicioId === '0334');
    expect(bench).toEqual({ ejercicioId: '0025', series: 5, reps: 5 });
    expect(lateral).toEqual({ ejercicioId: '0334', series: 3, reps: 8 });
  });
  it('hipertrofia = 4x8 en compuestos, 3x12 en accesorios', () => {
    const t = getTemplate(3, 'hipertrofia');
    const squat = t[0].items.find((i) => i.ejercicioId === '0043');
    expect(squat).toEqual({ ejercicioId: '0043', series: 4, reps: 8 });
  });
});