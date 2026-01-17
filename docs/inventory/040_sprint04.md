# Sprint 04 - Purchasing: proveedores y pedidos

## Que se hizo
- Migracion con tablas `suppliers`, `supplier_items`, `purchase_order_lines`, enum `rounding_rule` y trigger de transiciones de estado.
- RPC `receive_purchase_order` y trigger `validate_rounding_pack` para reglas de redondeo.
- RLS por rol: Admin/Purchasing pueden escribir; Viewer solo lectura.
- Seeds con proveedor, items y pedido en draft con lineas.
- Migracion adicional `0005_purchasing_relations.sql` para FK de `purchase_orders.supplier_id` y habilitar joins en PostgREST.
- UI de pedidos: listado, detalle con acciones de estado y ajustes de proveedores en `/settings`.
- Adapters y hooks para proveedores, items y pedidos.
- E2E reforzado con login via API y script `scripts/seed-data.mjs` para datos base.
- Scripts de auth con reintentos para evitar fallos temporales del servicio.
- Tests unit/integration/E2E para estados, adapters y flujo de aprobar pedido.

## Como se probo
- `npx supabase db reset --yes --debug`
- `npx supabase test db`
- `corepack pnpm test`
- `corepack pnpm exec playwright test`
- `corepack pnpm build` (con variables locales de Supabase; sin ellas falla por validacion en `AuthProvider`)

## Decisiones importantes
- Transiciones de estado validadas en DB: draft -> approved -> ordered -> received.
- `receive_purchase_order` solo permite recibir pedidos `approved` o `ordered`.
- `rounding_rule=ceil_pack` exige `pack_size > 0`.

## Riesgos / Follow-ups
- UI de crear pedido nuevo queda como placeholder; ampliar en sprints posteriores.
- Revisar que roles Planner puedan generar borradores si se decide ampliar.
- Playwright depende de `supabase db reset` para restaurar Auth si se rompe el esquema local.
