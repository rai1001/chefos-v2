# Sprint 00 — Cimientos (A0)

## Objetivo
Dejar el proyecto **arrancable y testeable de extremo a extremo** (local + CI), con Supabase local funcionando, esquema base aplicado, RLS mínima activa y una UI “esqueleto” navegable.

## Archivos guía (leer antes de empezar)
- `agent.md` (regla: documentar TODO en `docs/inventory`)
- `PLAN_REWRITE.md` (visión de sprints base)
- `ARCHITECTURE.md` (capas y módulos)
- `SLICES.md` (Definition of Done por slice)
- `ROADMAP.md` (Slice A0 – Cimientos)
- `DECISIONS.md` (mandatos de stack / estructura)
- `SPEC_SUPABASE_SCHEMA.sql` (schema baseline)
- `SPEC_RLS.md` (helpers/políticas mínimas)
- `DEPLOY.md` (comandos y checklist de humo)

## Módulos afectados
- `orgs` (multitenancy base)
- `auth` (placeholder + wiring inicial)
- `shared` (layout, utilidades, testing)

## Rutas afectadas
- `/` (home + redirección si no hay sesión)
- `/login` (placeholder)
- `/dashboard` (placeholder)

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Repo inicial con convenciones (commits, PR template, scripts, lint/test).
- [ ] Supabase local: `npx supabase start` y `npx supabase db reset` pasan.
- [ ] Migración baseline aplicada (schema + seeds idempotentes).
- [ ] RLS habilitada y políticas mínimas verificadas.
- [ ] UI básica: layout + navegación + placeholders de rutas críticas.
- [ ] Tests: DB (pgTAP), unit/integration (mínimos), E2E smoke.
- [ ] Docs: cada acción registrada en `docs/inventory`.

---

## Tareas técnicas

### DB (Supabase / Postgres)
- [ ] Crear proyecto Supabase local (carpeta `supabase/`).
- [ ] Aplicar **baseline** desde `SPEC_SUPABASE_SCHEMA.sql`.
- [ ] Añadir helpers y políticas mínimas de `SPEC_RLS.md`:
  - `current_org_id()`
  - `is_member(role)`
  - RLS activa en tablas base (`orgs`, `org_members`, `hotels`).
- [ ] Seed idempotente mínimo:
  - 1 org
  - 1 hotel
  - 1 membership activo (para un usuario de pruebas)
- [ ] Añadir tests DB (pgTAP) para:
  - Aislamiento por `org_id` (multi-tenant)
  - Acceso solo si `org_members.is_active = true`

### UI (Next.js)
- [ ] Scaffold de Next.js (App Router) con TypeScript + Tailwind.
- [ ] `AppShell` mínimo (sidebar/topbar) + placeholders.
- [ ] Rutas con contenido mínimo y estados vacíos:
  - `/`, `/login`, `/dashboard`

### Auth / middleware
- [ ] Variables de entorno locales (sin secrets en repo).
- [ ] `middleware.ts` placeholder: redirigir a `/login` si no hay sesión.
- [ ] Preparar `lib/supabase/{server,client}.ts` (server usa service role **solo** en server actions; client usa anon key con RLS).

### Tests
- [ ] DB: `npx supabase test db` (pgTAP) en CI.
- [ ] Unit: smoke de componentes base (render de layout y login placeholder).
- [ ] E2E: Playwright smoke (carga `/login`, navega a `/dashboard` placeholder).

### Docs / inventory
- [ ] Crear/actualizar:
  - `docs/inventory/000_sprint00.md` con comandos ejecutados, decisiones y capturas (si aplica).
  - Actualizar `DECISIONS.md` si hay cambios de stack/estructura.

---

## DoD del sprint
- Comandos pasan local y en CI:
  - `npx supabase db reset`
  - `npx supabase test db`
  - `pnpm test`
  - `pnpm exec playwright test`
- RLS validada por tests (no “a ojo”).
- Seeds idempotentes.
- Documentación en `docs/inventory` completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales (feat:, fix:, chore:, test:, refactor:).
- Usar la plantilla de PR del plan maestro.
- Tests por commit y **validación RLS antes de marcar “completo”**.
