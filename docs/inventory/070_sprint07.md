# Sprint 07 - OCR Importer + Menus

## Mitigacion de riesgos (arranque del sprint)
- Seguridad: sin API keys hardcodeadas; usar secrets y rate limiting en edge function.
- RLS: staging y commit solo para org actual; policies por rol (admin/planner/purchasing).
- Idempotencia: `import_commit` no debe duplicar al re-ejecutar.
- UX: errores amigables en importer y commit bloqueado si hay filas invalidas.

## Pendientes del sprint (checklist)
- [x] Migraciones: import_jobs/import_rows, menu_templates/overrides + RPC import_commit.
- [x] RLS y pgTAP: aislamiento por org, invalid rows bloquean commit, idempotencia.
- [x] UI: ImporterPage y menus en /settings.
- [x] Tests unit/integration/E2E.
- [x] Documentacion final del sprint.

## Resumen
- Rutas: `/importer`, `/settings` (menus), `/inventory` boton a importer.
- DB: tablas `import_jobs`, `import_rows`, `menu_templates`, `menu_overrides`; RPC `import_commit`.
- Policies: acceso por org; manage para admin/planner/purchasing (staging) y admin/planner (menus).
- UI: wizard de importer con pasos upload/scan/review/commit; seccion menus en settings.

## Pruebas ejecutadas
- `corepack pnpm test`
- `npx supabase test db`
- `corepack pnpm exec playwright test --reporter=list`
