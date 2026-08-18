import type { Metadata } from "next";
import Link from "next/link";
import StrengthChart, { type StrengthPoint } from "@/components/strength-chart";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const COMPUESTOS = ["0025", "0043", "0032"] as const;

const formatFecha = (fecha: string) => {
  const [y, m, d] = fecha.split("-");
  return d && m && y ? `${d}/${m}/${y.slice(2)}` : fecha;
};

function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`font-display text-3xl font-bold tracking-tight ${
          accent ? "text-orange-500 dark:text-orange-400" : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="text-xs text-zinc-500 dark:text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id_ejercicio, fecha, peso_levantado, reps_logradas")
    .order("fecha", { ascending: true });

  const registros = logs ?? [];

  if (registros.length === 0) {
    const { data: rutinas } = await supabase.from("user_routines").select("dia");
    const dias = [...new Set((rutinas ?? []).map((r) => r.dia))];
    const primerDia = dias[0] ?? null;
    const slug = primerDia ? primerDia.toLowerCase().replace(/\s+/g, "-") : null;

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Dashboard</h1>
        <p className="max-w-sm text-center text-zinc-500 dark:text-zinc-400">
          Registra tu primer entrenamiento para ver tus estadísticas y tu curva de fuerza.
        </p>
        <Link
          href={slug ? `/workout/${slug}` : "/rutinas"}
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-400"
        >
          {slug ? "Ir a mi entrenamiento" : "Armar mi rutina"}
        </Link>
      </main>
    );
  }

  const compuestos = registros.filter((r) =>
    (COMPUESTOS as readonly string[]).includes(r.id_ejercicio),
  );
  const diasEntrenados = new Set(registros.map((r) => r.fecha));
  const ahora = new Date();
  const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const entradasSemana = [...diasEntrenados].filter((f) => f >= hace7).length;

  let volumen = 0;
  const volumenPorDia = new Map<string, number>();
  for (const r of registros) {
    const s = r.peso_levantado * r.reps_logradas;
    volumen += s;
    volumenPorDia.set(r.fecha, (volumenPorDia.get(r.fecha) ?? 0) + s);
  }
  const volumenPromedio = Math.round(volumen / diasEntrenados.size);
  const ultimaSesion = [...diasEntrenados].sort().at(-1) ?? "";

  const { data: catalogo } = await supabase
    .from("exercises_catalog")
    .select("id, name")
    .in("id", COMPUESTOS);
  const names = Object.fromEntries((catalogo ?? []).map((c) => [c.id, c.name]));

  const maxPorEjercicio = new Map<string, number>();
  for (const r of compuestos) {
    maxPorEjercicio.set(
      r.id_ejercicio,
      Math.max(maxPorEjercicio.get(r.id_ejercicio) ?? 0, r.peso_levantado),
    );
  }

  const maxPorDia = new Map<string, Map<string, number>>();
  for (const log of compuestos) {
    const porDia = maxPorDia.get(log.fecha) ?? new Map<string, number>();
    porDia.set(log.id_ejercicio, Math.max(porDia.get(log.id_ejercicio) ?? 0, log.peso_levantado));
    maxPorDia.set(log.fecha, porDia);
  }
  const puntos: StrengthPoint[] = [...maxPorDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, porDia]) => ({
      fecha,
      "0025": porDia.get("0025"),
      "0043": porDia.get("0043"),
      "0032": porDia.get("0032"),
    }));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Tus números de entrenamiento, con detalle.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard
          label="Entrenamientos"
          value={String(diasEntrenados.size)}
          hint={diasEntrenados.size === 1 ? "sesión registrada" : "sesiones registradas"}
        />
        <StatCard
          label="Esta semana"
          value={String(entradasSemana)}
          hint={`de los últimos 7 días · última: ${formatFecha(ultimaSesion)}`}
        />
        <StatCard
          label="Volumen total"
          value={volumen.toLocaleString("es-MX")}
          hint="kg levantados en total"
        />
        <StatCard
          label="Volumen promedio"
          value={volumenPromedio.toLocaleString("es-MX")}
          hint="kg por sesión"
        />
      </div>

      <section className="mt-6" aria-labelledby="maximos-title">
        <h2 id="maximos-title" className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Récords actuales
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {COMPUESTOS.map((id) => {
            const max = maxPorEjercicio.get(id);
            if (!max) return null;
            return (
              <div
                key={id}
                className="flex flex-col gap-0.5 rounded-2xl border border-orange-500/25 bg-orange-500/5 p-4"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {names[id] ?? id}
                </p>
                <p className="font-display text-3xl font-bold tracking-tight text-orange-500 dark:text-orange-400">
                  {max} kg
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">máximo registrado</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="curva-title">
        <h2 id="curva-title" className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Curva de fuerza
        </h2>
        <StrengthChart data={puntos} names={names} />
      </section>
    </main>
  );
}
