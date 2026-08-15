import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import RecordInput from "@/components/record-input";
import { buildBanner, getLastRecord } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import type { LogRow } from "@/lib/types";

export const metadata: Metadata = { title: "Entrenamiento" };

const slugify = (dia: string) => dia.toLowerCase().replace(/\s+/g, "-");

function LastRecordBanner({ text, objetivo }: { text: string; objetivo: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{text}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Objetivo del día: {objetivo}</p>
    </div>
  );
}

export default async function WorkoutDayPage({ params }: { params: Promise<{ dia: string }> }) {
  const { dia: slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("user_routines")
    .select("id_ejercicio,series_objetivo,reps_objetivo,dia")
    .eq("id_usuario", user.id)
    .order("created_at", { ascending: true });

  if (!rows || rows.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Entrenamiento</h1>
        </header>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aún no tienes rutinas. Completa el onboarding para generar tu plan de entrenamiento.
          </p>
          <Link
            href="/rutinas"
            className="h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition enabled:hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
          >
            Armar mi rutina
          </Link>
        </div>
      </main>
    );
  }

  const diaPorSlug = new Map<string, string>();
  for (const row of rows) diaPorSlug.set(slugify(row.dia), row.dia);
  const dia = diaPorSlug.get(slug);
  if (!dia) notFound();

  const dayRows = rows.filter((row) => row.dia === dia);
  const ids = [...new Set(dayRows.map((row) => row.id_ejercicio))];

  const { data: catalog } = await supabase
    .from("exercises_catalog")
    .select("id,name,gif_url")
    .in("id", ids);
  const byId = new Map((catalog ?? []).map((entry) => [entry.id, entry]));

  const { data: logRows } = await supabase
    .from("workout_logs")
    .select("id_ejercicio,fecha,peso_levantado,reps_logradas")
    .eq("id_usuario", user.id)
    .in("id_ejercicio", ids)
    .order("fecha", { ascending: true });
  const logs: LogRow[] = logRows ?? [];

  const cards = dayRows.map((row) => {
    const entry = byId.get(row.id_ejercicio);
    const last = getLastRecord(row.id_ejercicio, logs);
    return {
      id: row.id_ejercicio,
      nombre: entry?.name ?? row.id_ejercicio,
      gifUrl: entry?.gif_url ?? null,
      objetivo: `${row.series_objetivo} × ${row.reps_objetivo}`,
      banner: buildBanner(last),
      prevPeso: last?.peso ?? null,
      prevReps: last?.reps ?? null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{dia}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Registra cada serie: peso y repeticiones para batir tu récord.
        </p>
      </header>
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col gap-2">
          <LastRecordBanner text={card.banner} objetivo={card.objetivo} />
          <RecordInput
            ejercicioId={card.id}
            nombre={card.nombre}
            gifUrl={card.gifUrl ?? undefined}
            prevPeso={card.prevPeso}
            prevReps={card.prevReps}
          />
        </div>
      ))}
    </main>
  );
}