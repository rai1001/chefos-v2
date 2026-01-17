# Sprint 02 - Dashboard + RPCs + alertas

## Que se hizo
- RPCs de dashboard en Supabase: `dashboard_rolling_grid` y `dashboard_event_highlights` con filtrado por `current_org_id()` y RLS activa.
- Tests pgTAP para garantizar aislamiento por organizacion y acceso de roles con membership activa.
- Dashboard funcional con KPIs, highlights y timeline semanal; estados loading/empty/error con banners y toasts.
- Adapters de datos y hooks con React Query para consumir RPCs desde el cliente.

## Como se probo
- `npx supabase start`
- `npx supabase db reset --yes`
- `npx supabase test db`
- `corepack pnpm test`
- `corepack pnpm exec playwright test`
- `corepack pnpm build` (con variables locales de Supabase)

## Decisiones importantes
- RPCs usan `security definer` + `row_security = on` y filtran por `current_org_id()` para evitar leaks multi-tenant.
- El dashboard se alimenta exclusivamente via RPCs; no hay logica critica en el frontend.
- `docs/MASTER_PLAN.md` se usa como checklist principal del sprint.

## Riesgos / Follow-ups
- Confirmar `turbopack.root` para evitar warning por lockfiles fuera del repo.
- Revisar migration a `proxy` por la advertencia de middleware en Next.js.
- Si `npx supabase start` falla por conflicto de contenedores (ej. `supabase_vector_CHEFOS`), eliminar el contenedor parado y reintentar el arranque.
