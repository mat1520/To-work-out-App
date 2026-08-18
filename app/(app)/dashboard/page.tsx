import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import StrengthChart, { type StrengthPoint } from "@/components/strength-chart";
import { detectPRs, getLogros, getStreak } from "@/lib/progress";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const COMPUESTOS = ["0025", "0043", "0032"] as const;

const OBJETIVOS: Record<string, string> = {
  hipertrofia: "Hipertrofia",
  potencia: "Potencia",
  ambos: "Hipertrofia + Potencia",
};

const slugify = (dia: string) => dia.toLowerCase().replace(/\s+/g, "-");

const formatFecha = (fecha: string) => {
  const [y, m, d] = fecha.split("-");
  return d && m && y ? `${d}/${m}/${y.slice(2)}` : fecha;
};

const diasEntre = (desde: string, hasta: string) =>
  Math.floor(
    (new Date(`${hasta}T00:00:00Z`).getTime() - new Date(`${desde}T00:00:00Z`).getTime()) /
      86_400_000,
  );

const ICON_CLASS = "h-4 w-4";

const DumbbellIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
  </svg>
);

const CalendarIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M16 2.5v4M8 2.5v4M3 10h18" />
  </svg>
);

const SigmaIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <path d="M18 7V5H6l7 7-7 7h12v-2" />
  </svg>
);

const GaugeIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_CLASS}
  >
    <path d="m12 14 4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

const TrophyIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="h-5 w-5"
  >
    <path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 6H4a2 2 0 0 0 2 5M17 6h3a2 2 0 0 1-2 5" />
  </svg>
);

const FlameIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
  </svg>
);

function StatCard({
  label,
  value,
  hint,
  accent = false,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        {icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 dark:text-orange-400">
            {icon}
          </span>
        ) : null}
      </div>
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
    const slug = primerDia ? slugify(primerDia) : null;

    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Dashboard</h1>
        <p className="max-w-sm text-center text-zinc-500 dark:text-zinc-400">
          Registra tu primer entrenamiento para ver tus estadísticas y tu curva de fuerza.
        </p>
        <Link
          href={slug ? `/workout/${slug}` : "/rutinas"}
          className="inline-flex h-11 items-center rounded-lg bg-orange-500 px-6 text-sm font-bold text-zinc-950 shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-400"
        >
          {slug ? "Ir a mi entrenamiento" : "Armar mi rutina"}
        </Link>
      </main>
    );
  }

  // Fecha "hoy" en zona local del servidor (coincide con CURRENT_DATE de la BD)
  const ahora = new Date();
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(
    ahora.getDate(),
  ).padStart(2, "0")}`;

  const [{ data: primerDiaRow }, { data: perfil }] = await Promise.all([
    supabase
      .from("user_routines")
      .select("dia")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase.from("users_profile").select("objetivo,dias_por_semana").maybeSingle(),
  ]);
  const diaHoy = primerDiaRow?.dia ?? null;
  const objetivo = perfil?.objetivo ? (OBJETIVOS[perfil.objetivo] ?? perfil.objetivo) : null;

  const compuestos = registros.filter((r) =>
    (COMPUESTOS as readonly string[]).includes(r.id_ejercicio),
  );
  const diasEntrenados = new Set(registros.map((r) => r.fecha));
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

  const streak = getStreak(registros, hoy);
  const prs = detectPRs(registros).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultimoPr = prs[0] ?? null;
  const diasDesdePr = ultimoPr ? diasEntre(ultimoPr.fecha, hoy) : 0;
  const logros = getLogros(registros, streak);

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

  const subtitulo = [
    objetivo,
    perfil?.dias_por_semana != null ? `${perfil.dias_por_semana} días/semana` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Tus números de entrenamiento, con detalle.
      </p>

      {diaHoy ? (
        <section
          className="relative mt-6 overflow-hidden rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/15 via-orange-500/10 to-orange-500/5 p-6"
          aria-labelledby="hoy-title"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(249,115,22,0.18), transparent)",
            }}
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute -right-7 -top-7 h-36 w-36 text-orange-500/15"
          >
            <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
          </svg>
          <div className="relative">
            <p
              id="hoy-title"
              className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400"
            >
              Hoy toca
            </p>
            <h2 className="mt-1 font-display text-4xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
              {diaHoy}
            </h2>
            {subtitulo ? (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitulo}</p>
            ) : null}
            <Link
              href={`/workout/${slugify(diaHoy)}`}
              className="mt-4 inline-flex h-11 items-center rounded-lg bg-orange-500 px-6 text-sm font-bold text-zinc-950 shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
            >
              Empezar entrenamiento
            </Link>
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-zinc-950">
            {FlameIcon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {streak} {streak === 1 ? "día" : "días"} seguido{streak === 1 ? "" : "s"} entrenando
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Última sesión: {formatFecha(ultimaSesion)}
            </p>
          </div>
        </div>

        {ultimoPr ? (
          <div className="flex items-center gap-4 rounded-2xl border border-orange-500/25 bg-orange-500/5 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-500 dark:text-orange-400">
              {TrophyIcon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">
                PR destacado
              </p>
              <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Nuevo PR en {names[ultimoPr.id_ejercicio] ?? ultimoPr.id_ejercicio} ·{" "}
                {ultimoPr.peso} kg ·{" "}
                {diasDesdePr === 0
                  ? "hoy"
                  : `hace ${diasDesdePr} ${diasDesdePr === 1 ? "día" : "días"}`}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard
          label="Entrenamientos"
          value={String(diasEntrenados.size)}
          hint={diasEntrenados.size === 1 ? "sesión registrada" : "sesiones registradas"}
          icon={DumbbellIcon}
        />
        <StatCard
          label="Esta semana"
          value={String(entradasSemana)}
          hint={`de los últimos 7 días · última: ${formatFecha(ultimaSesion)}`}
          icon={CalendarIcon}
        />
        <StatCard
          label="Volumen total"
          value={volumen.toLocaleString("es-MX")}
          hint="kg levantados en total"
          icon={SigmaIcon}
        />
        <StatCard
          label="Volumen promedio"
          value={volumenPromedio.toLocaleString("es-MX")}
          hint="kg por sesión"
          icon={GaugeIcon}
        />
      </div>

      <section className="mt-6" aria-labelledby="maximos-title">
        <h2
          id="maximos-title"
          className="font-display text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
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
        <h2
          id="curva-title"
          className="font-display text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          Curva de fuerza
        </h2>
        <StrengthChart data={puntos} names={names} />
      </section>

      <section className="mt-6" aria-labelledby="logros-title">
        <h2
          id="logros-title"
          className="font-display text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          Logros
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {logros.map((logro) => (
            <div
              key={logro.id}
              className={`flex flex-col gap-2 rounded-2xl border p-4 ${
                logro.desbloqueado
                  ? "border-orange-500/25 bg-orange-500/5"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  logro.desbloqueado
                    ? "bg-orange-500 text-zinc-950"
                    : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                }`}
              >
                {logro.desbloqueado ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                )}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    logro.desbloqueado
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {logro.titulo}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {logro.desbloqueado ? "Desbloqueado" : "Bloqueado"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}