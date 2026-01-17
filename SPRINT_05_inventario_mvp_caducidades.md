# Sprint 05 — Inventario MVP (lotes + caducidades)

## Objetivo
Entregar un **Inventario usable**: ubicaciones/almacenes, lotes con FEFO (first-expire-first-out) y alertas de caducidad (reglas por org), con UI en `/inventory` y RLS estricta.

## Archivos guía (leer antes de empezar)
- `01_routes.md` (/inventory)
- `02_components.md` (InventoryTable, badges, filters)
- `04_flows.md` (inventario y alertas)
- `DECISIONS.md` (Inventario por lotes + alertas de caducidad)
- `06_roles.md` (Chef/Kitchen/Purchasing)
- `SPEC_RLS.md` (patrón org_id)

## Módulos afectados
- `inventory` (nuevo)
- `purchasing` (referencia a supplier_items como producto comprable)
- `shared/ui` (InventoryTable, filtros, banners)

## Rutas afectadas
- `/inventory`

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones: locations + batches + rules/alerts.
- [ ] RLS: políticas por tabla (lectura/escritura) y tests.
- [ ] UI básica: tabla de inventario con filtros y badges de caducidad.
- [ ] Tests: DB (RLS + FEFO), unit/integration, E2E smoke.
- [ ] Docs: inventario actualizado en `docs/inventory`.

---

## Tareas técnicas

### DB
- [ ] Crear tablas (mínimo):
  - `inventory_locations` (org_id, hotel_id, name, is_default)
  - `stock_batches` (org_id, location_id, supplier_item_id, qty_on_hand, expires_at NULLable, source)
  - `expiry_rules` (org_id, threshold_days, severity, is_active)
  - `expiry_alerts` (org_id, batch_id, rule_id, severity, status, dedupe_key)
- [ ] Decisión clave (seguir DECISIONS):
  - `supplier_items` es el “producto” comprable; **no** crear tabla `products` nueva si no es necesaria.
  - FEFO ordena por `expires_at` (NULL al final).
- [ ] Job/RPC protegido para generar alertas:
  - deduplica por (batch_id + rule_id + ventana)
  - no modifica stock, solo crea/actualiza `expiry_alerts`
- [ ] Seeds idempotentes:
  - 2 locations
  - 4 batches (incluyendo uno sin `expires_at`)
  - 1 regla de caducidad
- [ ] Tests pgTAP:
  - RLS: otra org no ve batches/alerts
  - FEFO: orden correcto (expires_at asc, NULL last)
  - Dedupe: no duplica alertas si se re-ejecuta el job

### UI (Inventory)
- [ ] `/inventory`:
  - InventoryTable con columnas: Item, Ubicación, On hand, Expires, Estado (OK/Pronto/Crítico)
  - Filtros: ubicación + estado caducidad
  - Acciones MVP: “Descartar alerta” (solo cambia estado de alert, no stock)
  - Estados: loading/empty/error coherentes

### Auth / permisos
- [ ] Roles:
  - Chef/Kitchen: lectura + descartar alertas
  - Purchasing: lectura
  - Admin: todo

### Tests
- [ ] Unit:
  - lógica de “estado de caducidad” (mapping días→badge)
- [ ] Integration:
  - adapter listInventory (batches + join a supplier_items + alerts)
- [ ] E2E:
  - Login → /inventory → ver tabla y filtrar

### Docs / inventory
- [ ] `docs/inventory/050_sprint05.md`:
  - modelo de datos inventario
  - job/RPC de alertas (inputs/outputs)
  - capturas de UI

---

## DoD del sprint
- `/inventory` muestra lotes y alertas de caducidad.
- RLS validada por tests.
- Seeds idempotentes.
- E2E smoke verde.
- Documentación completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
