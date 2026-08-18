'use server';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/lib/routines';
import { redirect } from 'next/navigation';
import { vEnum, vInt, vNumeroPositivo } from '@/lib/validate';
import type { Objetivo } from '@/lib/types';

export interface ProfileInput {
  edad: number; pesoActual: number; altura: number; genero: string;
  objetivo: Objetivo; diasPorSemana: number; nivelActividad: string;
}

const GENEROS = ['masculino', 'femenino', 'otro'] as const;
const OBJETIVOS = ['hipertrofia', 'potencia', 'ambos'] as const;
const NIVELES_ACTIVIDAD = ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'] as const;

export async function completeOnboarding(input: ProfileInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const edad = vInt(input.edad, 13, 100, 'Edad');
  const pesoActual = vNumeroPositivo(input.pesoActual, 'Peso actual');
  const altura = vNumeroPositivo(input.altura, 'Altura');
  if (altura > 2.5) throw new Error('La altura debe ser menor o igual a 2.5 metros.');
  const genero = vEnum(input.genero, GENEROS, 'Género');
  const objetivo = vEnum(input.objetivo, OBJETIVOS, 'Objetivo') as Objetivo;
  const diasPorSemana = vInt(input.diasPorSemana, 1, 7, 'Días por semana');
  const nivelActividad = vEnum(input.nivelActividad, NIVELES_ACTIVIDAD, 'Nivel de actividad');
  const { error: pErr } = await supabase.from('users_profile').upsert({
    id: user.id, edad, peso_actual: pesoActual, altura,
    genero, objetivo, dias_por_semana: diasPorSemana,
    nivel_actividad: nivelActividad,
  }, { onConflict: 'id' });
  if (pErr) throw pErr;
  const template = getTemplate(diasPorSemana, objetivo);
  const rows = template.flatMap((day) =>
    day.items.map((it) => ({
      id_usuario: user.id, dia: day.dia, id_ejercicio: it.ejercicioId,
      series_objetivo: it.series, reps_objetivo: it.reps,
    })),
  );
  const { error: rErr } = await supabase.from('user_routines').insert(rows);
  if (rErr) throw rErr;
  redirect('/dashboard');
}

export async function updatePeso(pesoActual: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const peso = vNumeroPositivo(pesoActual, 'Peso actual');
  const { error } = await supabase
    .from('users_profile')
    .update({ peso_actual: peso })
    .eq('id', user.id);
  if (error) throw error;
}