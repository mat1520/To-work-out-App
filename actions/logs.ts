// actions/logs.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { vInt, vTextoNoVacio } from '@/lib/validate';

export async function saveLog(ejercicioId: string, peso: number, reps: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const idEjercicio = vTextoNoVacio(ejercicioId, 'Ejercicio');
  if (typeof peso !== 'number' || !Number.isFinite(peso) || peso < 0) {
    throw new Error('El peso levantado debe ser un número mayor o igual a 0.');
  }
  const repsLogradas = vInt(reps, 1, 1000, 'Reps logradas');
  const { error } = await supabase.from('workout_logs').insert({
    id_usuario: user.id, id_ejercicio: idEjercicio, peso_levantado: peso, reps_logradas: repsLogradas,
  });
  if (error) throw error;
}
