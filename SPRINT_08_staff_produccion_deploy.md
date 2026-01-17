# Sprint 08 — Staff scheduler + Producción + Deploy/QA (S1–S2)

## Objetivo
Completar la operación diaria: **planificación de staff** (turnos/vacaciones/shortages), **producción** (plans + tasks con estados) y un **pipeline de deploy** estable (staging/producción) con QA.

## Archivos guía (leer antes de empezar)
- `04_flows.md` (staff scheduling + planning de producción)
- `02_components.md` (CalendarGrid)
- `03_models.md` (production_plans/tasks)
- `06_roles.md` (Chef/Kitchen)
- `ROADMAP.md` (Sprint3 y slices de staff)
- `DEPLOY.md` (deploy)
- `CODE_REVIEW.md` (mejoras QA/observabilidad)

## Módulos afectados
- `staff` (nuevo)
- `production` (nuevo)
- `shared/ui` (CalendarGrid, KPIs, confirm)
- `deploy/ops` (scripts y entornos)

## Rutas afectadas
- `/staff`
- `/dashboard` (shortages/highlights)
- (si aplica) `/events/:id` (quick actions a producción/staff)

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones: shifts/vacations + production enhancements.
- [ ] RLS: policies para staff y producción.
- [ ] UI básica: calendario staff 7 días + tablero de producción.
- [ ] Tests: DB (RLS), integration, E2E flujos críticos.
- [ ] Deploy: staging con smoke tests.
- [ ] Docs: inventory y runbooks.

---

## Tareas técnicas

### DB (Staff)
- [ ] Crear tablas:
  - `shifts` (org_id, hotel_id, user_id, starts_at, ends_at, role, status)
  - `time_off` (org_id, user_id, starts_at, ends_at, type)
  - (Opcional MVP) `staffing_requirements` por event_service.
- [ ] Query/RPC para “shortages” en rango semanal (dashboard/staff).
- [ ] Tests pgTAP:
  - Solo miembros ven/insertan shifts de su org.
  - Validación `starts_at < ends_at`.

### DB (Producción)
- [ ] Completar producción:
  - `production_plans` por `event_service`
  - `production_tasks` con estados/priority/station
- [ ] Server action / RPC para actualizar estado de task (draft → in_progress → done).
- [ ] Tests pgTAP:
  - Solo roles Kitchen/Chef/Admin pueden mutar tasks.

### UI (Staff)
- [ ] `/staff`:
  - `CalendarGrid` 7 días con navegación
  - Badges shortages (orange/red)
  - Formulario simple para añadir turno y vacaciones

### UI (Producción)
- [ ] Vista producción (puede vivir en `/dashboard` o ruta interna):
  - Lista de tasks por evento/servicio
  - Acciones rápidas: marcar en progreso / done
  - Filtros por fecha y hotel

### Integración con eventos
- [ ] En detalle de evento (o quick actions):
  - “Generar plan de producción” (crea plan + tasks base)
  - “Ir a staff” (pre-filtrado por fecha)

### Tests
- [ ] Unit:
  - Validadores de turnos/vacaciones
  - Estados de tareas
- [ ] Integration:
  - crear shifts + leer shortages
  - crear plan + actualizar tasks
- [ ] E2E:
  - Login → crear turno → ver en calendario
  - Login → marcar task done

### Deploy / QA
- [ ] Preparar entornos:
  - variables (SUPABASE_URL, SUPABASE_ANON_KEY, service role solo server)
  - secrets edge functions (GEMINI_API_KEY si existe)
- [ ] Staging:
  - deploy automático en PR o rama staging
  - smoke tests post-deploy (login + dashboard)
- [ ] Checklist final:
  - CSP headers
  - No service role en cliente
  - Logs estructurados básicos

### Docs / inventory
- [ ] `docs/inventory/080_sprint08.md`:
  - runbook de deploy
  - checklist de QA
  - decisiones de shortages y roles

---

## DoD del sprint
- `/staff` operativo (turnos + vacaciones + shortages).
- Producción operativa (plans + tasks + estados).
- Deploy en staging con smoke tests.
- RLS verificada por tests.
- Documentación completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
