import type { Metadata } from "next";
import Link from "next/link";
import StrengthChart, { type StrengthPoint } from "@/components/strength-chart";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const COMPUESTOS = ["0025", "0043", "0032"] as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id_ejercicio, fecha, peso_levantado")
    .in("id_ejercicio", COMPUESTOS)
    .order("fecha", { ascending: true });

  const registros = logs ?? [];

  if (registros.length === 0) {
    const { data: rutinas } = await supabase.from("user_routines").select("dia");
    const dias = [...new Set((rutinas ?? []).map((r) => r.dia))];
    const primerDia = dias[0] ?? null;
    const slug = primerDia ? primerDia.toLowerCase().replace(/\s+/g, "-") : null;

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="max-w-sm text-center text-zinc-500 dark:text-zinc-400">
          Registra tu primer entrenamiento para ver tu curva de fuerza.
        </p>
        <Link
          href={slug ? `/workout/${slug}` : "/rutinas"}
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {slug ? "Ir a mi entrenamiento" : "Armar mi rutina"}
        </Link>
      </main>
    );
  }

  const { data: catalogo } = await supabase
    .from("exercises_catalog")
    .select("id, name")
    .in("id", COMPUESTOS);
  const names = Object.fromEntries((catalogo ?? []).map((c) => [c.id, c.name]));

  const maxPorDia = new Map<string, Map<string, number>>();
  for (const log of registros) {
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
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Evolución de tu fuerza en los levantamientos principales.
      </p>
      <StrengthChart data={puntos} names={names} />
    </main>
  );
}