# Sprint 04 — Purchasing: proveedores y pedidos (P2)

## Objetivo
Implementar el módulo **Purchasing** mínimo pero funcional: proveedores, artículos de proveedor, pedidos de compra (PO) y líneas, con flujo de estados (draft → approved → ordered → received), RLS por `org_id` y UI conectada.

## Archivos guía (leer antes de empezar)
- `01_routes.md` (/orders, /settings)
- `04_flows.md` (Gestión de pedidos)
- `03_models.md` (purchase_orders, event_purchase_orders)
- `DECISIONS.md` (P1/P2 purchasing: suppliers/supplier_items, receive_purchase_order, reglas de redondeo)
- `SPEC_RLS.md` (pattern membership)
- `SPEC_API.md` (Orders CRUD via server functions)

## Módulos afectados
- `purchasing` (nuevo)
- `settings` (catálogo de proveedores, si se decide)
- `shared/ui` (ModalConfirm, PageHeader, tablas)

## Rutas afectadas
- `/orders` (listado)
- `/orders/:id` (detalle)
- `/settings` (gestión de proveedores/items — MVP)

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones: suppliers, supplier_items, purchase_order_lines, RPC de recepción.
- [ ] RLS: políticas para lectura/escritura por rol.
- [ ] UI básica: listado + detalle + cambio de estado con confirmaciones.
- [ ] Tests: DB (RLS + transición de estados), unit/integration, E2E.
- [ ] Docs: inventario de tablas y decisiones.

---

## Tareas técnicas

### DB
- [ ] Añadir tablas (si no existen):
  - `suppliers` (org_id, name, ...)
  - `supplier_items` (org_id, supplier_id, name, purchase_unit, pack_size, unit_price, ...)
  - `purchase_order_lines` (org_id, purchase_order_id, supplier_item_id, qty, unit_price, rounding_rule, pack_size, ...)
- [ ] Definir enums/constraints:
  - `purchase_status` (draft/approved/ordered/received)
  - reglas de redondeo: `none`, `ceil_unit`, `ceil_pack` (pack_size > 0)
- [ ] RPC `receive_purchase_order` (recepción atómica):
  - valida transición de estado
  - guarda cantidades recibidas
  - (si inventario aún no está) dejar hooks/stubs para movimientos
- [ ] Seeds idempotentes:
  - 1 supplier + 3 items
  - 1 PO en draft con líneas
- [ ] Tests pgTAP:
  - RLS: usuario de otra org no ve suppliers/POs
  - Transición inválida falla
  - Solo roles permitidos pueden aprobar/recibir

### UI (Purchasing)
- [ ] `/orders`:
  - Tabla con estados (draft/approved/ordered/received)
  - Filtros por hotel y fecha (mínimo)
  - Acción “Crear pedido” (MVP)
- [ ] `/orders/:id`:
  - Header con estado + acciones (aprobar, marcar ordered, recibir)
  - Tabla de líneas (item, qty, pack, precio)
  - `ModalConfirm` para cambios de estado
- [ ] `/settings` (MVP):
  - CRUD simple de proveedores y sus items (aunque sea solo “crear y listar”)

### Auth / middleware
- [ ] Permisos por rol:
  - Admin/Purchasing: crear/editar/recibir
  - Planner: lectura + generar borradores (si aplica)
  - Viewer: lectura

### Tests
- [ ] Unit:
  - Lógica de transición de estados (dominio)
  - Validaciones de líneas (redondeo)
- [ ] Integration:
  - Adapter create/list/update PO contra supabase local
- [ ] E2E:
  - Login → /orders → ver detalle → aprobar

### Docs / inventory
- [ ] `docs/inventory/040_sprint04.md`:
  - esquema purchasing + RLS
  - reglas de redondeo
  - endpoints/server actions usados

---

## DoD del sprint
- Se pueden crear/listar/ver pedidos y cambiar estados con permisos.
- RLS verificada por pgTAP.
- E2E mínimo pasando.
- Documentación en `docs/inventory` completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
