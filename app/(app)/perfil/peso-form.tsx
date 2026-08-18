"use client";

import { useState, type FormEvent } from "react";
import { updatePeso } from "@/actions/profile";

export default function PesoForm({ pesoActual }: { pesoActual: number | null }) {
  const [peso, setPeso] = useState(pesoActual ? String(pesoActual) : "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valor = Number(peso);
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("Ingresa un peso válido en kg.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updatePeso(valor);
      setMessage("Peso actualizado.");
    } catch {
      setError("No se pudo actualizar el peso. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Peso actual
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder={pesoActual ? String(pesoActual) : "kg"}
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-10 text-base text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-orange-400"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            kg
          </span>
        </div>
      </label>
      <button
        type="submit"
        disabled={saving}
        className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-bold text-zinc-950 transition enabled:hover:bg-orange-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
      >
        {saving ? "Guardando..." : "Guardar"}
      </button>
      {message && (
        <p role="status" className="w-full text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}