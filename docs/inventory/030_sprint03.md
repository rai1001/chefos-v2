# Sprint 03 - Eventos: espacios, reservas y servicios

## Que se hizo
- Migracion con constraints y triggers de coherencia org/hotel, helper `space_booking_overlaps` y bloqueos de solapes.
- RLS ajustada: solo Admin/Planner pueden escribir en events/spaces/space_bookings/event_services; Viewer solo lectura.
- Seeds de espacios y evento demo para el hotel base; membership planner activo.
- UI completa de eventos: listado, wizard de creacion y detalle con servicios/reservas.
- Adapters de datos y hooks para eventos, espacios, reservas y servicios.
- Tests unit/integration/E2E para wizard, tabla, adapters y flujo crear evento.

## Como se probo
- `npx supabase db reset --yes`
- `npx supabase test db`
- `corepack pnpm test`
- `corepack pnpm exec playwright test`
- `corepack pnpm build` (con variables locales de Supabase)

## Decisiones importantes
- Solapes de reservas: se bloquean en DB mediante trigger y `space_booking_overlaps`.
- Coherencia org/hotel: triggers validan `events.hotel_id`, `spaces.hotel_id`, `event_services.event_id` y `space_bookings` para evitar inconsistencias cross-org.
- Se corrige `is_member(role)` para que respete el rol solicitado y no permita writes por Viewer.

## Riesgos / Follow-ups
- Revisar warning de `turbopack.root` por lockfile externo.
- Migrar `middleware` a `proxy` cuando Next.js lo requiera.
