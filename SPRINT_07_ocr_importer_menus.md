# Sprint 07 — OCR Importer + Menús/Overrides (I1–I2)

## Objetivo
Implementar el flujo de **importación por OCR** (staging → validación → commit) y el núcleo de **menús** (templates y overrides), garantizando seguridad (secrets, rate limiting) y RLS.

## Archivos guía (leer antes de empezar)
- `04_flows.md` (Importación OCR)
- `SPEC_API.md` (Importer: import_rows + rpc import_commit)
- `05_integrations.md` (OCR Importer + Gemini)
- `CODE_REVIEW.md`/`ACTION_PLAN.md` (seguridad: API key, rate limiting)
- `02_components.md` (ImporterPage)
- `SPEC_RLS.md` (RLS)

## Módulos afectados
- `importer` (nuevo)
- `menus` (nuevo)
- `edge-functions` (OCR)
- `shared/ui` (ImporterPage, banners, confirmaciones)

## Rutas afectadas
- `/inventory` (botón/entrada a importación)
- `/settings` (menús y mappings — MVP)

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones: import_jobs/import_rows + menus templates/overrides + RPC `import_commit`.
- [ ] RLS: staging y commit protegidos por `org_id`.
- [ ] UI básica: ImporterPage con pasos y validaciones.
- [ ] Tests: DB (RLS + commit), integration, E2E import smoke.
- [ ] Docs: inventario del proceso OCR y variables de entorno.

---

## Tareas técnicas

### DB
- [ ] Crear tablas staging:
  - `import_jobs` (org_id, status, source, created_by)
  - `import_rows` (org_id, job_id, row_number, raw_json, errors_json, is_valid)
- [ ] Crear tablas de menús (núcleo):
  - `menu_templates` (org_id, name, version, payload_json)
  - `menu_overrides` (org_id, event_id, template_id, override_json)
  - (Opcional MVP) `ingredient_aliases` / `supplier_item_aliases` para mapeo.
- [ ] RPC `import_commit`:
  - valida que el job pertenece a la org activa
  - solo permite commit si todas las filas críticas son válidas
  - escribe en tablas destino (proveedor/items/menús) de forma transaccional
- [ ] Tests pgTAP:
  - usuario de otra org no puede leer/escribir staging
  - `import_commit` falla si hay filas inválidas
  - `import_commit` no duplica si se re-ejecuta (idempotencia)

### Edge Functions (OCR)
- [ ] Implementar función `ocr_process/enqueue` (y `run` si aplica):
  - recibe attachment/job
  - llama a Gemini/IA y produce filas estructuradas
  - inserta en `import_rows`
- [ ] Seguridad obligatoria (del CODE_REVIEW/ACTION_PLAN):
  - **Prohibido** hardcodear API keys: solo `GEMINI_API_KEY` via secrets
  - Añadir rate limiting por org (p.ej. 10 req/min)
  - Timeouts en llamadas a IA
  - Logging estructurado (sin `console.log` suelto)

### UI (Importer)
- [ ] `ImporterPage` (wizard):
  1) Subida de archivo
  2) OCR/scan (progreso)
  3) Validación de columnas/filas (tabla de errores)
  4) Confirmación y commit
- [ ] UX:
  - Estados vacíos claros
  - Error user-friendly (sin códigos PGRST crudos)
  - `ModalConfirm` antes de commit

### UI (Menús)
- [ ] `/settings` MVP:
  - Listar/crear `menu_templates`
  - Aplicar override a un evento (placeholder en UI si falta pantalla de evento avanzada)

### Auth / permisos
- [ ] Roles:
  - Admin/Planner: pueden importar y commitear
  - Purchasing: puede importar items/proveedores
  - Viewer: solo lectura

### Tests
- [ ] Unit:
  - validadores de columnas (supplier, productos, fechas)
  - normalización de filas OCR
- [ ] Integration:
  - `import_commit` (happy path + invalid)
- [ ] E2E:
  - Login → abrir importer → subir sample → ver staging → commit

### Docs / inventory
- [ ] `docs/inventory/070_sprint07.md`:
  - variables de entorno y secrets (sin exponer valores)
  - diagrama corto del flujo OCR
  - endpoints y payloads

---

## DoD del sprint
- Importer permite subir, validar y commitear datos en DB.
- Edge function sin secretos en código y con rate limiting.
- RLS + tests DB validan aislamiento.
- E2E smoke verde.
- Documentación completa.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
