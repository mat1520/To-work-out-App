"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface RoutineItemInput {
  ejercicioId: string;
  series: number;
  reps: number;
}

export interface ExerciseSearchResult {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
}

export async function searchExercises(term: string): Promise<ExerciseSearchResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises_catalog")
    .select("id,name,body_part,equipment")
    .ilike("name", `%${term}%`)
    .limit(10);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    body_part: row.body_part,
    equipment: row.equipment,
  }));
}

export async function saveRoutineDay(dia: string, items: RoutineItemInput[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: deleteError } = await supabase
    .from("user_routines")
    .delete()
    .eq("id_usuario", user.id)
    .eq("dia", dia);
  if (deleteError) throw new Error(deleteError.message);

  if (items.length === 0) return;

  const { error } = await supabase.from("user_routines").insert(
    items.map((item) => ({
      id_usuario: user.id,
      dia,
      id_ejercicio: item.ejercicioId,
      series_objetivo: item.series,
      reps_objetivo: item.reps,
    })),
  );
  if (error) throw new Error(error.message);
}