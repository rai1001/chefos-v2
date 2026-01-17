# Ajuste Next.js: turbopack.root + proxy

## Que se hizo
- Se fija `turbopack.root` en `next.config.mjs` para evitar warnings de workspace root por lockfiles externos.
- Se migra `middleware.ts` a `proxy.ts` siguiendo la convención nueva de Next.js.

## Como se probo
- `corepack pnpm build` con variables locales de Supabase.

## Riesgos / Follow-ups
- Verificar en CI que `proxy.ts` mantiene el mismo comportamiento que el middleware previo.
