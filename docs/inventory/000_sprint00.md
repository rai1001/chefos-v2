# Sprint 00 – Cimientos reconstruidos

## Qué se hizo
- Scaffold completo de Next.js + Tailwind + Supabase local con `AppShell`, `Providers` y las rutas `/`, `/login` y `/dashboard`.
- Migraciones/seed de Supabase siguiendo `SPEC_SUPABASE_SCHEMA.sql`, helpers `current_org_id`/`is_member`, RLS activas y el test de pgTAP `supabase/tests/rls_baseline.sql`.
- Tooling alineado (`pnpm` scripts, ESLint, Vitest/JSDOM, Playwright smoke) y la documentación en esta entrada de `docs/inventory`.
- Stack de pruebas fortalecido: `src/lib/supabase/client.ts` cae a un fallback local fuera de producción (https://127.0.0.1:54331 + `anon-key`), `vitest.setup.ts` registra mocks globales de `useRouter` y `useAuth`, `playwright.config.ts` arranca `npx pnpm dev` con `localhost` como baseURL y AppShell/CommandPalette/AuthProvider son componentes cliente (`'use client'`).

## Cómo se probó
- `npx supabase start` (mantiene el entorno local para todas las validaciones)
- `npx supabase db reset --yes` *(falla: después de reactivar los contenedores, el request a `http://127.0.0.1:54331/storage/v1/bucket` devuelve `connectex: No connection could be made because the target machine actively refused it`, lo cual impide reinicializar el storage; hay que revisar la salud del contenedor Storage o reintentar con mayor tolerancia)*
- `npx supabase test db`
- `npx pnpm test`
- `npx pnpm build` (con `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` exportadas)
- `npx pnpm exec playwright test`

## Decisiones importantes
- El cliente Supabase valida `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` en producción, pero en desarrollo usa el fallback local y deja un warning para no bloquear builds locales sin variables.
- Las pruebas comparten el setup global de `vitest.setup.ts` (mocks de router/auth) y Playwright ahora arranca `npx pnpm dev` automáticamente gracias a `webServer`, evitando scripts externos repetitivos y estandarizando `localhost` como baseURL.
- AppShell, CommandPalette y AuthProvider son componentes cliente (`'use client'`) para que los hooks de navegación y autenticación funcionen en `next build` y las pruebas sin que Turbopack lance errores.

## Riesgos / Follow-ups
- Next.js sigue detectando `C:\Users\trabajo` como raíz por el `package-lock.json` fuera del repo; se puede resolver definiendo `turbopack.root` o eliminando ese lockfile si se controla el entorno local.
- `docs/MASTER_PLAN.md` no existe, así que cerramos este sprint siguiendo el checklist de `SPRINT_00_cimientos.md`.
- `npx supabase db reset --yes` aún falla porque el Storage API en `http://127.0.0.1:54331/storage/v1/bucket` rechaza la conexión tras el reinicio; hay que validar el contenedor Storage o poner reintentos en el CLI antes de marcar esa parte del checklist como completa.
