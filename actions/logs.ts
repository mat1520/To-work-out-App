// actions/logs.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function saveLog(ejercicioId: string, peso: number, reps: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('workout_logs').insert({
    id_usuario: user.id, id_ejercicio: ejercicioId, peso_levantado: peso, reps_logradas: reps,
  });
  if (error) throw error;
}
