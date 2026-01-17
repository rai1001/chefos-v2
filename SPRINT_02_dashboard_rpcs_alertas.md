# Sprint 02 — Dashboard + RPCs + alertas

## Objetivo
Construir el **Dashboard funcional** consumiendo las RPCs clave, mostrando KPIs, highlights y timeline, con alertas UI (toasts/banners) y pruebas que aseguren RLS y permisos.

## Archivos guía (leer antes de empezar)
- `SPEC_API.md` (contratos: Dashboard RPCs)
- `04_flows.md` (flujo de dashboard)
- `02_components.md` (KPICard, CalendarGrid, Skeleton/Banners)
- `05_integrations.md` (RPCs y notificaciones)
- `06_roles.md` (quién puede ver qué)
- `DECISIONS.md` (patrones UI y entrega por slices)

## Módulos afectados
- `dashboard` (nuevo módulo)
- `shared/ui` (KPICard, banners/toasts, skeletons)
- `auth/orgs` (org activa para consultas)

## Rutas afectadas
- `/dashboard`

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migración/RPC: funciones `dashboard_rolling_grid` y `dashboard_event_highlights` disponibles (o stubs).
- [ ] RLS: datos agregados respetan `org_id`.
- [ ] UI básica: KPIs + highlights + estados de carga/error.
- [ ] Tests: integración RPC + e2e login→dashboard.
- [ ] Docs: registrar endpoints/RPCs y datos mock en `docs/inventory`.

---

## Tareas técnicas

### DB (RPCs)
- [ ] Definir/crear (o portar) RPCs:
  - `dashboard_rolling_grid`
  - `dashboard_event_highlights`
- [ ] Asegurar que la RPC **no rompe aislamiento**: filtra por `current_org_id()` o por `org_id` validado.
- [ ] Tests pgTAP:
  - Usuario A no ve agregados de org B.
  - Roles “Viewer” y superiores pueden ejecutar las RPCs.

### UI (Dashboard)
- [ ] Implementar layout:
  - Sección KPIs (tarjetas)
  - Sección highlights (lista)
  - Sección timeline / grid (semana)
- [ ] Estados:
  - Loading: skeletons
  - Empty: copy claro (“No hay eventos próximos”)
  - Error: banner con mensaje user-friendly
- [ ] Notificaciones:
  - Toast/banners para errores de red, sesión expirada, permisos.

### Data / adapters
- [ ] Cliente RPC tipado (domain/data):
  - mapeos DTO→dominio
  - manejo de errores consistente
- [ ] Cache/invalidación (si se usa TanStack Query):
  - `staleTime` razonable
  - reintentos limitados

### Tests
- [ ] Unit:
  - Render del Dashboard con datos mock
  - Componente KPICard
- [ ] Integration:
  - Adapter de RPC (mock supabase o test contra supabase local)
- [ ] E2E:
  - Login → dashboard carga y muestra KPIs
  - Simular error (por ejemplo, sin permisos) y validar banner

### Docs / inventory
- [ ] `docs/inventory/020_sprint02.md`:
  - forma de los payloads de las RPCs
  - cómo se ejecutan local
  - checklist de permisos por rol

---

## DoD del sprint
- Dashboard carga sin errores con sesión válida.
- RPCs protegidas por RLS y tests.
- E2E de dashboard verde.
- Documentación en `docs/inventory` completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
