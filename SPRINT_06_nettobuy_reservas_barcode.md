# Sprint 06 — Neteo (Net-to-buy) + Reservas + Barcodes (PR3–PR4)

## Objetivo
Reducir errores y sobre-compra: implementar **neteo de inventario** (on_hand vs disponible) y **reservas por evento** que impactan la disponibilidad (sin descontar stock físico), además del primer flujo de **barcode→supplier_item** para entrada rápida.

## Archivos guía (leer antes de empezar)
- `DECISIONS.md` (PR4 reservas, barcodes, inventario por lotes)
- `04_flows.md` (gestión de pedidos + producción)
- `03_models.md` (event_purchase_orders, purchase_orders)
- `06_roles.md` (Purchasing/Chef)
- `SPEC_RLS.md` (RLS patrón org_id)

## Módulos afectados
- `inventory` (disponible, reservas, barcodes)
- `purchasing` (líneas con neteo)
- `events` (reservas ligadas a eventos)

## Rutas afectadas
- `/orders/:id` (detalle con net-to-buy)
- `/inventory` (vista + entrada por barcode)

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones: stock_levels + reservations + product_barcodes.
- [ ] RLS: políticas y tests por tabla.
- [ ] UI básica: net-to-buy en detalle de pedido + asignación de barcode.
- [ ] Tests: DB (available_on_hand), integration, E2E mínimo.
- [ ] Docs: decisión de “reservas no descuentan on_hand”.

---

## Tareas técnicas

### DB
- [ ] Añadir/normalizar tablas:
  - `stock_levels` (org_id, location_id, supplier_item_id, on_hand, available_on_hand, consider_reservations)
  - `stock_reservations` (org_id, event_id, event_service_id NULLable, supplier_item_id, qty_reserved, status)
  - `product_barcodes` (org_id, barcode text unique por org, supplier_item_id)
- [ ] Reglas (según DECISIONS):
  - Las reservas **NO descuentan** `stock_levels.on_hand`.
  - Si `consider_reservations` está activo, `available_on_hand = on_hand - sum(reservations activas)`.
- [ ] RPC/trigger para recalcular `available_on_hand` (al crear/cancelar reservas).
- [ ] Seeds idempotentes:
  - niveles de stock para 3 items
  - 1 reserva activa vinculada a evento
  - 1 barcode asignado
- [ ] Tests pgTAP:
  - `available_on_hand` se reduce con reservas
  - desactivar `consider_reservations` ignora reservas
  - barcode único por org

### UI (Purchasing)
- [ ] En `/orders/:id`:
  - Mostrar por línea: **Need** (cantidad requerida), **On hand**, **Reserved**, **Available**, **Net to buy**, **Rounded**.
  - Si Net-to-buy <= 0, sugerir 0 compra.
  - Indicadores visuales (badge) cuando hay conflicto por reservas.

### UI (Inventory)
- [ ] En `/inventory`:
  - Campo “Escanear/introducir barcode”.
  - Si barcode existe → navegar/abrir detalle del item.
  - Si barcode es desconocido → flujo para asignarlo a un `supplier_item` existente.

### Auth / permisos
- [ ] Purchasing/Admin: editar pedidos + asignar barcodes.
- [ ] Chef/Kitchen: crear/gestionar reservas (o al menos lectura) según necesidad.

### Tests
- [ ] Unit:
  - cálculo net-to-buy (dominio)
  - validación barcode (formato + unicidad simulada)
- [ ] Integration:
  - crear reserva y verificar `available_on_hand`
- [ ] E2E:
  - login → ver pedido → net-to-buy visible
  - asignar barcode desconocido a item

### Docs / inventory
- [ ] `docs/inventory/060_sprint06.md`:
  - modelo de reservas
  - fórmula de disponibilidad
  - capturas del net-to-buy

---

## DoD del sprint
- Net-to-buy calculado y mostrado en UI.
- Reservas impactan disponibilidad sin tocar on_hand.
- Barcodes asignables y consultables.
- RLS + tests DB validados.
- Documentación completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
