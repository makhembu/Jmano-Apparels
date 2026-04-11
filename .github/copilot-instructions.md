# Jambo Apparels — Copilot Instructions

A full-stack faith-based e-commerce app: React + TypeScript frontend on Vite, Supabase (PostgreSQL + Auth), Vercel serverless API functions, and Google Gemini AI for the admin Copilot.

## Build Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build (strips console.log, no source maps)
npm run preview    # Preview the production build locally
```

No test or lint scripts are configured.

## Architecture

```
pages/          → Route-level components (lazy-loaded in App.tsx)
components/     → Reusable UI; admin/, checkout/, navbar/, ui/ subdirs
context/        → Global state via React Context (Auth, Cart, Shop, Order, Toast, Copilot)
hooks/          → Custom hooks (useAuth, useCart, useShopData, usePayment, …)
lib/
  db.ts         → `api` object — single entry point to all services
  services/     → Domain service classes (catalog, commerce, content, user, …)
  supabaseClient.ts       → Authenticated Supabase client (uses anon key client-side)
  supabasePublicClient.ts → Public (RLS-enforced) client for unauthenticated reads
  authorization.ts        → canViewOrder(), canManageStore() — role-based permission guards
  mappers.ts    → Convert DB rows → app-level types
  cache.ts      → localStorage/sessionStorage caching with expiry (CacheManager)
  logger.ts     → Audit logging (logAudit) for admin write operations
  schemas.ts    → Zod validation schemas
api/            → Vercel serverless functions (Node.js, CommonJS)
  _lib/auth.js        → verifyAuth(req, requireAdmin?) — bearer token → role check
  _lib/rate-limit.js  → checkRateLimit() via Upstash Redis
types.ts        → Hand-written app types (Product, Order, User, BlogPost, …)
database.types.ts → Auto-generated Supabase schema types
constants/      → Design tokens (app.ts, design.ts)
```

## Key Conventions

### TypeScript & Components
- Components use `React.FC<Props>` with explicit prop interfaces.
- App types live in `types.ts`; DB schema types in `database.types.ts`. Use `Tables<'table_name'>` helper to extract row types from the generated schema.
- Zod schemas (`lib/schemas.ts`) validate at system/API boundaries.

### Database & State
- All DB access goes through `api` from `lib/db.ts` — never call Supabase directly from components.
- Use `supabaseClient` for authenticated operations, `supabasePublicClient` for public reads.
- **Admin write operations** (create/update/delete from the server) must use the service role key and only from `api/` serverless functions — never expose the service role key client-side.
- All admin mutations should call `logAudit()` for the `audit_logs` table.
- Global state uses React Context; cache with `CacheManager` for localStorage/sessionStorage values.

### Serverless API (api/*.js)
- Vercel serverless functions, CommonJS (`require`/`module.exports`).
- Auth gate pattern: `const user = await verifyAuth(req, requireAdmin);` at the top of every protected handler.
- Rate-limit pattern: `await checkRateLimit(req, 10, '1m');` before expensive operations.
- Return standard HTTP codes: 400 bad input, 401 unauthenticated, 403 unauthorized, 429 rate-limited, 500 server error.

### Routing
- Routes are lazy-loaded in `App.tsx` for code splitting.
- Dev uses `HashRouter`; production (Vercel) uses `BrowserRouter`. Do not mix them.

## Environment Variables

Create a `.env` file in the project root (never commit it):

```env
# Client-side (Vite — must be VITE_ prefixed)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key

# Server-side (Vercel environment settings)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Admin/server only — never expose client-side
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

App-level settings (Gemini API key, feature flags, shipping config) are stored in the `app_settings` Supabase table and managed via the Admin Settings UI.

## Common Pitfalls

- **No `.env` file by default** — the app will fail to connect to Supabase without it.
- **`console.log` is removed in production builds** (`vite.config.ts` drop option) — use `lib/logger.ts` for persistent logs.
- **Database setup** requires running `seed.sql` in the Supabase SQL Editor to create tables, RLS policies, and seed data.
- **Admin routes** in `pages/admin/` and `components/admin/` expect `role === 'admin'` in the `users` table; use `canManageStore()` from `lib/authorization.ts` for checks.
- **Dual context folders** (`context/` and `contexts/`) — `context/` is canonical; `contexts/CopilotContext.tsx` is a duplicate to be aware of.
