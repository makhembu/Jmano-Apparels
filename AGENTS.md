# Jambo Apparels — Agent Instructions

## Quick start
```bash
npm install        # Install deps
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build (strips console.log, no source maps)
npm run preview    # Preview production build locally
npm run audit      # npm audit --audit-level=high
```
No test, lint, or typecheck scripts exist. Only `npm audit` for security.

## Architecture

| Directory | Purpose |
|---|---|
| `pages/` | Route-level components (lazy-loaded in `App.tsx`) |
| `components/` | Reusable UI with `admin/`, `checkout/`, `navbar/`, `ui/` subdirs |
| `context/` | Global state via React Context (Auth, Cart, Shop, Order, Toast). **Canonical.** `contexts/CopilotContext.tsx` is a duplicate |
| `hooks/` | Custom React hooks (`useAuth`, `useCart`, `useShopData`, `usePayment`, `useMediaQuery`, etc.) |
| `constants/` | App and design token constants (`app.ts`, `design.ts`) |
| `lib/db.ts` | Single `api` entry point for all DB operations — never call Supabase directly from components (except `supabasePublicClient.ts` for unauthenticated public reads) |
| `lib/services/` | Domain service classes (catalog, commerce, content, user, analytics, etc.) |
| `lib/ai/` | Gemini AI client, tool definitions, system prompt, and function executors |
| `api/` | Vercel serverless functions (ESM, Node.js) |
| `api/_lib/auth.js` | `verifyAuth(req, requireAdmin?)` — bearer token → role check |
| `api/_lib/rate-limit.js` | `checkRateLimit(req, limit, window)` via Upstash Redis |
| `types.ts` | Hand-written app types (Product, Order, User, BlogPost, …) |
| `database.types.ts` | **Auto-generated** Supabase schema — use `Tables<'table_name'>` to extract row types |

## Routing
- **Dev**: `HashRouter` (file protocol). **Production (Vercel)**: `BrowserRouter`.
- Switch in `App.tsx:62` based on `hostname.includes('jamboapparels.com')`.
- All routes lazy-loaded for code splitting.
- `vercel.json` rewrites: crawlers → `/api/ssr` (SSR meta tags), everything else → `index.html` (SPA).

## Database & API
- Supabase PostgreSQL. All tables, RLS policies, and seed data from `seed.sql` (run in Supabase SQL Editor).
- **Client-side**: `supabaseClient.ts` (anon key). **Public/RLS reads**: `supabasePublicClient.ts`. **Serverless**: service role key (never client-side).
- `database.types.ts` is auto-generated. Use `Tables<'table_name'>` to extract row types.
- `lib/mappers.ts` converts DB rows → app types.
- `lib/schemas.ts` has Zod validation boundaries.
- All admin mutations **must** call `logAudit()` from `lib/logger.ts` (writes to `audit_logs`).
- Serverless auth gate: `const user = await verifyAuth(req, requireAdmin)` at handler top.
- Serverless rate limit: `await checkRateLimit(req, 10, '1m')` before expensive ops.

## Key conventions
- Components: `React.FC<Props>` with explicit prop interfaces.
- `lib/authorization.ts` for permission guards (`canManageStore()`, `canViewOrder()`).
- `CacheManager` (`lib/cache.ts`) for localStorage/sessionStorage with expiry.
- `@/*` path alias maps to project root (tsconfig `paths`).
- `secrets.ts` at root for local dev fallback (gitignored).
- **`console.log/info/warn/debug` are removed in production builds** (via terser) — use `lib/logger.ts`.

## Build details
- Vite + React plugin, Terser minification, sourcemaps disabled in production.
- Manual chunks: `vendor-react`, `vendor-utils`, `supabase`. Heavy libs (recharts, @google/genai, tiptap) are auto-split into lazy-loaded routes.
- Tailwind CSS with `@tailwindcss/typography` plugin. Brand colors and Inter/Merriweather fonts defined in `tailwind.config.js`.

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
- Jambo Copilot (AI assistant) uses Google Gemini API (`@google/genai` SDK).
- Admin check: `role === 'admin'` in `users` table via `canManageStore()`.

## Commit conventions
- Imperative mood: "Add", "Fix", "Update", "Remove", "Restore".
- Optional conventional prefixes: `fix:`, `feat:`, `style:` — not strictly enforced.
- Messages specify the component or page affected (e.g., "Fix image cropping in gallery").

## Deployment
- Deploys to Vercel. `vercel.json` handles SPA rewrites, SSR for crawlers, security headers (HSTS, CSP, X-Frame-Options), and long-lived asset caching (1 year, immutable).
- Build output in `dist/`. Build strips source maps for size.
- CSP is strict — any new external scripts/domains must be added to `vercel.json`.
