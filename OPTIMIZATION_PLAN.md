# Optimization Plan for Black Friday Scale

## Phase 1: The "Crash Prevention" Fixes (Immediate)

### 1. Fix Admin Dashboard Data Bomb
The current `AdminUsers.tsx` and `AdminDashboard.tsx` fetch all records. This will kill the browser.

**Action:**
1.  Create a new RPC in Supabase:
    ```sql
    CREATE FUNCTION get_admin_kpis() RETURNS jsonb AS $$
    BEGIN
      RETURN jsonb_build_object(
        'total_revenue', (SELECT SUM(total) FROM orders WHERE status != 'Cancelled'),
        'total_users', (SELECT COUNT(*) FROM users),
        'total_orders', (SELECT COUNT(*) FROM orders)
      );
    END; $$ LANGUAGE plpgsql;
    ```
2.  Update `lib/services/user.ts` to add `getUsersPaginated(page, limit)`.
3.  Update `AdminUsers.tsx` to use a Table with pagination controls.

### 2. Implement Rate Limiting (Edge Config)
Supabase/Vercel doesn't rate limit by default. A script kiddie can span your API.

**Action:**
- Add `upstash/ratelimit` or use Supabase WAF (if Enterprise) or simply add a simple throttle in your `api/*` functions if using Vercel functions.
- For client-side, ensure `Button` component has `disabled={loading}` (already present ✅).

### 3. Context Splitting
Stop the re-renders.

**Action:**
- Wrap `Navbar`'s cart icon in a separate component that consumes `useCart` directly.
- Remove `cart` and `cartCount` from `AppContext`.
- Only `CartProvider` should update when adding items.

## Phase 2: Infrastructure (Before Launch)

1.  **Supabase:** Upgrade to **Pro Plan**.
    - *Why?* You need the increased Disk IOPS and Auth MAU limits.
    - *Cost:* $25/mo.
2.  **Vercel:** Upgrade to **Pro Plan**.
    - *Why?* Bandwidth. 6,000 users * 2MB assets = 12GB/hour. You'll hit the 100GB limit in one day.
    - *Cost:* $20/mo.

## Phase 3: Code Refinement (Post-Launch / Monitor)

1.  **Virtualization:** If the product list grows > 100 items, implement `react-window` in `Shop.tsx`.
2.  **CDN:** Verify `vercel.json` headers for `Cache-Control` are working to offload image serving from Supabase Storage bandwidth.
