# Sobrecarga Progresiva

App de powerbuilding para gestionar rutinas de entrenamiento con sobrecarga progresiva: rutinas automáticas, seguimiento de entrenamientos con detección de récords, dashboard de progreso y un catálogo de 1,324 ejercicios con GIFs de demostración.

Hecho por [mat1520](https://github.com/mat1520).

## Stack

- **Next.js** (App Router, TypeScript)
- **Supabase** (Postgres, Auth, REST API)
- **Tailwind CSS**

## Setup local

1. **Variables de entorno** — crea `.env.local` copiando esta plantilla:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # opcional, solo para re-seed
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Arrancar el dev server:**

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Datos del catálogo

El catálogo de ejercicios ya está sembrado en la base de datos remota (1,324 ejercicios con `gif_url` que apunta a `videos/<nombre>.gif`).

Los GIFs se mantienen **locales** en `public/exercises/` (gitignored, ~126MB). Si acabas de clonar el repo, cópialos:

```bash
mkdir -p public/exercises && cp DATASET/exercises-dataset/videos/*.gif public/exercises/
```

### Re-seed (solo si hace falta)

Obtén la service role key desde el dashboard de Supabase (Settings → API) y haz un POST del JSON del dataset a la API REST con `Prefer: resolution=merge-duplicates`:

```bash
curl -X POST "{SUPABASE_URL}/rest/v1/exercises_catalog" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  --data-binary @DATASET/exercises-dataset/data/exercises.json
```

Alternativamente, pide el procedimiento de seed basado en políticas al mantenedor del proyecto (documentado en el ledger del SDD).

## Despliegue

```bash
npx vercel --prod
```

Se usa la **CLI de Vercel** (y no el git import) porque `public/exercises/` está gitignored: la CLI sube los archivos locales, mientras que el import desde Git no los incluiría.