import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import MfaSection from "./mfa-section";
import PesoForm from "./peso-form";

export const metadata: Metadata = { title: "Perfil" };

const GENEROS: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

const OBJETIVOS: Record<string, string> = {
  hipertrofia: "Hipertrofia",
  potencia: "Potencia",
  ambos: "Hipertrofia + Potencia",
};

const NIVELES: Record<string, string> = {
  sedentario: "Sedentario",
  ligero: "Ligero",
  moderado: "Moderado",
  activo: "Activo",
  muy_activo: "Muy activo",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("users_profile")
    .select("edad,peso_actual,altura,genero,objetivo,dias_por_semana,nivel_actividad")
    .eq("id", user.id)
    .maybeSingle();

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("fecha,peso_levantado,reps_logradas");

  const registros = logs ?? [];
  const diasEntrenados = new Set(registros.map((r) => r.fecha)).size;
  const volumen = registros.reduce((acc, r) => acc + r.peso_levantado * r.reps_logradas, 0);
  const email = user.email ?? "Usuario";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <header className="mb-2 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 font-display text-xl font-bold uppercase text-zinc-950"
        >
          {email.charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
            Perfil
          </h1>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{email}</p>
        </div>
      </header>

      <section aria-labelledby="datos-title" className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <h2 id="datos-title" className="sr-only">Datos personales</h2>
        <dl className="divide-y divide-zinc-100 px-5 dark:divide-zinc-800">
          <Row label="Edad" value={perfil?.edad ? `${perfil.edad} años` : "—"} />
          <Row
            label="Altura"
            value={
              perfil?.altura != null
                ? `${Number(perfil.altura).toLocaleString("es-MX", { minimumFractionDigits: 2 })} m (${Math.round(Number(perfil.altura) * 100)} cm)`
                : "—"
            }
          />
          <Row label="Género" value={perfil ? (GENEROS[perfil.genero] ?? perfil.genero) : "—"} />
          <Row label="Objetivo" value={perfil ? (OBJETIVOS[perfil.objetivo] ?? perfil.objetivo) : "—"} />
          <Row
            label="Entrenamiento"
            value={perfil ? `${perfil.dias_por_semana} días por semana` : "—"}
          />
          <Row
            label="Nivel de actividad"
            value={perfil ? (NIVELES[perfil.nivel_actividad] ?? perfil.nivel_actividad) : "—"}
          />
        </dl>
      </section>

      <section aria-labelledby="peso-title" className="flex flex-col gap-4">
        <h2
          id="peso-title"
          className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400"
            aria-hidden="true"
          >
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
          </svg>
          Peso corporal
        </h2>
        <PesoForm pesoActual={perfil?.peso_actual ?? null} />
      </section>

      <MfaSection />

      <section aria-labelledby="resumen-title" className="grid grid-cols-2 gap-4">
        <h2 id="resumen-title" className="sr-only">Resumen de actividad</h2>
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400"
              aria-hidden="true"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            Entrenamientos
          </p>
          <p className="font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {diasEntrenados}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400"
              aria-hidden="true"
            >
              <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
              <path d="M16 7h6v6" />
            </svg>
            Volumen total
          </p>
          <p className="font-display text-3xl font-bold tracking-tight text-orange-500 dark:text-orange-400">
            {volumen.toLocaleString("es-MX")} kg
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-label="Acciones">
        <Link
          href="/rutinas"
          className="flex h-11 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-zinc-950 transition enabled:hover:bg-orange-400"
        >
          Editar mis rutinas
        </Link>
        <Link
          href="https://github.com/mat1520"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 transition enabled:hover:border-orange-500 enabled:hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-300 dark:enabled:hover:border-orange-400 dark:enabled:hover:text-orange-400"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          Hecho por mat1520 · GitHub
        </Link>
        <LogoutButton />
      </section>
    </main>
  );
}