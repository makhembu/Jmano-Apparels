# Jambo Apparels — Agent Instructions

## Quick start
```bash
npm install        # Install deps
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build (strips console.log, no source maps)
npm run preview    # Preview production build locally
```
No test, lint, or typecheck scripts exist. Only `npm audit` for security.

## Architecture

| Directory | Purpose |
|---|---|
| `pages/` | Route-level components (lazy-loaded in `App.tsx`) |
| `components/` | Reusable UI with `admin/`, `checkout/`, `navbar/`, `ui/` subdirs |
| `context/` | Global state via React Context (Auth, Cart, Shop, Order, Toast). **Canonical.** `contexts/CopilotContext.tsx` is a duplicate |
| `lib/db.ts` | Single `api` entry point — never call Supabase directly from components |
| `lib/services/` | Domain service classes (catalog, commerce, content, user, analytics, etc.) |
| `api/` | Vercel serverless functions (ESM, Node.js) |
| `api/_lib/auth.js` | `verifyAuth(req, requireAdmin?)` — bearer token → role check |
| `api/_lib/rate-limit.js` | `checkRateLimit(req, limit, window)` via Upstash Redis |

## Routing
- **Dev**: `HashRouter` (file protocol). **Production (Vercel)**: `BrowserRouter`.
- Switch in `App.tsx:62` based on `hostname.includes('jamboapparels.com')`.
- All routes lazy-loaded for code splitting.
- `vercel.json` rewrites: crawlers → `/api/ssr` (SSR meta tags), everything else → `index.html` (SPA).

## Database & API
- Supabase PostgreSQL. All tables, RLS policies, and seed data from `seed.sql` (run in Supabase SQL Editor).
- **Client-side**: `supabaseClient.ts` (anon key). **Serverless**: service role key (never client-side).
- `database.types.ts` is the generated schema. Use `Tables<'table_name'>` to extract row types.
- `lib/mappers.ts` converts DB rows → app types.
- `lib/schemas.ts` has Zod validation boundaries.
- All admin mutations **must** call `logAudit()` from `lib/db.ts` (writes to `audit_logs`).
- Serverless auth gate: `const user = await verifyAuth(req, requireAdmin)` at handler top.
- Serverless rate limit: `await checkRateLimit(req, 10, '1m')` before expensive ops.

## Key conventions
- Components: `React.FC<Props>` with explicit prop interfaces.
- `lib/authorization.ts` for permission guards (`canManageStore()`, `canViewOrder()`).
- `CacheManager` (`lib/cache.ts`) for localStorage/sessionStorage with expiry.
- `@/*` path alias maps to project root (tsconfig `paths`).
- `secrets.ts` at root for local dev fallback (gitignored fallback).
- **`console.log/info/warn/debug` are removed in production builds** — use `lib/logger.ts`.

## Environment variables (`.env` — never commit)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server only — never client-side
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
App-level settings (Gemini API key, PayPal, feature flags) live in `app_settings` table via Admin UI.

## Admin dashboard
- All admin routes under `/admin` in `pages/admin/` and `components/admin/`.
- Jambo Copilot (AI assistant) uses Google Gemini API.
- Admin check: `role === 'admin'` in `users` table via `canManageStore()`.

## Deployment
- Deploys to Vercel. `vercel.json` handles SPA rewrites, SSR, security headers (HSTS, CSP, X-Frame-Options), and long-lived asset caching (1 year, immutable).
- Build output in `dist/`. Build strips source maps for size.
- CSP is strict — any new external scripts/domains must be added to `vercel.json`.
