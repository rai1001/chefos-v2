# Sprint 05 - Inventario MVP (lotes + caducidades)

## Mitigacion de riesgos (arranque del sprint)
- FEFO: ordenar por `expires_at ASC NULLS LAST` y validar en pgTAP + test unitario del mapper de estado.
- Dedupe de alertas: `dedupe_key` estable (batch_id + rule_id + ventana) y UPSERT con indice unico.
- RLS: policies explicitas por rol (admin/purchasing/chef) y tests pgTAP por usuario (owner/member/guest).
- Seeds/E2E: IDs fijos e idempotentes; script de seed por service role para no depender de auth.
- UI: tabla minima con estados OK/Pronto/Critico, filtros basicos y accion de descarte (solo alerta).

## Pendientes del sprint (checklist)
- [x] Migraciones: locations, batches, rules, alerts + RPC/job.
- [x] RLS y pgTAP: aislamiento por org, FEFO, dedupe.
- [x] UI `/inventory`: tabla, filtros, badges, descartar alerta.
- [x] Tests unit/integration/E2E.
- [x] Documentacion final del sprint.

## Registro inicial (primer commit del sprint)
- DB: migracion con tablas de inventario, tipos de caducidad, indices FEFO y RPC de alertas.
- RLS: policies por rol y pruebas de aislamiento por org en pgTAP.
- Seeds: datos idempotentes con IDs fijos para no romper E2E.
- UI: vista minima de inventario con filtros y accion de descarte de alertas.
- Tests: unitarios para estado de caducidad, integracion (pgTAP) y E2E de inventario.

## Modelo de datos (resumen)
- `inventory_locations`: ubicaciones por org (incluye `hotel_id` y `is_default`).
- `stock_batches`: lotes con stock, expiracion y referencia a `supplier_items`.
- `expiry_rules`: reglas por org con umbrales y severidad.
- `expiry_alerts`: alertas deduplicadas por lote/regla/ventana.

## RPC de alertas (resumen)
- `generate_expiry_alerts(reference_timestamptz default now())`
- Crea alertas para lotes vencidos o proximos a vencer segun reglas activas.
- Deduplica por `dedupe_key` y no modifica stock.

## UI (capturas)
- Pendiente: capturas de `/inventory` cuando el entorno este limpio y estable.

## Pruebas ejecutadas
- `corepack pnpm test`
- `npx supabase test db`
- `corepack pnpm exec playwright test --reporter=list`

## Resumen final
- Rutas: `/inventory`.
- Tablas: `inventory_locations`, `stock_batches`, `expiry_rules`, `expiry_alerts`.
- Policies: lectura por org y rol; escritura limitada para admin/purchasing/chef.
- UI: filtros por ubicacion/estado y accion de descarte de alertas.

## Riesgos y mitigaciones
- Supabase local: usar `npx supabase start --exclude vector` si hay conflicto de contenedor.
- Supabase Studio: mantenemos el puerto 54325 para evitar choques con otros proyectos locales.
- Turbopack: warning de `middleware` a `proxy` pendiente de migracion en sprint posterior.
- UI: capturas pendientes hasta que el entorno tenga una ruta estable para exportarlas.
