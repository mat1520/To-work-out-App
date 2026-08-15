import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoutineDayEditor from "@/components/exercise-search";

interface DayGroup {
  dia: string;
  items: {
    id: string;
    nombre: string;
    series: number;
    reps: number;
    gifUrl: string | null;
  }[];
}

export default async function RutinasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("user_routines")
    .select("id,dia,id_ejercicio,series_objetivo,reps_objetivo")
    .eq("id_usuario", user.id)
    .order("created_at", { ascending: true });

  if (!rows || rows.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Mis rutinas</h1>
        </header>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aún no tienes rutinas. Completa el onboarding para generar tu plan de entrenamiento.
          </p>
          <Link
            href="/onboarding"
            className="h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition enabled:hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
          >
            Generar mi plan
          </Link>
        </div>
      </main>
    );
  }

  const ids = [...new Set(rows.map((row) => row.id_ejercicio))];
  const { data: catalog } = await supabase
    .from("exercises_catalog")
    .select("id,name,gif_url")
    .in("id", ids);
  const byId = new Map((catalog ?? []).map((entry) => [entry.id, entry]));

  const days: DayGroup[] = [];
  const byDay = new Map<string, DayGroup>();
  for (const row of rows) {
    let group = byDay.get(row.dia);
    if (!group) {
      group = { dia: row.dia, items: [] };
      byDay.set(row.dia, group);
      days.push(group);
    }
    const entry = byId.get(row.id_ejercicio);
    group.items.push({
      id: row.id_ejercicio,
      nombre: entry?.name ?? row.id_ejercicio,
      series: row.series_objetivo,
      reps: row.reps_objetivo,
      gifUrl: entry?.gif_url ?? null,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Mis rutinas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Agrega o quita ejercicios y ajusta series y repeticiones por día.
        </p>
      </header>
      {days.map((day) => (
        <RoutineDayEditor key={day.dia} dia={day.dia} items={day.items} />
      ))}
    </main>
  );
}