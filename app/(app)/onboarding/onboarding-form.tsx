"use client";

import { useState, useTransition, type FormEvent } from "react";
import { completeOnboarding } from "@/actions/profile";
import type { Objetivo } from "@/lib/types";

const inputContainerClass =
  "flex h-11 items-center rounded-lg border border-zinc-300 bg-white px-3 transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-orange-400";

const inputClass =
  "w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50";

const GENEROS = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "otro", label: "Otro" },
];

const OBJETIVOS = [
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "potencia", label: "Potencia" },
  { value: "ambos", label: "Ambos" },
];

const NIVELES = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligero", label: "Ligero" },
  { value: "moderado", label: "Moderado" },
  { value: "activo", label: "Activo" },
  { value: "muy_activo", label: "Muy activo" },
];

function chipClass(active: boolean): string {
  return `flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
    active
      ? "border-orange-500 bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/25"
      : "border-zinc-300 bg-white text-zinc-600 hover:border-orange-500/60 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-orange-400/60 dark:hover:text-zinc-50"
  }`;
}

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
    if (!genero || !objetivo || !diasPorSemana || !nivelActividad) {
      setError("Completa todas las opciones antes de continuar.");
      return;
    }
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
          Tu perfil
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Con estos datos crearemos tu rutina personalizada.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Edad (años)
          <span className={inputContainerClass}>
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
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Peso actual (kg)
          <span className={inputContainerClass}>
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
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Altura (m)
          <span className={inputContainerClass}>
            <input
              type="number"
              required
              min={0.5}
              max={2.5}
              step="0.01"
              inputMode="decimal"
              placeholder="Ej. 1.67"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Género
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {GENEROS.map((op) => (
              <button
                key={op.value}
                type="button"
                aria-pressed={genero === op.value}
                onClick={() => setGenero(op.value)}
                className={chipClass(genero === op.value)}
              >
                {op.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Objetivo
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {OBJETIVOS.map((op) => (
              <button
                key={op.value}
                type="button"
                aria-pressed={objetivo === op.value}
                onClick={() => setObjetivo(op.value)}
                className={chipClass(objetivo === op.value)}
              >
                {op.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Días de entrenamiento por semana
          <select
            required
            value={diasPorSemana}
            onChange={(e) => setDiasPorSemana(e.target.value)}
            className="h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-orange-400"
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

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Nivel de actividad
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {NIVELES.map((op) => (
              <button
                key={op.value}
                type="button"
                aria-pressed={nivelActividad === op.value}
                onClick={() => setNivelActividad(op.value)}
                className={chipClass(nivelActividad === op.value)}
              >
                {op.label}
              </button>
            ))}
          </div>
        </fieldset>

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
          className="h-12 w-full cursor-pointer rounded-xl bg-orange-500 text-sm font-bold uppercase tracking-wide text-zinc-950 shadow-lg shadow-orange-500/25 transition enabled:hover:bg-orange-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {isPending ? "Guardando..." : "Guardar y empezar"}
        </button>
      </form>
    </div>
  );
}
