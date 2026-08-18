import Link from "next/link";

const FEATURES = [
  {
    title: "Rutinas automáticas",
    desc: "Plan Push · Pull · Legs o Full Body generado según tu objetivo, días por semana y nivel. Sin decidir nada.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Registro en segundos",
    desc: "Peso y repeticiones por serie. El récord anterior aparece arriba, listo para superar.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M4 20h16M6 16l4-6 4 4 4-7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19" cy="5" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Detector de PR",
    desc: "Al batir tu récord suena el aviso: nuevo mejor peso o nuevas repeticiones. Progreso garantizado.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M13 2 4.5 13.5h6L10 22l8.5-11.5h-6L13 2Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Curvas de fuerza",
    desc: "Gráficas de tus levantamientos principales: press banca, sentadilla y peso muerto en el tiempo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M3 3v18h18M7 15l4-6 3.5 3.5L19 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const STEPS = [
  { n: "01", title: "Crea tu cuenta", desc: "Registro en segundos, sin tarjetas. Solo tú y tu progreso." },
  { n: "02", title: "Genera tu plan", desc: "Cuéntanos tu objetivo, días y nivel. Tu rutina se crea sola." },
  { n: "03", title: "Entrena y bate récords", desc: "Registra series, supera tu última marca y mira crecer tu fuerza." },
];

export const metadata = {
  title: "Sobrecarga Progresiva — Supera tu último récord",
  description:
    "Entrena con sobrecarga progresiva: rutinas automáticas, registro de series en segundos y detección de récords personales. Tu fuerza, medida.",
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% -10%, rgba(249,115,22,0.22), transparent), radial-gradient(ellipse 45% 40% at 90% 25%, rgba(34,197,94,0.12), transparent), radial-gradient(ellipse 50% 40% at 5% 70%, rgba(249,115,22,0.08), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f8fafc 1px, transparent 1px), linear-gradient(to bottom, #f8fafc 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <p className="font-display text-2xl font-bold uppercase tracking-wider text-zinc-100">
          Sobrecarga<span className="text-orange-500">.</span>Progresiva
        </p>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-lg px-4 text-zinc-300 transition-colors hover:text-white sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-lg bg-orange-500 px-4 font-semibold text-zinc-950 transition-colors hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Empezar gratis
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-5xl px-5">
        <section className="flex flex-col items-center gap-8 py-16 text-center sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
            Entrenamiento inteligente
          </p>
          <h1 className="font-display max-w-3xl text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
            Supera tu
            <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              último récord
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Rutinas automáticas, registro de series en segundos y detección de récords personales.
            Tu fuerza, medida semana a semana.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-7 text-base font-bold text-zinc-950 shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Empezar gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 px-7 text-base font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
            >
              Iniciar sesión
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-6 text-center sm:gap-12">
            {[
              ["1,300+", "ejercicios con GIF"],
              ["3", "pasos para empezar"],
              ["100%", "gratis"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-bold text-white sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="py-14" aria-labelledby="features-title">
          <h2 id="features-title" className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Todo lo que necesitas para progresar
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-orange-500/50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500 group-hover:text-zinc-950">
                  {f.icon}
                </div>
                <h3 className="font-display mt-4 text-xl font-semibold uppercase tracking-wide text-zinc-100">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14" aria-labelledby="steps-title">
          <h2 id="steps-title" className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Empieza en tres pasos
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <p className="font-display text-4xl font-bold text-orange-500">{s.n}</p>
                <h3 className="mt-3 text-lg font-semibold text-zinc-100">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="my-14 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-zinc-900/60 to-green-500/10 p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Tu marca de hoy es tu meta de mañana
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            Crea tu cuenta y deja que el progreso se mida solo.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-7 text-base font-bold text-zinc-950 shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Empezar gratis
          </Link>
        </section>
      </main>

      <footer className="relative border-t border-zinc-800/80 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-5 text-sm text-zinc-500 sm:flex-row">
          <p className="font-display text-lg font-bold uppercase tracking-wider text-zinc-300">
            Sobrecarga<span className="text-orange-500">.</span>Progresiva
          </p>
          <a
            href="https://github.com/mat1520"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 font-semibold text-zinc-300 transition-all hover:border-orange-500 hover:text-orange-400 hover:shadow-lg hover:shadow-orange-500/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            Hecho por mat1520
          </a>
        </div>
      </footer>
    </div>
  );
}
