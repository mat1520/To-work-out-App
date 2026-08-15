'use server';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/lib/routines';
import { redirect } from 'next/navigation';
import type { Objetivo } from '@/lib/types';

export interface ProfileInput {
  edad: number; pesoActual: number; altura: number; genero: string;
  objetivo: Objetivo; diasPorSemana: number; nivelActividad: string;
}

export async function completeOnboarding(input: ProfileInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error: pErr } = await supabase.from('users_profile').insert({
    id: user.id, edad: input.edad, peso_actual: input.pesoActual, altura: input.altura,
    genero: input.genero, objetivo: input.objetivo, dias_por_semana: input.diasPorSemana,
    nivel_actividad: input.nivelActividad,
  });
  if (pErr) throw pErr;
  const template = getTemplate(input.diasPorSemana, input.objetivo);
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