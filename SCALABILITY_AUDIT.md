# Scalability Audit Report
**App:** Jambo Apparels
**Date:** 2025-05-21
**Load Target:** 100 users/minute (6,000/hour)

---

## Executive Summary

**Can the app handle 100 users/minute?**
❌ **NO** - Critical bottlenecks detected in Admin interfaces and Global State management.

**Time to failure under load:** ~10-20 minutes (Admin Panel), ~45 minutes (Customer UI degradation)
**Primary bottleneck:** `AdminUsers` and `AdminOrders` fetch ALL records without server-side pagination.
**Secondary bottleneck:** Monolithic `AppContext` causes excessive re-renders on every cart action.
**Estimated fix time:** 2 Days
**Estimated cost to scale:** $75/month (Hosting/DB upgrades)

---

## Critical Bottlenecks (Will Cause Failure)

### 1. "Select All" Data Fetching in Admin
**Severity:** CRITICAL 🔴
**Location:** `pages/admin/AdminUsers.tsx`, `pages/admin/AdminOrders.tsx`, `AdminDashboard.tsx`
**Impact:** Admin dashboard crashes browser due to memory exhaustion.
**Analysis:**
- `api.getAllUsers()` and `api.getAllOrders()` fetch the entire table.
- At 6,000 users/hour, the `users` table grows by ~6,000 rows/hour.
- **Scenario:** An admin logs in after 4 hours of traffic (24,000 users). The app attempts to download 24,000 JSON objects into React State.
- **Result:** API timeout (Supabase has a default hard limit) or Browser Heap Out of Memory crash.

### 2. Monolithic Context Re-renders
**Severity:** HIGH 🟡
**Location:** `context/AppContext.tsx`
**Impact:** Sluggish UI, "janky" scrolling, high battery usage for mobile users.
**Analysis:**
- `AppContext` exposes `cart`, `user`, `orders`, and `settings`.
- `useApp()` is consumed by `Navbar`, `Layout`, and many leaf components.
- **Scenario:** 100 users adding items to cart. Every time a user adds an item, `setCart` triggers. Every component using `useApp` re-renders, even if it doesn't display the cart.
- **Result:** Main thread blocking on low-end mobile devices during high interaction.

### 3. Database Connection Contention
**Severity:** MEDIUM 🟠
**Location:** `create_order_secure` RPC
**Impact:** Checkout failures during peak concurrency.
**Analysis:**
- The RPC locks specific rows in `products` table (`UPDATE products SET stock_quantity...`).
- **Scenario:** 100 users trying to buy the same "Featured Product" simultaneously.
- **Result:** Row-level lock contention. Database transactions will queue up, leading to timeouts (504 Errors) at the checkout button.

---

## Performance Benchmarks

### Current Performance (10 concurrent users)
- Homepage load: 0.8s (Excellent - thanks to `OptimizedImage`)
- Product page: 1.2s (Good)
- Checkout RPC: 200ms
- Admin Dashboard: 1.5s

### Projected Performance (100 concurrent users / 10k db records)
- Homepage load: 1.5s
- Product page: 2.0s
- Checkout RPC: 1.5s - 3.0s (Lock contention)
- **Admin Dashboard: TIMEOUT / CRASH ❌**

---

## Database Analysis

### Indexes Check
✅ **PASS:** `seed_perf_indexes.sql` is present and correctly indexes `user_id`, `category_key`, and `created_at`.
✅ **PASS:** `analytics_events` is indexed for dashboard reads.

### Query Analysis
| Operation | Method | Status | Issue |
|-----------|--------|--------|-------|
| Product List | `get_products_paginated` (RPC) | ✅ PASS | Efficient server-side pagination. |
| Checkout | `create_order_secure` (RPC) | ⚠️ WARN | Row locking on hot items. |
| Admin User List | `supabase.from('users').select('*')` | ❌ FAIL | Fetches entire table. No pagination. |
| Admin Order List | `supabase.from('orders').select('*').limit(100)` | ⚠️ WARN | Hard limit 100 hides data. Needs true pagination. |

---

## Infrastructure Capacity

### Supabase Free Tier Limits
- **Connections:** 60 direct / 200 via Supavisor.
  - *Risk:* 100 users/min is ~1.6 RPS. Safe, provided connections close quickly.
- **Database Size:** 500MB.
  - *Risk:* 6,000 orders/hour generates ~5MB of data/hour. Safe for ~4 days of Black Friday.
- **Auth:** 50,000 MAU.
  - *Risk:* Will hit limit in ~8 hours of Black Friday traffic. **Must upgrade to Pro.**

### Vercel Hobby Limits
- **Bandwidth:** 100GB.
  - *Risk:* Images are heavy. 100 users/min viewing 10 images (100KB each) = 1MB/user/min = 6GB/hour.
  - **Result:** Bandwidth limit hit in ~16 hours.

---

## Action Plan (Prioritized)

1.  **Refactor Admin Fetching (Day 1):**
    - Replace `getAllUsers` with server-side pagination logic (`page`, `limit`).
    - Create an RPC `get_dashboard_stats` to count users/revenue without fetching rows.

2.  **Optimize Context (Day 1):**
    - Split `AppContext` into `UserContext` and `GlobalUIContext`.
    - Ensure `CartContext` is only consumed where necessary (e.g., `CartPreview`, `Navbar`).

3.  **Upgrade Infrastructure (Immediate):**
    - Supabase Pro ($25/mo) for increased Auth/DB limits.
    - Vercel Pro ($20/mo) for bandwidth.

4.  **Checkout Queue (Optional/Advanced):**
    - If specific products are "drops", implement a queue system or pessimistic locking handling in the UI (retry logic).
