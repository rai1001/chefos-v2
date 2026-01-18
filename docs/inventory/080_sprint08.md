# Sprint 08 - Staff + Produccion + Deploy

## Mitigacion de riesgos (arranque del sprint)
- RLS: shifts/time_off/production_tasks solo org actual; roles kitchen/chef/admin para mutar tareas.
- Datos validos: `starts_at < ends_at` en shifts/time_off; estados de tasks controlados (draft/in_progress/done).
- Shortages: RPC no debe exponer otras orgs; queries acotadas a rango semanal.
- Deploy: sin service role en cliente; headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options) pendientes.
- Tests: pgTAP para RLS/estados; E2E smoke para staff y produccion.

## Pendientes del sprint (checklist)
- [ ] Migraciones: shifts/time_off + production enhancements + shortages RPC.
- [ ] RLS y pgTAP.
- [ ] UI: /staff calendario 7 dias + tablero produccion.
- [ ] Tests unit/integration/E2E.
- [ ] Deploy/QA: checklist y runbook.
- [ ] Documentacion final del sprint.

## Avances
- DB/RLS: migracion `0009_staff_production.sql` con `shifts`, `time_off`, estados de tareas y RPCs `get_staff_shortages`, `update_production_task_status`; policies por org y rol.
- Tests DB: `supabase/tests/staff_production.sql` validando RLS y transiciones.
- UI: `/staff` con formularios de turnos/tiempo libre y badge de shortages; tablero de produccion placeholder en `/dashboard`.
- Tests: `corepack pnpm test`, `corepack pnpm exec playwright test --reporter=list`.

## Runbook QA/Deploy (borrador)
- Variables obligatorias: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo server/seed).
- Comandos smoke: `corepack pnpm test`, `npx supabase test db`, `corepack pnpm exec playwright test --reporter=list`.
- Seguridad: sin service role en cliente; headers CSP/X-Frame-Options/X-Content-Type-Options pendientes.
