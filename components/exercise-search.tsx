"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveRoutineDay, searchExercises } from "@/actions/routines";

export interface DayItem {
  id: string;
  nombre: string;
  series: number;
  reps: number;
  gifUrl: string | null;
}

interface SearchResult {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
}

function parseCount(value: string, fallback: number): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function ExerciseSearch({
  existingIds,
  onAdd,
}: {
  existingIds: Set<string>;
  onAdd: (result: SearchResult) => void;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  function handleTermChange(value: string) {
    setTerm(value);
    if (value.trim() === "") {
      setResults([]);
      setSearching(false);
      setSearchError(null);
    }
  }

  useEffect(() => {
    const query = term.trim();
    if (query === "") return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError(null);
      searchExercises(query)
        .then((found) => {
          if (!cancelled) setResults(found);
        })
        .catch(() => {
          if (!cancelled) setSearchError("No se pudo buscar. Inténtalo de nuevo.");
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        autoFocus
        placeholder="Buscar ejercicio (ej. press banca, sentadilla)..."
        value={term}
        onChange={(e) => handleTermChange(e.target.value)}
        className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
      />
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
        {searchError ? (
          <p className="px-1 py-2 text-sm text-red-600 dark:text-red-400">{searchError}</p>
        ) : searching ? (
          <p className="px-1 py-2 text-sm text-zinc-500 dark:text-zinc-400">Buscando...</p>
        ) : term.trim() !== "" && results.length === 0 ? (
          <p className="px-1 py-2 text-sm text-zinc-500 dark:text-zinc-400">Sin resultados para “{term}”.</p>
        ) : (
          results.map((result) => {
            const added = existingIds.has(result.id);
            return (
              <button
                key={result.id}
                type="button"
                disabled={added}
                onClick={() => onAdd(result)}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 text-left transition enabled:hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:enabled:hover:bg-zinc-900"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{result.name}</span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {result.body_part} · {result.equipment}
                  </span>
                </span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {added ? "✓ Agregado" : "Agregar"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function RoutineDayEditor({ dia, items: initialItems }: { dia: string; items: DayItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<DayItem[]>(initialItems);
  const [prevItems, setPrevItems] = useState(initialItems);
  if (prevItems !== initialItems) {
    setPrevItems(initialItems);
    setItems(initialItems);
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const existingIds = new Set(items.map((item) => item.id));

  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [modalOpen]);

  function handleAdd(result: SearchResult) {
    setItems((prev) => [
      ...prev,
      { id: result.id, nombre: result.name, series: 3, reps: 10, gifUrl: null },
    ]);
  }

  function handleSetSeries(id: string, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, series: parseCount(value, item.series) } : item)),
    );
  }

  function handleSetReps(id: string, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, reps: parseCount(value, item.reps) } : item)),
    );
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaveError(null);
    setPending(true);
    try {
      await saveRoutineDay(
        dia,
        items.map((item) => ({ ejercicioId: item.id, series: item.series, reps: item.reps })),
      );
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{dia}</h2>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {items.length} {items.length === 1 ? "ejercicio" : "ejercicios"}
        </span>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Este día aún no tiene ejercicios.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={`${item.id}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-800"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                {item.gifUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.gifUrl} alt={item.nombre} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-zinc-400 dark:text-zinc-500">
                    {item.nombre.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.nombre}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    aria-label={`Series de ${item.nombre}`}
                    value={item.series}
                    onChange={(e) => handleSetSeries(item.id, e.target.value)}
                    className="h-9 w-12 rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
                  />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">×</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    aria-label={`Repeticiones de ${item.nombre}`}
                    value={item.reps}
                    onChange={(e) => handleSetReps(item.id, e.target.value)}
                    className="h-9 w-12 rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-900 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                aria-label={`Quitar ${item.nombre}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="h-11 rounded-lg border border-dashed border-zinc-300 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
      >
        + Agregar ejercicio
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="h-11 rounded-lg bg-zinc-900 text-sm font-semibold text-white transition enabled:hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>

      {saveError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {saveError}
        </p>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Agregar ejercicio — ${dia}`}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85dvh] w-full flex-col gap-4 rounded-t-2xl border border-zinc-200 bg-white p-4 pb-6 sm:max-w-md sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <header className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Agregar ejercicio</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Se agrega con 3 series × 10 repeticiones. Puedes ajustarlas antes de guardar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                ✕
              </button>
            </header>
            <ExerciseSearch existingIds={existingIds} onAdd={handleAdd} />
          </div>
        </div>
      )}
    </section>
  );
}