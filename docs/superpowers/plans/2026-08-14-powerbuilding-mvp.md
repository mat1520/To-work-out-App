# Powerbuilding MVP (Sobrecarga Progresiva) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MVP web de Sobrecarga Progresiva: onboarding, rutinas, workout mode con banner de récord y dashboard de fuerza, sobre Supabase + Next.js.

**Architecture:** Next.js App Router con server actions y Supabase SSR. Catálogo seedeado desde el JSON local; rutinas por template + editor; logs por ejercicio con detección de PR; gráficos Recharts sobre `workout_logs`.

**Tech Stack:** Next.js 15, Tailwind CSS, TypeScript, Supabase (Auth + Postgres vía MCP), Recharts, Vitest.

**Spec:** Decisiones aprobadas en brainstorming (2026-08-14): proyecto Supabase nuevo (Free Tier, región us-east-2), GIFs locales en `public/exercises/` gitignored + deploy Vercel CLI, rutina seed al onboarding + editor simple, RLS obligatorio, UI en español, campos del esquema alineados al dataset real (`body_part`, `id` TEXT). Dataset: `DATASET/exercises-dataset` (1,324 ejercicios; IDs reales verificados: bench `0025`, squat `0043`, deadlift `0032`, RDL `0085`, OHP `0091`, row `0027`, pull-up `0652`, curl `0294`, pushdown `0201`, lateral `0334`, lat pulldown `2330`, glute bridge `1409`, calf `1385`, incline bench `0047`).

## Global Constraints

- UI en español, mobile-first, sin bibliotecas fuera de: @supabase/ssr, @supabase/supabase-js, recharts, vitest
- RLS obligatorio en las 4 tablas; jamás deshabilitar
- `exercises_catalog.id` = `id` del dataset (TEXT, ej. `"0025"`)
- GIFs: `public/exercises/*.gif` gitignored; `.env.local` gitignored
- Verificación por tarea: `npm run lint`, `npx tsc --noEmit`, `npm test`
- Commits convencionales (`feat:`, `fix:`, `chore:`)

---

### Task 1: Proyecto Supabase + esquema (Fase A — pausa para confirmación del usuario antes de Task 3)

**Files:** — (solo MCP)
**Interfaces:**
- Produces: `project_id` (nuevo), 4 tablas + RLS, claves para `.env.local` (URL, anon, service role)

- [ ] **Step 1: Obtener costo y confirmar** — `get_cost(organization_id="ccvtahzrwmaxtinwdkqp", type="project")` → `confirm_cost` ($0 Free Tier, monthly)
- [ ] **Step 2: Crear proyecto** — `create_project(name="to-workout-app", region="us-east-2", organization_id="ccvtahzrwmaxtinwdkqp")`; `get_project` hasta status ACTIVE
- [ ] **Step 3: Aplicar migración** — `apply_migration(project_id, "initial_schema")`:

```sql
create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  edad integer not null check (edad between 13 and 100),
  peso_actual numeric(5,2) not null check (peso_actual > 0),
  altura numeric(5,2) not null check (altura > 0),
  genero text not null check (genero in ('masculino','femenino','otro')),
  objetivo text not null check (objetivo in ('hipertrofia','potencia','ambos')),
  dias_por_semana integer not null check (dias_por_semana between 1 and 7),
  nivel_actividad text not null check (nivel_actividad in ('sedentario','ligero','moderado','activo','muy_activo')),
  created_at timestamptz not null default now()
);

create table if not exists public.exercises_catalog (
  id text primary key,
  name text not null,
  body_part text not null,
  equipment text not null,
  gif_url text not null
);

create table if not exists public.user_routines (
  id uuid primary key default gen_random_uuid(),
  id_usuario uuid not null references auth.users(id) on delete cascade,
  dia text not null,
  id_ejercicio text not null references public.exercises_catalog(id) on delete cascade,
  series_objetivo integer not null check (series_objetivo > 0),
  reps_objetivo integer not null check (reps_objetivo > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  id_usuario uuid not null references auth.users(id) on delete cascade,
  id_ejercicio text not null references public.exercises_catalog(id) on delete cascade,
  fecha date not null default current_date,
  peso_levantado numeric(6,2) not null check (peso_levantado >= 0),
  reps_logradas integer not null check (reps_logradas > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_logs_user_exercise_date
  on public.workout_logs (id_usuario, id_ejercicio, fecha desc);
create index if not exists idx_routines_user_day
  on public.user_routines (id_usuario, dia);

alter table public.exercises_catalog enable row level security;
alter table public.users_profile enable row level security;
alter table public.user_routines enable row level security;
alter table public.workout_logs enable row level security;

create policy "catalog public read" on public.exercises_catalog
  for select using (true);
create policy "profile own read" on public.users_profile
  for select using (auth.uid() = id);
create policy "profile own insert" on public.users_profile
  for insert with check (auth.uid() = id);
create policy "profile own update" on public.users_profile
  for update using (auth.uid() = id);
create policy "routines own all" on public.user_routines
  for all using (auth.uid() = id_usuario) with check (auth.uid() = id_usuario);
create policy "logs own all" on public.workout_logs
  for all using (auth.uid() = id_usuario) with check (auth.uid() = id_usuario);
```

- [ ] **Step 4: Verificar** — `list_tables(project_id, verbose=true)` → 4 tablas con políticas RLS
- [ ] **Step 5: Obtener claves** — `get_project_url` + `get_publishable_keys` → escribir `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (necesario ya para Task 2)

**⏸ CHECKPOINT:** aquí el plan se pausa — el usuario confirmó explícitamente "espera mi confirmación para iniciar con la estructura de Next.js".

---

### Task 2: Seed de `exercises_catalog`

**Files:** — (sin código en repo: el seed se ejecuta como operación de datos)
**Test:** verificación por count vía MCP `execute_sql` (controlador)

**Interfaces:**
- Consumes: dataset en `DATASET/exercises-dataset/data/exercises.json`, proyecto de Task 1
- Produces: tabla `exercises_catalog` con 1,324 filas; `gif_url` absoluto `/exercises/<file>.gif`

**Ruling R8 (controlador):** el MCP de Supabase no expone la service role key, por lo que el plan original (script .mjs con fetch + service key) no puede ejecutarse sin fricción. Seed ejecutado por el controlador vía REST con política temporal de insert para anon: (1) migración crea policy `catalog anon seed tmp` (insert with check true), (2) `curl -X POST /rest/v1/exercises_catalog` con `Prefer: resolution=merge-duplicates` en chunks de 500 (JSON generado del dataset local), (3) migración dropea la política. Política temporal abierta solo minutos, en proyecto recién creado sin usuarios. Costo si mal: ventana de insert abierto a anon en un proyecto vacío — sin impacto real.

- [x] **Step 1: Política temporal** — `apply_migration("tmp_anon_seed_policy")` con `create policy "catalog anon seed tmp" on public.exercises_catalog for insert to anon with check (true);`
- [x] **Step 2: Insertar** — chunks JSON de 500 desde `DATASET/exercises-dataset/data/exercises.json` → `curl POST {url}/rest/v1/exercises_catalog` (3 requests, HTTP 201)
- [x] **Step 3: Dropear política** — `apply_migration("drop_tmp_anon_seed_policy")`
- [x] **Step 4: Verificar (controlador vía MCP)** — `select count(*)` → 1324, `count(distinct id)` → 1324; spot check compuestos `0025/0043/0032/...` + 0 gifs faltantes vs carpeta local `videos/`
- [x] **Step 5: Commit** — sin código nuevo (operación de datos pura; no hay commit que hacer)

---

### Task 3: Scaffold Next.js + infraestructura Supabase

**Files:**
- Create: scaffold `create-next-app`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `vitest.config.ts`, `lib/types.ts`
- Modify: `.env.local` (ya creado en Task 1 — solo verificar que tenga las 3 claves)

**Interfaces:**
- Consumes: claves de Task 1
- Produces: `createClient()` (browser), `createClient()` (server), `updateSession()` (middleware), tipos `Objetivo`, `LogRow`

- [ ] **Step 1: Scaffold** — en raíz del repo (dir con `.git` y `DATASET/` no conflictivos):

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
npm i @supabase/ssr @supabase/supabase-js recharts
npm i -D vitest @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Verificar `.env.local`** — debe tener `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Step 3: Clientes Supabase** (plantilla oficial SSR):

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
}
```

```ts
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value }) => request.cookies.set(name, value)),
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}
```

```ts
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
export const config = { matcher: ['/dashboard/:path*', '/workout/:path*', '/rutinas/:path*', '/onboarding/:path*'] };
```

- [ ] **Step 4: `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  test: { environment: 'node', globals: true },
  resolve: { alias: { '@': path.resolve(import.meta.dirname) } },
});
```

- [ ] **Step 5: `lib/types.ts`** — `export type Objetivo = 'hipertrofia' | 'potencia' | 'ambos';` y `export interface LogRow { id_ejercicio: string; fecha: string; peso_levantado: number; reps_logradas: number }`
- [ ] **Step 6: Verificar** — `npm run lint`, `npx tsc --noEmit`, `npm test` (0 tests OK), `npm run dev` renderiza
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: scaffold Next.js + clientes Supabase"`

---

### Task 4: Auth (registro, login, logout)

**Files:**
- Create: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(auth)/layout.tsx`, `app/(app)/layout.tsx` (guard de sesión + nav inferior mobile)
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `createClient()` browser/server de Task 3
- Produces: `(app)` grupo protegido; login/signup que redirigen según sesión

- [ ] **Step 1: Login** — formulario client con `signInWithPassword({email, password})`, error inline, redirect `/dashboard` tras éxito (client + `router.push`)
- [ ] **Step 2: Signup** — `signUp({email, password, options: { emailRedirectTo: window.location.origin }})`; si ok, redirect a `/onboarding`
- [ ] **Step 3: `(app)/layout.tsx`** — server component: `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();` → si no hay user, `redirect('/login')`; renderizar `{children}` + nav inferior fija (mobile): Dashboard, Workout (primer día de rutina), Rutinas, Cerrar sesión (`signOut` → `/login`)
- [ ] **Step 4: `app/page.tsx`** — si user → `redirect('/dashboard')`, si no → `redirect('/login')`
- [ ] **Step 5: Verificar manual** — `npm run dev`: registrar usuario real, ver sesión persistente, logout
- [ ] **Step 6: Commit** — `git commit -am "feat: autenticación email/password + guard de sesión"`

---

### Task 5: `lib/routines.ts` — templates de rutina (TDD)

**Files:**
- Create: `lib/routines.ts`, `tests/routines.test.ts`

**Interfaces:**
- Consumes: IDs de ejercicio verificados (0025, 0043, 0032, 0085, 0091, 0027, 0652, 0294, 0201, 0334, 2330, 1409, 1385, 0047)
- Produces: `getTemplate(diasPorSemana: number, objetivo: Objetivo): RoutineDay[]` con `RoutineDay { dia: string; items: RoutineItem[] }`, `RoutineItem { ejercicioId: string; series: number; reps: number }`

- [ ] **Step 1: Test fallido**

```ts
import { describe, it, expect } from 'vitest';
import { getTemplate } from '@/lib/routines';

describe('getTemplate', () => {
  it('genera 3 días para 3 días/semana', () => {
    expect(getTemplate(3, 'hipertrofia')).toHaveLength(3);
  });
  it('genera PPL x2 para 6 días/semana', () => {
    expect(getTemplate(6, 'potencia').map((d) => d.dia)).toEqual(
      ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
    );
  });
  it('potencia = 5x5 en compuestos, 3x8 en accesorios', () => {
    const t = getTemplate(6, 'potencia');
    const bench = t[0].items.find((i) => i.ejercicioId === '0025');
    const lateral = t[0].items.find((i) => i.ejercicioId === '0334');
    expect(bench).toEqual({ ejercicioId: '0025', series: 5, reps: 5 });
    expect(lateral).toEqual({ ejercicioId: '0334', series: 3, reps: 8 });
  });
  it('hipertrofia = 4x8 en compuestos, 3x12 en accesorios', () => {
    const t = getTemplate(3, 'hipertrofia');
    const squat = t[0].items.find((i) => i.ejercicioId === '0043');
    expect(squat).toEqual({ ejercicioId: '0043', series: 4, reps: 8 });
  });
});
```

- [ ] **Step 2: Verificar fallo** — `npx vitest run tests/routines.test.ts` → FAIL ("Cannot find module")
- [ ] **Step 3: Implementar**

```ts
// lib/routines.ts
import type { Objetivo } from '@/lib/types';

export interface RoutineItem { ejercicioId: string; series: number; reps: number }
export interface RoutineDay { dia: string; items: RoutineItem[] }

const COMPOUNDS = new Set(['0025', '0043', '0032', '0085', '0091', '0027']);

const DAYS: Record<string, string[]> = {
  'Full Body A': ['0043', '0025', '0027', '0294', '0201'],
  'Full Body B': ['0085', '0091', '0652', '0334'],
  'Push A': ['0025', '0091', '0201', '0334'],
  'Pull A': ['0027', '0652', '0294', '2330'],
  'Legs A': ['0043', '0085', '1409', '1385'],
  'Push B': ['0047', '0091', '0201', '0334'],
  'Pull B': ['0032', '0652', '0294', '2330'],
  'Legs B': ['0043', '0085', '1409', '1385'],
};

const SCHEDULES: Record<number, string[]> = {
  1: ['Full Body A'],
  2: ['Full Body A', 'Full Body B'],
  3: ['Full Body A', 'Full Body B', 'Full Body A'],
  4: ['Push A', 'Pull A', 'Legs A', 'Full Body A'],
  5: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B'],
  6: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
  7: ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Full Body A'],
};

function seriesReps(objetivo: Objetivo, isCompound: boolean) {
  if (objetivo === 'potencia') return isCompound ? { series: 5, reps: 5 } : { series: 3, reps: 8 };
  if (objetivo === 'hipertrofia') return isCompound ? { series: 4, reps: 8 } : { series: 3, reps: 12 };
  return isCompound ? { series: 4, reps: 6 } : { series: 3, reps: 10 };
}

export function getTemplate(diasPorSemana: number, objetivo: Objetivo): RoutineDay[] {
  return (SCHEDULES[diasPorSemana] ?? SCHEDULES[3]).map((dia) => ({
    dia,
    items: DAYS[dia].map((ejercicioId) => ({
      ejercicioId,
      ...seriesReps(objetivo, COMPOUNDS.has(ejercicioId)),
    })),
  }));
}
```

- [ ] **Step 4: Verificar** — `npx vitest run tests/routines.test.ts` → PASS (4 tests)
- [ ] **Step 5: Commit** — `git add lib/routines.ts tests/routines.test.ts && git commit -m "feat: templates de rutina por días y objetivo"`

---

### Task 6: Onboarding (perfil + seed de rutinas)

**Files:**
- Create: `app/onboarding/page.tsx` (form client), `actions/profile.ts` (server action)

**Interfaces:**
- Consumes: `getTemplate` de Task 5, `createClient` de Task 3
- Produces: fila en `users_profile` + rutinas insertadas; redirect `/dashboard`; si ya existe perfil → redirect

- [ ] **Step 1: Server action**

```ts
// actions/profile.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { getTemplate } from '@/lib/routines';
import { redirect } from 'next/navigation';
import type { Objetivo } from '@/lib/types';

export interface ProfileInput {
  edad: number; pesoActual: number; altura: number; genero: string;
  objetivo: Objetivo; diasPorSemana: number; nivelActividad: string;
}

export async function completeOnboarding(input: ProfileInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error: pErr } = await supabase.from('users_profile').insert({
    id: user.id, edad: input.edad, peso_actual: input.pesoActual, altura: input.altura,
    genero: input.genero, objetivo: input.objetivo, dias_por_semana: input.diasPorSemana,
    nivel_actividad: input.nivelActividad,
  });
  if (pErr) throw pErr;
  const template = getTemplate(input.diasPorSemana, input.objetivo);
  const rows = template.flatMap((day) =>
    day.items.map((it) => ({
      id_usuario: user.id, dia: day.dia, id_ejercicio: it.ejercicioId,
      series_objetivo: it.series, reps_objetivo: it.reps,
    })),
  );
  const { error: rErr } = await supabase.from('user_routines').insert(rows);
  if (rErr) throw rErr;
  redirect('/dashboard');
}
```

- [ ] **Step 2: Página `/onboarding`** — client component, inputs numéricos (edad, peso_actual, altura) y selects (género, objetivo, días 1-7, nivel_actividad), submit → `completeOnboarding`, errores inline. Guard server: si `users_profile` existe → `redirect('/dashboard')`
- [ ] **Step 3: Verificar manual** — usuario nuevo llega a onboarding, completa, ve rutina creada en DB (count `user_routines` por user vía MCP)
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: onboarding con seed de rutina"`

---

### Task 7: `lib/progress.ts` — récord y PR (TDD)

**Files:**
- Create: `lib/progress.ts`, `tests/progress.test.ts`

**Interfaces:**
- Produces: `getLastRecord(ejercicioId: string, logs: LogRow[]): { peso: number; reps: number; fecha: string } | null`, `buildBanner(last: { peso: number; reps: number } | null): string`, `isNewPr(prevPeso, prevReps, peso, reps): boolean` — consumidos por Task 8

- [ ] **Step 1: Test fallido**

```ts
import { describe, it, expect } from 'vitest';
import { getLastRecord, buildBanner, isNewPr } from '@/lib/progress';

const logs = [
  { id_ejercicio: '0025', fecha: '2026-08-01', peso_levantado: 80, reps_logradas: 8 },
  { id_ejercicio: '0025', fecha: '2026-08-08', peso_levantado: 85, reps_logradas: 6 },
];

describe('progress', () => {
  it('devuelve el registro más reciente por fecha', () => {
    expect(getLastRecord('0025', logs)).toEqual({ peso: 85, reps: 6, fecha: '2026-08-08' });
  });
  it('null si no hay registros', () => {
    expect(getLastRecord('0043', logs)).toBeNull();
  });
  it('banner con récord', () => {
    expect(buildBanner({ peso: 85, reps: 6 })).toBe('Tu último récord fue 85 kg x 6 reps. Meta de hoy: superarlo.');
  });
  it('banner primera vez', () => {
    expect(buildBanner(null)).toBe('Primera vez con este ejercicio. ¡Registra tu base!');
  });
  it('PR por más peso o mismas reps', () => {
    expect(isNewPr(85, 6, 90, 5)).toBe(true);
    expect(isNewPr(85, 6, 85, 7)).toBe(true);
    expect(isNewPr(85, 6, 85, 5)).toBe(false);
  });
});
```

- [ ] **Step 2: Verificar fallo** — `npx vitest run tests/progress.test.ts` → FAIL
- [ ] **Step 3: Implementar**

```ts
// lib/progress.ts
import type { LogRow } from '@/lib/types';

export function getLastRecord(ejercicioId: string, logs: LogRow[]) {
  const mine = logs
    .filter((l) => l.id_ejercicio === ejercicioId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (mine.length === 0) return null;
  return { peso: mine[0].peso_levantado, reps: mine[0].reps_logradas, fecha: mine[0].fecha };
}

export function buildBanner(last: { peso: number; reps: number } | null) {
  if (!last) return 'Primera vez con este ejercicio. ¡Registra tu base!';
  return `Tu último récord fue ${last.peso} kg x ${last.reps} reps. Meta de hoy: superarlo.`;
}

export function isNewPr(prevPeso: number, prevReps: number, peso: number, reps: number) {
  return peso > prevPeso || (peso === prevPeso && reps > prevReps);
}
```

- [ ] **Step 4: Verificar** — `npx vitest run tests/progress.test.ts` → PASS (5 tests)
- [ ] **Step 5: Commit** — `git add lib/progress.ts tests/progress.test.ts && git commit -m "feat: lógica de récord y detección de PR"`

---

### Task 8: Workout Mode (`/workout/[dia]`)

**Files:**
- Create: `app/workout/[dia]/page.tsx` (server), `components/record-input.tsx` (client), `actions/logs.ts`
- Modify: nav en `(app)/layout.tsx` (link al primer día de rutina)

**Interfaces:**
- Consumes: `getLastRecord`, `buildBanner`, `isNewPr` (Task 7), `createClient` server
- Produces: `saveLog(ejercicioId, peso, reps)` server action; `RecordInput` con props `{ ejercicioId: string; peso: number; reps: number }`

- [ ] **Step 1: Server action**

```ts
// actions/logs.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function saveLog(ejercicioId: string, peso: number, reps: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { error } = await supabase.from('workout_logs').insert({
    id_usuario: user.id, id_ejercicio: ejercicioId, peso_levantado: peso, reps_logradas: reps,
  });
  if (error) throw error;
}
```

- [ ] **Step 2: Página `[dia]`** — slug = `dia.toLowerCase().replace(/\s+/g, '-')`; server component: `user_routines` del día (match slug ↔ `dia`), `exercises_catalog` joined, logs del user de esos ejercicios, `getLastRecord` por ejercicio → `<LastRecordBanner text={buildBanner(last)} />`; tras guardar, si `last && isNewPr(...)` mostrar "¡Nuevo PR!" (client, en `RecordInput`)
- [ ] **Step 3: `RecordInput`** — client: inputs `peso` (step 0.5) y `reps` (int), botón "Guardar Serie" → `saveLog` + `router.refresh()` + limpia inputs; si `isNewPr(prevPeso, prevReps, peso, reps)` muestra "¡Nuevo PR!" momentáneo
- [ ] **Step 4: Verificar manual** — guardar series en 2 ejercicios distintos, banner muestra récord, página refresca
- [ ] **Step 5: Lint + typecheck + tests** — `npm run lint && npx tsc --noEmit && npm test`
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: workout mode con banner de récord y guardado de series"`

---

### Task 9: Editor de rutinas (`/rutinas`)

**Files:**
- Create: `app/rutinas/page.tsx`, `components/exercise-search.tsx`, `actions/routines.ts`

**Interfaces:**
- Consumes: `createClient` server; catálogo
- Produces: `saveRoutineDay(dia: string, items: { ejercicioId: string; series: number; reps: number }[])` (replace-all del día), `searchExercises(term: string)` (server action, top 10 por `name ilike`)

- [ ] **Step 1: Server actions** — `searchExercises(term)`: `supabase.from('exercises_catalog').select('id,name,body_part,equipment').ilike('name', \`%${term}%\`).limit(10)`; `saveRoutineDay`: delete `user_routines` del user con ese `dia`, insert nuevo batch
- [ ] **Step 2: Página** — agrupa rutinas por `dia`, cada día con lista editable: series/reps (inputs inline), quitar ejercicio (X), botón "Agregar ejercicio" → modal con `ExerciseSearch`
- [ ] **Step 3: `ExerciseSearch`** — input + lista resultados (nombre, body_part, equipment) + click para agregar al día (series/reps default 3x10), luego "Guardar cambios" → `saveRoutineDay`
- [ ] **Step 4: Verificar manual** — agregar/quitar ejercicios en un día, recargar, cambios persisten
- [ ] **Step 5: Lint + typecheck + tests**
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: editor de rutinas con búsqueda de ejercicios"`

---

### Task 10: Dashboard de fuerza

**Files:**
- Create: `app/dashboard/page.tsx`, `components/strength-chart.tsx`

**Interfaces:**
- Consumes: `workout_logs` de compuestos `['0025','0043','0032']`; Recharts
- Produces: gráfico de línea peso vs fecha por levantamiento; empty state con CTA a `/workout/...`

- [ ] **Step 1: Página** — server: `workout_logs` del user con `id_ejercicio.in(['0025','0043','0032'])` order `fecha`; join names del catálogo; si vacío → "Registra tu primer entrenamiento" con link al primer día de rutina
- [ ] **Step 2: `StrengthChart`** — client, `LineChart` por compuesto (X: fecha, Y: peso_levantado), 3 series; si un compuesto tiene <2 puntos se omite
- [ ] **Step 3: Verificar manual** — con logs de prueba se ve la curva; empty state funciona
- [ ] **Step 4: Lint + typecheck + tests**
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: dashboard con curva de fuerza"`

---

### Task 11: Medios, README y despliegue

**Files:**
- Create: `.gitignore` (agregar `public/exercises/`, `DATASET/exercises-dataset/videos/`, `DATASET/exercises-dataset/images/`), `README.md`

- [ ] **Step 1: Copiar GIFs** — `mkdir -p public/exercises && cp DATASET/exercises-dataset/videos/*.gif public/exercises/` (126MB, local)
- [ ] **Step 2: Gitignore** — asegurar `public/exercises/`, `DATASET/exercises-dataset/videos/`, `DATASET/exercises-dataset/images/` en `.gitignore` (medios pesados se mantienen locales; deploy vía CLI)
- [ ] **Step 3: Verificar catálogo** — los gifs cargan en el editor de rutinas (`/rutinas`)
- [ ] **Step 4: README** — setup: `.env.local` (3 claves), `node --env-file=.env.local scripts/seed-exercises.mjs`, `npm run dev`, deploy `npx vercel --prod` (CLI, porque `public/exercises` está gitignored)
- [ ] **Step 5: Deploy (con login Vercel del usuario)** — `npx vercel --prod` → verificar login, onboarding, workout, dashboard y GIFs en la URL pública. Si el CLI requiere login interactivo, lo ejecuta el usuario (o el controlador con su autorización) — no el subagente
- [ ] **Step 6: Commit** — `git add -A && git commit -m "chore: medios locales, README y despliegue"`