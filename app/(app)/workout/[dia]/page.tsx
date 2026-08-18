import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DayProgress from "@/components/day-progress";
import ExerciseCard from "@/components/exercise-card";
import { getLastRecord, isNewPr } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";
import type { LogRow } from "@/lib/types";

export const metadata: Metadata = { title: "Entrenamiento" };

const slugify = (dia: string) => dia.toLowerCase().replace(/\s+/g, "-");

function mejorDeHoy(ejercicioId: string, logs: LogRow[], hoyKey: string) {
  const hoy = logs.filter((l) => l.id_ejercicio === ejercicioId && l.fecha === hoyKey);
  if (hoy.length === 0) return null;
  return hoy.reduce((a, b) =>
    b.peso_levantado > a.peso_levantado ||
    (b.peso_levantado === a.peso_levantado && b.reps_logradas > a.reps_logradas)
      ? b
      : a
  );
}

function nuevoRecordDeHoy(ejercicioId: string, logs: LogRow[], hoyKey: string): number | null {
  const previos = logs.filter((l) => l.id_ejercicio === ejercicioId && l.fecha !== hoyKey);
  const anterior = getLastRecord(ejercicioId, previos);
  const mejor = mejorDeHoy(ejercicioId, logs, hoyKey);
  if (!anterior || !mejor) return null;
  if (!isNewPr(anterior.peso, anterior.reps, mejor.peso_levantado, mejor.reps_logradas)) return null;
  return mejor.peso_levantado;
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
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">Entrenamiento</h1>
        </header>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Aún no tienes rutinas. Completa el onboarding para generar tu plan de entrenamiento.
          </p>
          <Link
            href="/rutinas"
            className="h-11 cursor-pointer rounded-lg bg-orange-500 px-4 text-sm font-bold text-zinc-950 shadow-lg shadow-orange-500/25 transition enabled:hover:bg-orange-400"
          >
            Armar mi rutina
          </Link>
        </div>
      </main>
    );
  }

  const diaPorSlug = new Map<string, string>();
  for (const row of rows) diaPorSlug.set(slugify(row.dia), row.dia);
  const dias = [...new Set(rows.map((row) => row.dia))];
  const dia = diaPorSlug.get(slug);
  if (!dia) notFound();

  const dayRows = rows.filter((row) => row.dia === dia);
  const ids = [...new Set(dayRows.map((row) => row.id_ejercicio))];

  const { data: catalog } = await supabase
    .from("exercises_catalog")
    .select("id,name,gif_url,body_part,equipment")
    .in("id", ids);
  const byId = new Map((catalog ?? []).map((entry) => [entry.id, entry]));

  const { data: logRows } = await supabase
    .from("workout_logs")
    .select("id,id_ejercicio,fecha,peso_levantado,reps_logradas,created_at")
    .eq("id_usuario", user.id)
    .in("id_ejercicio", ids)
    .order("fecha", { ascending: true });
  type DayLogRow = LogRow & { created_at?: string };
  const logs: DayLogRow[] = logRows ?? [];

  const hoy = new Date();
  const hoyKey = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(
    hoy.getDate()
  ).padStart(2, "0")}`;
  const seriesHoyPorEjercicio = new Map<string, number>();
  for (const log of logs) {
    if (log.fecha === hoyKey) {
      seriesHoyPorEjercicio.set(
        log.id_ejercicio,
        (seriesHoyPorEjercicio.get(log.id_ejercicio) ?? 0) + 1
      );
    }
  }

  const seriesTotalDia = dayRows.reduce((acc, row) => acc + row.series_objetivo, 0);
  const seriesHechasHoy = dayRows.reduce(
    (acc, row) => acc + (seriesHoyPorEjercicio.get(row.id_ejercicio) ?? 0),
    0
  );

  const fechaLegible = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(hoy);
  const fechaCapitalizada = fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1);

  const cards = dayRows.map((row) => {
    const entry = byId.get(row.id_ejercicio);
    const savedSets = logs
      .filter((log) => log.id_ejercicio === row.id_ejercicio && log.fecha === hoyKey)
      .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))
      .map((log) => ({ peso: log.peso_levantado, reps: log.reps_logradas }));
    const last = getLastRecord(row.id_ejercicio, logs);
    const seriesHoy = seriesHoyPorEjercicio.get(row.id_ejercicio) ?? 0;
    return {
      id: row.id_ejercicio,
      nombre: entry?.name ?? row.id_ejercicio,
      gifUrl: entry?.gif_url ?? null,
      musculo: entry?.body_part ?? null,
      equipo: entry?.equipment ?? null,
      objetivo: `${row.series_objetivo} × ${row.reps_objetivo}`,
      prevPeso: last?.peso ?? null,
      prevReps: last?.reps ?? null,
      seriesHoy,
      seriesObjetivo: row.series_objetivo,
      savedSets,
      nuevoRecord: nuevoRecordDeHoy(row.id_ejercicio, logs, hoyKey),
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6">
      <nav
        aria-label="Días de la rutina"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {dias.map((d) => {
          const activo = d === dia;
          return (
            <Link
              key={d}
              href={`/workout/${slugify(d)}`}
              aria-current={activo ? "page" : undefined}
              className={`flex h-10 shrink-0 cursor-pointer items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                activo
                  ? "bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/25"
                  : "border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
              }`}
            >
              {d}
            </Link>
          );
        })}
      </nav>
      <header className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
            {dia}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{fechaCapitalizada}</p>
        </div>
        <DayProgress hechas={seriesHechasHoy} total={seriesTotalDia} />
      </header>
      {cards.map((card) => (
        <ExerciseCard
          key={card.id}
          ejercicioId={card.id}
          nombre={card.nombre}
          gifUrl={card.gifUrl ?? undefined}
          musculo={card.musculo ?? undefined}
          equipo={card.equipo ?? undefined}
          objetivo={card.objetivo}
          prevPeso={card.prevPeso}
          prevReps={card.prevReps}
          seriesHoy={card.seriesHoy}
          seriesObjetivo={card.seriesObjetivo}
          savedSets={card.savedSets}
          nuevoRecord={card.nuevoRecord}
        />
      ))}
    </main>
  );
}