"use client";

import { useState, useTransition, type FormEvent } from "react";
import { completeOnboarding } from "@/actions/profile";
import type { Objetivo } from "@/lib/types";

const inputClass =
  "h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100";

function mensajeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (msg.includes("duplicate key")) {
    return "Ya existe un perfil para esta cuenta.";
  }
  if (msg.includes("check constraint") || msg.includes("new row for relation")) {
    return "Algunos valores no son válidos. Revisa los campos.";
  }
  return "No se pudo guardar tu perfil. Inténtalo de nuevo.";
}

export default function OnboardingForm() {
  const [edad, setEdad] = useState("");
  const [pesoActual, setPesoActual] = useState("");
  const [altura, setAltura] = useState("");
  const [genero, setGenero] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [diasPorSemana, setDiasPorSemana] = useState("");
  const [nivelActividad, setNivelActividad] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding({
          edad: Number(edad),
          pesoActual: Number(pesoActual),
          altura: Number(altura),
          genero,
          objetivo: objetivo as Objetivo,
          diasPorSemana: Number(diasPorSemana),
          nivelActividad,
        });
      } catch (err) {
        setError(mensajeError(err));
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
          Cuéntanos de ti
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Con estos datos crearemos tu rutina personalizada.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Edad (años)
          <input
            type="number"
            required
            min={13}
            max={100}
            inputMode="numeric"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Peso actual (kg)
          <input
            type="number"
            required
            min={1}
            step="0.1"
            inputMode="decimal"
            value={pesoActual}
            onChange={(e) => setPesoActual(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Altura (cm)
          <input
            type="number"
            required
            min={1}
            step="0.1"
            inputMode="decimal"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Género
          <select
            required
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Objetivo
          <select
            required
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="potencia">Potencia</option>
            <option value="ambos">Ambos</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Días de entrenamiento por semana
          <select
            required
            value={diasPorSemana}
            onChange={(e) => setDiasPorSemana(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {Array.from({ length: 7 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? "día" : "días"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Nivel de actividad
          <select
            required
            value={nivelActividad}
            onChange={(e) => setNivelActividad(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            <option value="sedentario">Sedentario</option>
            <option value="ligero">Ligero</option>
            <option value="moderado">Moderado</option>
            <option value="activo">Activo</option>
            <option value="muy_activo">Muy activo</option>
          </select>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-lg bg-zinc-900 text-sm font-semibold text-white transition enabled:hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          {isPending ? "Creando tu rutina..." : "Crear mi rutina"}
        </button>
      </form>
    </div>
  );
}