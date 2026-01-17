# MASTER PLAN - Rewrite ChefOS

## 1) Resumen del proyecto
- App SaaS de gestion de cocina para operaciones multi-sucursal.
- Resuelve control de eventos, compras, inventario y produccion con datos centralizados.
- Objetivo del rewrite: empezar limpio y estable, sin migraciones rotas ni deuda heredada.

## 2) Objetivos del rewrite
- Estabilidad: base de datos confiable y flujos sin errores silenciosos.
- Seguridad multi-tenant: aislamiento total por organizacion.
- UI consistente: patrones compartidos, estados claros y navegacion predecible.
- Codigo mantenible: modulos claros, responsabilidades separadas, sin cruces innecesarios.
- Test coverage realista pero fuerte: cubrir lo critico en cada commit.

## 3) Arquitectura (alto nivel)
- Frontend: Next.js (Vercel), App Router, UI y orquestacion de estado.
- Backend: Supabase (Postgres + RLS + Auth).
- Auth: Supabase Auth (email/password; extensible).
- Multi-tenant: orgs + org_members; todo dato tenant-scoped con org_id.
- RLS: Row Level Security activo por defecto en todas las tablas operativas.
- Regla critica: service role nunca en cliente, solo en server actions o backend seguro.

## 4) Modelo multi-tenant (estandar)
Modelo recomendado:
- orgs
- org_members (user_id, org_id, role, is_active)
- org_id en todas las tablas tenant-scoped

Tablas tipicas (conceptos, no campos):
- products / ingredients
- recipes
- inventory
- stock_movements
- suppliers
- purchases
- orders
- kitchen_tasks
- events
- production_plans
- alerts

## 5) Seguridad y RLS (reglas obligatorias)
Checklist:
- [ ] Cada tabla operativa tiene org_id.
- [ ] SELECT solo dentro del org (current_org_id / org_members).
- [ ] INSERT obliga org_id correcto.
- [ ] UPDATE no permite cambiar org_id.
- [ ] DELETE solo dentro del org.
- [ ] Roles y permisos (owner/admin/manager/staff) definidos y probados.
- [ ] Evitar leaks por joins y vistas sin filtro.
- [ ] RPCs y funciones filtran por org_id o current_org_id.

## 6) Convencion de commits (obligatoria)
Usar Conventional Commits:
- feat(module): descripcion clara
- fix(module): descripcion clara
- test(module): descripcion clara
- refactor(module): descripcion clara
- docs(module): descripcion clara
- chore(module): descripcion clara

Ejemplos:
- feat(auth): add login flow with supabase
- fix(rls): prevent cross-org reads in events
- test(dashboard): add rpc adapter integration tests
- refactor(ui): extract shared page header
- docs(sprint): add sprint 02 inventory
- chore(ci): add supabase test db step

## 7) Pull Requests / merges (documentacion por cambio)
Plantilla de PR (copiar/pegar):

```
# Que cambia
- [ ] DB / migraciones:
- [ ] RLS / seguridad:
- [ ] Backend / API / RPC:
- [ ] UI:
- [ ] Tests:

# Por que
- Contexto / objetivo:

# Como probar
- Comandos:
- Datos seed usados:

# Checklist seguridad multi-tenant
- [ ] org_id presente en tablas nuevas
- [ ] RLS activo en tablas nuevas
- [ ] Policies probadas (owner vs no-owner)
- [ ] RPCs filtran por org_id
- [ ] No hay service role en cliente

# Checklist UI
- [ ] Rutas navegables
- [ ] Estados loading/empty/error
- [ ] Accesibilidad basica (labels, focus)

# Checklist tests
- [ ] Unit tests
- [ ] Integration tests (RLS / Supabase local)
- [ ] E2E (si aplica)
```

## 8) Estrategia de testing (muy importante)
Niveles:
- Unit tests (Vitest/Jest): logica pura, componentes simples, validaciones.
- Integration tests (Supabase local + RLS): adapters, RPCs, policies.
- E2E tests (Playwright): flujos completos login -> dashboard -> acciones clave.

Siempre con tests:
- Autenticacion y guardas de ruta.
- Cualquier cambio en RLS, policies o RPCs.
- Flujos criticos (crear evento, pedido, recepcion, inventario).
- Cambios en manejo de roles o permisos.

Reglas de "tests por commit":
- Cada commit que toca logica debe incluir tests.
- Si un commit rompe tests, el siguiente commit los corrige inmediatamente.

## 9) Regla de oro: tests por commit
- Todo commit que cambia logica => tests.
- Todo commit que toca RLS o multi-tenant => tests obligatorios.
- Todo commit que toca flujos criticos => minimo 1 integration o e2e.
- Refactor => al menos asegurar tests existentes pasan.

## 10) Pipeline CI recomendado (GitHub Actions)
Pipeline ejemplo (resumen):
- lint
- typecheck
- unit tests
- integration tests (Supabase local + RLS)
- e2e opcional (main o nightly)

Notas:
- Mantener variables seguras fuera del repo.
- Usar cache de dependencias para acelerar builds.

## 11) Checklist de Definition of Done
- [ ] Docs actualizadas (incluye docs/inventory).
- [ ] Tests incluidos y pasando.
- [ ] RLS verificado (owner vs no-owner).
- [ ] UI validada (rutas + estados).
- [ ] Sin secretos en cliente.
- [ ] Build OK.
- [ ] Deploy OK.

## 12) Roadmap en fases (MVP primero)
- Fase 0: baseline DB + auth + org switch + RLS base.
- Fase 1: modulos core (events, orders, inventory, staff).
- Fase 2: mejoras UI + performance + alertas.
- Fase 3: extras (analytics, reporting, integraciones).

Prioridad: "funciona ya" antes que perfeccion.
