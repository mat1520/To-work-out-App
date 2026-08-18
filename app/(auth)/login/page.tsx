"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputContainerClass =
  "flex h-11 items-center rounded-lg border border-zinc-300 bg-white px-3 transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-orange-400";

const inputClass =
  "w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.push("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (
        error.code === "invalid_credentials" ||
        error.message.includes("Invalid login credentials")
      ) {
        setError("Correo o contraseña incorrectos.");
      } else if (error.code === "email_not_confirmed") {
        setError("Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
      } else {
        setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
      }
      setSubmitting(false);
      return;
    }

    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const factor = factorsData?.totp[0] ?? factorsData?.all[0];

    if (
      factor &&
      (assurance?.nextLevel === "aal2" ||
        (assurance?.currentLevel === "aal1" && (factorsData?.all.length ?? 0) > 0))
    ) {
      setFactorId(factor.id);
      setCode("");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!factorId) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setError("No se pudo verificar el código. Inténtalo de nuevo.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (error) {
      setError("Código incorrecto, inténtalo de nuevo.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  }

  function handleBack() {
    setFactorId(null);
    setCode("");
    setError(null);
    setSubmitting(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <header className="mb-6 flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-50">
          Entrar
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {factorId
            ? "Ingresa el código de verificación de tu app de autenticación."
            : "Entra con tu correo para seguir tu rutina."}
        </p>
      </header>

      <form
        onSubmit={factorId ? handleVerify : handleSubmit}
        className="flex flex-col gap-4"
      >
        {!factorId && (
          <>
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </span>
            </label>
          </>
        )}

        {factorId && (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Código de verificación
              <span className={inputContainerClass}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={inputClass}
                />
              </span>
            </label>
            <button
              type="button"
              onClick={handleBack}
              className="cursor-pointer self-start text-sm font-medium text-zinc-600 underline transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Volver
            </button>
          </>
        )}

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
          disabled={submitting}
          className="h-12 w-full cursor-pointer rounded-xl bg-orange-500 text-sm font-bold uppercase tracking-wide text-zinc-950 transition enabled:hover:bg-orange-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {submitting
            ? factorId
              ? "Verificando..."
              : "Entrando..."
            : factorId
              ? "Verificar"
              : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline underline-offset-2 transition hover:text-orange-600 dark:text-zinc-100 dark:hover:text-orange-400"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
