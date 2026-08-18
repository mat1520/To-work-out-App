"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputContainerClass =
  "flex h-11 items-center rounded-lg border border-zinc-300 bg-white px-3 transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-orange-400";

const inputClass =
  "w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.push("/dashboard");
      })
      .catch(() => {});
  }, [router]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Ya existe una cuenta con este correo.");
      } else if (error.message.includes("at least 6 characters")) {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("No se pudo crear la cuenta. Inténtalo de nuevo.");
      }
      setSubmitting(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Ya existe una cuenta con este correo. Inicia sesión.");
    } else {
      setMessage("Revisa tu email para confirmar tu cuenta y luego inicia sesión.");
    }
    setSubmitting(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="mb-6 flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
          Crear cuenta
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Regístrate para empezar a entrenar.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Correo
          <span className={inputContainerClass}>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Contraseña
          <span className={inputContainerClass}>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            {message}{" "}
            <Link href="/login" className="font-medium underline underline-offset-2">
              Iniciar sesión
            </Link>
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 w-full cursor-pointer rounded-xl bg-orange-500 text-sm font-bold uppercase tracking-wide text-zinc-950 transition enabled:hover:bg-orange-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline underline-offset-2 transition hover:text-orange-600 dark:text-zinc-100 dark:hover:text-orange-400"
        >
          Entra
        </Link>
      </p>
    </div>
  );
}
