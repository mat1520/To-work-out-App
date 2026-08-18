"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function MfaSection() {
  const [factor, setFactor] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingFactor, setPendingFactor] = useState<{ id: string; qrCode: string } | null>(null);
  const [code, setCode] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadFactors() {
    const { data, error } = await createClient().auth.mfa.listFactors();
    if (error) {
      setError("No se pudo cargar el estado de la verificación.");
    } else {
      setFactor(data.totp[0] ? { id: data.totp[0].id } : null);
    }
    setLoading(false);
  }

  useEffect(() => {
    createClient()
      .auth.mfa.listFactors()
      .then(({ data, error }) => {
        if (error) {
          setError("No se pudo cargar el estado de la verificación.");
        } else {
          setFactor(data.totp[0] ? { id: data.totp[0].id } : null);
        }
        setLoading(false);
      })
      .catch(() => {});
  }, []);

  async function handleEnroll() {
    setError(null);
    setSuccess(null);
    setEnrolling(true);

    const supabase = createClient();
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const leftover = factorsData?.all.find(
      (f) => f.factor_type === "totp" && f.status === "unverified",
    );
    if (leftover) {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: leftover.id });
      if (unenrollError) {
        setError("No se pudo activar la verificación. Inténtalo de nuevo.");
        setEnrolling(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) {
      setError("No se pudo activar la verificación. Inténtalo de nuevo.");
    } else {
      setPendingFactor({ id: data.id, qrCode: data.totp.qr_code });
      setCode("");
    }
    setEnrolling(false);
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingFactor) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Ingresa el código de 6 dígitos de tu app de autenticación.");
      return;
    }
    setError(null);
    setSuccess(null);
    setVerifying(true);

    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactor.id,
    });
    if (challengeError) {
      setError("No se pudo verificar el código. Inténtalo de nuevo.");
      setVerifying(false);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: pendingFactor.id,
      challengeId: challenge.id,
      code,
    });
    if (error) {
      setError("Código incorrecto, inténtalo de nuevo.");
      setVerifying(false);
      return;
    }

    setPendingFactor(null);
    setCode("");
    await loadFactors();
    setSuccess("Verificación activada.");
    setVerifying(false);
  }

  async function handleUnenroll() {
    if (!factor) return;
    if (!window.confirm("¿Seguro que quieres desactivar la verificación en dos pasos?")) return;
    setError(null);
    setSuccess(null);
    setUnenrolling(true);

    const { error } = await createClient().auth.mfa.unenroll({ factorId: factor.id });
    if (error) {
      setError("No se pudo desactivar la verificación. Inténtalo de nuevo.");
    } else {
      await loadFactors();
      setSuccess("Verificación desactivada.");
    }
    setUnenrolling(false);
  }

  return (
    <section
      aria-label="Verificación en dos pasos"
      className="mx-auto flex w-full max-w-lg flex-col gap-3"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Verificación en dos pasos
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {loading
          ? "Cargando estado..."
          : factor
            ? "Verificación en dos pasos: activada"
            : "Verificación en dos pasos: desactivada"}
      </p>

      {!loading && !pendingFactor && !factor && (
        <button
          type="button"
          onClick={handleEnroll}
          disabled={enrolling}
          className="h-11 rounded-lg bg-orange-500 text-sm font-bold text-zinc-950 transition enabled:hover:bg-orange-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {enrolling ? "Procesando..." : "Activar verificación en dos pasos"}
        </button>
      )}

      {!loading && pendingFactor && (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <Image
            src={pendingFactor.qrCode}
            alt="Código QR para configurar la verificación en dos pasos"
            width={200}
            height={200}
            className="mx-auto rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Escanea el código QR con tu app de autenticación (Google Authenticator, Authy u otra) e
            ingresa el código de 6 dígitos que genera.
          </p>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Código de 6 dígitos
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-orange-400"
            />
          </label>
          <button
            type="submit"
            disabled={verifying}
            className="h-11 rounded-lg bg-orange-500 text-sm font-bold text-zinc-950 transition enabled:hover:bg-orange-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            {verifying ? "Procesando..." : "Verificar código"}
          </button>
        </form>
      )}

      {!loading && factor && (
        <button
          type="button"
          onClick={handleUnenroll}
          disabled={unenrolling}
          className="h-11 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 transition enabled:hover:border-red-400 enabled:hover:text-red-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:enabled:hover:border-red-500 dark:enabled:hover:text-red-400"
        >
          {unenrolling ? "Procesando..." : "Desactivar"}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          {success}
        </p>
      )}
    </section>
  );
}