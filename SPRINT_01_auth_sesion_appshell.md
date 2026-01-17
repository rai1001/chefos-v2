# Sprint 01 — Auth, sesión, middleware y AppShell (P1)

## Objetivo
Implementar **login real** con Supabase Auth, persistencia de sesión, protección de rutas con middleware y un **AppShell** usable (navegación + select de hotel/org), dejando todas las rutas críticas accesibles (aunque sea con placeholders).

## Archivos guía (leer antes de empezar)
- `SPEC_APP_ARCH.md` (layout, middleware, supabase server/client)
- `01_routes.md` (inventario de rutas)
- `02_components.md` (AppShell, PageHeader, CommandPalette, Skeleton/Banners)
- `06_roles.md` y `DECISIONS.md` (roles + RBAC y mandatos)
- `04_flows.md` (flujo de login)
- `SPEC_RLS.md` (cómo se resuelve org activa)

## Módulos afectados
- `auth`
- `orgs` (selección de org/hotel activa)
- `shared/ui` (AppShell, PageHeader, Skeleton, banners)

## Rutas afectadas
- `/login`
- `/` (redirige según sesión)
- `/dashboard` (ya protegida)
- Placeholders protegidos:
  - `/events`, `/events/new`
  - `/orders`
  - `/inventory`
  - `/staff`
  - `/settings`

---

## Checklist corto (alineado con docs/MASTER_PLAN.md)
- [ ] Migraciones/seed: datos mínimos para login y navegación (org, hotel, memberships).
- [ ] RLS: lectura/escritura base controlada por `auth.uid()` + membership.
- [ ] UI básica: AppShell + rutas placeholders + estados loading/empty/error.
- [ ] Tests unit/integration/E2E del flujo de login y guards.
- [ ] Docs: registrar pasos en `docs/inventory`.

---

## Tareas técnicas

### DB
- [ ] Revisar/ajustar tabla de memberships:
  - Asegurar que `org_members` (o `org_memberships` si se normaliza después) soporta `role` y `is_active`.
- [ ] Seed idempotente:
  - Usuario de prueba (documentar cómo se crea en Supabase local)
  - Membership activo con rol (Admin/Planner/Purchasing/Chef/Viewer)
- [ ] Tests pgTAP:
  - Usuario sin membership => 0 rows (select)
  - Usuario con membership => ve solo su `org_id`

### Auth + middleware
- [ ] UI Login (ES): email + password, validación (RHF/Zod o equivalente).
- [ ] Login/logout con Supabase Auth.
- [ ] Middleware:
  - Si no hay sesión => redirect `/login`
  - Si hay sesión pero sin membership activo => pantalla/route de “sin acceso” (o redirect con error)
  - Resolver org activa (por membership) y adjuntarla en request (cookie/headers) para server actions.
- [ ] Bloqueo de service role en cliente:
  - `service role` solo en server actions/API routes.
  - Cliente siempre con anon key + RLS.

### UI
- [ ] AppShell:
  - Sidebar con links a rutas críticas
  - Topbar con selector de hotel/sucursal (si aún no existe, placeholder)
  - Patrón `PageHeader` para listas/detalles
- [ ] Componentes de UX:
  - `SkeletonGrid` / `Banners` para loading/empty/error
  - `ModalConfirm` (base)
  - `CommandPalette` (mínimo: navegación por rutas)

### Tests
- [ ] Unit:
  - Formulario login (validación + submit)
  - Componentes shared (AppShell, PageHeader)
- [ ] Integration:
  - Hook/utility de sesión (server/client) y guardas
- [ ] E2E (Playwright):
  - Login correcto => `/dashboard`
  - Logout => vuelve a `/login`
  - Acceso directo a `/dashboard` sin sesión => redirect

### Docs / inventory
- [ ] `docs/inventory/010_sprint01.md`:
  - Decisión: Supabase Auth (y si se usa o no NextAuth)
  - Convención de cookies/headers para org activa
  - Capturas de rutas placeholders

---

## DoD del sprint
- Flujo `/login` → `/dashboard` funciona local.
- Guards de rutas operativos con middleware.
- Tests mínimos (unit + e2e) verdes.
- RLS verificada con pgTAP.
- `docs/inventory` actualizado.

---

## Recordatorios (NO opcional)
- Documentar cada acción en `docs/inventory`.
- Commits convencionales + PR template.
- Tests por commit y **validación RLS antes de marcar “completo”**.
