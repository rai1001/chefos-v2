# Ajuste Next.js: turbopack.root + proxy

## Que se hizo
- Se fija `turbopack.root` en `next.config.mjs` para evitar warnings de workspace root por lockfiles externos.
- Se intento migrar `middleware.ts` a `proxy.ts` siguiendo la convención nueva de Next.js.

## Como se probo
- `corepack pnpm build` con variables locales de Supabase.

## Riesgos / Follow-ups
- La migracion a `proxy.ts` se revirtio a `middleware.ts` porque Playwright no lograba navegar (timeouts en `page.goto`). Retomar cuando Next.js resuelva el comportamiento en dev.
