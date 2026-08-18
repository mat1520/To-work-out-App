# Sobrecarga Progresiva

Entrena con sobrecarga progresiva: rutinas automáticas, registro de series en segundos y detección de récords personales. Tu fuerza, medida.

[![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Estado](https://img.shields.io/badge/Estado-activo-22c55e?style=flat-square)]()

## Características

- **Rutinas automáticas** — Plan Push · Pull · Legs o Full Body generado según tu objetivo, días por semana y nivel. Sin decidir nada.
- **Registro en segundos** — Peso y repeticiones por serie durante el entrenamiento, con el récord anterior siempre a la vista.
- **Detector de PR** — Al batir tu récord suena el aviso: nuevo mejor peso o nuevas repeticiones. Progreso garantizado.
- **Dashboard de progreso** — Racha, logros y curvas de fuerza de tus levantamientos principales en el tiempo.
- **Perfil** — Peso corporal editable y verificación en dos pasos (2FA) opcional.
- **Catálogo de 1,324 ejercicios** — Con GIF de demostración para cada movimiento.

## Stack

- **Next.js** — App Router, Server Components y Server Actions
- **Supabase** — Postgres, Auth y Row Level Security
- **Tailwind CSS**
- **Recharts** — Gráficas de curva de fuerza
- **Vitest** — Tests unitarios

## Empezar

**Requisitos:** Node.js 20+ y npm.

1. **Variables de entorno** — crea `.env.local` en la raíz del proyecto:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>   # opcional, solo para re-seed
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Arranca el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

4. **Ejecuta los tests:**

   ```bash
   npm test
   ```

El catálogo de ejercicios ya está sembrado en la base de datos remota. Los GIFs viven en `public/exercises/` (gitignored, ~126 MB); si acabas de clonar el repo, cópialos con:

```bash
mkdir -p public/exercises && cp DATASET/exercises-dataset/videos/*.gif public/exercises/
```

## Despliegue

```bash
npx vercel --prod
```

Se usa la CLI de Vercel en lugar del import desde Git porque `public/exercises/` está gitignored: la CLI sube los archivos locales, mientras que el import desde Git no los incluiría.

## Estructura del proyecto

```
app/          Páginas y layouts (landing, onboarding, rutinas, workout, dashboard, perfil)
components/   Componentes reutilizables (gráficas, registro de series, buscador de ejercicios)
lib/          Lógica de negocio, tipos y cliente de Supabase
actions/      Server Actions (registros, perfil, rutinas)
tests/        Tests unitarios (Vitest)
```

## Autor

Hecho por [mat1520](https://github.com/mat1520).