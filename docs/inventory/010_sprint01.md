# Sprint 01 - Auth, sesion y AppShell

## Que se hizo
- Login real con Supabase Auth y persistencia de sesion mediante cookies (`sb-access-token`, `sb-refresh-token`, `sb-token-type`) para que el middleware pueda validar sesiones.
- Middleware con guardas de ruta y resolucion de org/hotel activa usando `org_members`, con redireccion a `/login` si no hay sesion o membership activa.
- AppShell con sidebar, topbar, selector de hotel y componentes UI base (PageHeader, SkeletonGrid, Banner y CommandPalette).
- Seed y pruebas RLS mantienen el flujo de membership activo vs inactivo y aislamiento por `org_id`.

## Como se probo
- `npx supabase start`
- `npx supabase test db`
- `corepack pnpm test`
- `corepack pnpm exec playwright test`
- `corepack pnpm build` (con `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` y `SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY` apuntando al Supabase local)

## Decisiones importantes
- Se mantienen cookies de sesion de Supabase en cliente para que el middleware pueda leer `sb-access-token` y aplicar guards sin usar service role en el navegador.
- La tabla de memberships sigue como `org_members` segun `SPEC_SUPABASE_SCHEMA.sql` y `SPEC_RLS.md` para Sprint 01.
- `docs/MASTER_PLAN.md` no existe; se usa el checklist de `SPRINT_01_auth_sesion_appshell.md`.

## Riesgos / Follow-ups
- Next.js sigue mostrando la advertencia de workspace root por el lockfile externo en `C:\Users\trabajo`; se puede corregir con `turbopack.root`.
- El warning de "middleware file convention is deprecated" sugiere migrar a `proxy` mas adelante.
