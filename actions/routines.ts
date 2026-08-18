"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { vInt, vTextoNoVacio } from "@/lib/validate";

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

  const diaValido = vTextoNoVacio(dia, "Día");
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Debes agregar al menos un ejercicio.");
  }
  const itemsValidos = items.map((item, i) => ({
    id_ejercicio: vTextoNoVacio(item?.ejercicioId, `Ejercicio ${i + 1}`),
    series_objetivo: vInt(item?.series, 1, 20, `Series del ejercicio ${i + 1}`),
    reps_objetivo: vInt(item?.reps, 1, 100, `Reps del ejercicio ${i + 1}`),
  }));

  const { error: deleteError } = await supabase
    .from("user_routines")
    .delete()
    .eq("id_usuario", user.id)
    .eq("dia", diaValido);
  if (deleteError) throw new Error(deleteError.message);

  const { error } = await supabase.from("user_routines").insert(
    itemsValidos.map((item) => ({
      id_usuario: user.id,
      dia: diaValido,
      id_ejercicio: item.id_ejercicio,
      series_objetivo: item.series_objetivo,
      reps_objetivo: item.reps_objetivo,
    })),
  );
  if (error) throw new Error(error.message);
}