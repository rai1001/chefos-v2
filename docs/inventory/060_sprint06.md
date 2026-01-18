# Sprint 06 - Net-to-buy + Reservas + Barcodes

## Mitigacion de riesgos (arranque del sprint)
- Recalculo de disponibilidad: trigger/RPC en INSERT/UPDATE/DELETE de `stock_reservations` + pgTAP de altas/bajas.
- Unicidad de barcode: indice unico por `(org_id, barcode)` + validacion UI y test pgTAP.
- Net-to-buy: mostrar `Reserved`/`Available` para evitar 0 falsos cuando no hay reservas.
- RLS: policies separadas por rol (purchasing/admin vs chef/kitchen) y tests por usuario (owner/member/guest).

## Pendientes del sprint (checklist)
- [x] Migraciones: stock_levels, stock_reservations, product_barcodes + RPC/trigger.
- [x] RLS y pgTAP: aislamiento por org, recalculo available_on_hand, unicidad de barcode.
- [x] UI `/orders/:id` y `/inventory`: net-to-buy y asignacion de barcode.
- [x] Tests unit/integration/E2E.
- [x] Documentacion final del sprint.

## Registro inicial (primer commit del sprint)
- DB: tablas `stock_levels`, `stock_reservations`, `product_barcodes` + triggers de disponibilidad.
- RLS: policies por org y rol, unicidad de barcode por org.
- UI: net-to-buy en detalle de pedido y flujo barcode en inventario.
- Tests: unitarios de net-to-buy y barcode, pgTAP de reservas y unicidad.

## Modelo de datos (resumen)
- `stock_levels`: on_hand + available_on_hand con recalculo automatico.
- `stock_reservations`: reservas activas/canceladas por evento.
- `product_barcodes`: barcode por org con referencia a `supplier_items`.

## Formula de disponibilidad
- `available_on_hand = on_hand - sum(reservas activas)` cuando `consider_reservations=true`.
- Si `consider_reservations=false`, disponible = on_hand.

## UI (capturas)
- Pendiente: capturas de `/orders/:id` y `/inventory` con net-to-buy y barcode.

## Pruebas ejecutadas
- `corepack pnpm test`
- `npx supabase test db`
- `corepack pnpm exec playwright test --reporter=list`

## Resumen final
- Rutas: `/orders/:id`, `/inventory`.
- Tablas: `stock_levels`, `stock_reservations`, `product_barcodes`.
- Policies: lectura por org, escritura limitada por rol (admin/purchasing/chef/kitchen).
