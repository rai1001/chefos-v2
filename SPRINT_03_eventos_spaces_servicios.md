# Sprint 03 — Eventos: espacios, reservas y servicios (E1–E2)

## Objetivo
Entregar el módulo de **Eventos** completo a nivel MVP: listado, wizard de creación, detalle del evento, asignación de espacios y creación de servicios (event_services), con validaciones de solape y RLS.

## Archivos guía (leer antes de empezar)
- `01_routes.md` (rutas de /events)
- `04_flows.md` (Crear evento)
- `02_components.md` (EventTable, WizardStepper, ModalConfirm)
- `03_models.md` (tablas y relaciones)
- `SPEC_SUPABASE_SCHEMA.sql` (tablas base events/spaces/space_bookings/event_services)
- `DECISIONS.md` (E1/E2: triggers de coherencia, overlaps)
- `SPEC_RLS.md` (patrón org_id + membership)

## Módulos afectados
- `events` (nuevo)
- `orgs/hotels` (selección de hotel)
- `shared/ui` (WizardStepper, EventTable, ModalConfirm)

## Rutas afectadas
- `/events`
- `/events/new`
- `/events/:id` (detalle)

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones: completar modelos/constraints/triggers necesarios (E1/E2).
- [ ] RLS: políticas por tabla (events/spaces/space_bookings/event_services).
- [ ] UI básica: listado + wizard + detalle (con estados vacíos/errores).
- [ ] Tests: DB (solape/coherencia), integration (adapters), E2E (crear evento).
- [ ] Docs: inventario de decisiones y flujos en `docs/inventory`.

---

## Tareas técnicas

### DB
- [ ] Revisar/añadir constraints:
  - `events.starts_at < events.ends_at`
  - `space_bookings.starts_at < space_bookings.ends_at`
- [ ] Función/trigger de coherencia org/hotel (según DECISIONS):
  - Evitar que un `event.hotel_id` pertenezca a otra `org_id`.
  - Validar `spaces.hotel_id` y `space_bookings`.
- [ ] Helper para detectar solapes de bookings (ej: `space_booking_overlaps`).
- [ ] Seeds idempotentes:
  - 1–2 spaces de ejemplo por hotel.
  - 1 evento demo.
- [ ] Tests pgTAP:
  - No se puede insertar booking solapado (si se decide bloquear) o al menos se detecta.
  - Usuario sin membership no ve ni inserta eventos.

### UI (Events)
- [ ] `/events`:
  - Tabla densa (`EventTable`) con filtros (fecha, sucursal) y chips de estado.
  - Acciones rápidas: “Ver”, “Editar”, “Crear”.
- [ ] `/events/new`:
  - WizardStepper con pasos:
    1) Detalles (título, fechas, hotel)
    2) Espacios (selección + horarios)
    3) Servicios (tipo + formato)
    4) Resumen + acciones rápidas (importar menú / generar pedido / agendar staff — placeholders por ahora)
  - Validaciones de formulario (Zod) y mensajes en español.
- [ ] `/events/:id`:
  - Detalle del evento + lista de servicios + reservas de espacios.
  - `ModalConfirm` para acciones críticas (cancelar/eliminar).

### Data / adapters
- [ ] Adaptadores Supabase para:
  - list/create/update `events`
  - list/create `spaces` (por hotel)
  - create `space_bookings`
  - create/update `event_services`
- [ ] Manejo de errores consistente (no mostrar errores técnicos crudos al usuario).

### Auth / middleware
- [ ] Verificar guards:
  - roles que pueden crear/editar eventos (Admin/Planner).
  - Viewer solo lectura.

### Tests
- [ ] Unit:
  - WizardStepper y validaciones por paso.
  - EventTable render y estados.
- [ ] Integration:
  - crear evento + servicios (happy path) contra supabase local.
- [ ] E2E:
  - Login → /events → crear evento → ver detalle.

### Docs / inventory
- [ ] `docs/inventory/030_sprint03.md`:
  - decisiones de solape (bloquea vs avisa)
  - esquema final de tablas y triggers
  - capturas del wizard

---

## DoD del sprint
- Se puede crear un evento y verlo en listado y detalle.
- RLS valida lectura/escritura por org.
- Tests DB + E2E verdes.
- Documentación en `docs/inventory` completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
