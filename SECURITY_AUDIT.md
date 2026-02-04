# Security Audit Report
**Date:** 2025-05-21
**Auditor:** AI Security Analysis
**Application:** Jambo Apparels

---

## Executive Summary

- **Total Vulnerabilities Found:** 4
- **Critical:** 1
- **High:** 2
- **Medium:** 1
- **Low:** 0

**Overall Risk Level:** HIGH

**Immediate Action Required:** Yes

---

## 1. Critical Vulnerability: IDOR on Orders Table (Missing RLS)

### Description
The `orders` table does not have explicit Row Level Security (RLS) policies defined in the provided schema. By default, if RLS is enabled without policies, access is denied (safe failure). However, if RLS is *disabled* or if policies are overly permissive to support development, any authenticated user (or anonymous user) could potentially query `SELECT * FROM orders` via the Supabase Client.

**Vulnerable Endpoint:**
`GET /rest/v1/orders?select=*`

**Impact:**
A user could enumerate order IDs (UUIDs) or dump the entire order history, exposing PII (Customer Names, Emails, Addresses) of all other customers.

**Remediation (Applied):**
- Created `seed_security_orders.sql` to explicitly ENABLE RLS on `orders`.
- Added policies to allow:
    - Users to view *only* their own orders (`auth.uid() = user_id`).
    - Admins to view all orders.
    - Public insert (for guest checkout flow) but restricted select.

---

## 2. High Vulnerability: Unrestricted Email Function

### Description
The `send-email` Edge Function accepts a JSON body and sends emails via SMTP/Resend. While the logic checks for parameters, it previously lacked a strict check for authorization. If the function is deployed with "Allow Public Access" (common for webhooks), an attacker could abuse it to send spam.

**Impact:**
- Reputation damage (domain blacklisting).
- Financial loss (email provider quota exhaustion).

**Remediation (Applied):**
- Updated `supabase/functions/send-email/index.ts` to verify the caller.
- It now requires the caller to be an **Admin** (checked via Supabase Auth) OR the request must originate from a verified internal process (Service Role).

---

## 3. High Vulnerability: Sensitive Data in Console Logs

### Description
The `lib/logger.ts` utility logs database operations, including table names and payloads. In the checkout flow (`lib/services/commerce.ts`), the payload includes customer address and personal details.

**Code:**
```typescript
log('RPC', 'create_order_secure', order);
```

**Impact:**
If `import.meta.env.PROD` detection fails or source maps are exposed, user PII (Personally Identifiable Information) could be visible in the browser console, which is accessible to XSS attacks or physical device access.

**Remediation (Applied):**
- Hardened `lib/logger.ts` to strictly disable logging in production and added a safeguard to redact known sensitive keys if logging is forced.

---

## 4. Medium Vulnerability: Client-Side Role Checks

### Description
The `AdminLayout.tsx` relies on `user.role === 'admin'` to protect routes. This is standard for UX, but insecure if not backed by database policies.

**Impact:**
An attacker could modify the local JS state to bypass the UI block.

**Mitigation:**
- Confirmed that `app_settings` (secrets) and `analytics_events` have backend RLS policies (`seed_security_hardening.sql`) that strictly enforce `check_is_admin(auth.uid())`. Even if the UI block is bypassed, the database will reject the data requests.

---

## Remediation Roadmap

1.  **Apply `seed_security_orders.sql`**: Execute immediately to lock down customer data.
2.  **Deploy Edge Functions**: Re-deploy the updated `send-email` function.
3.  **Review Storage**: Ensure `images` bucket allows Public Read but only Admin Write (Already covered in `seed_storage_fix.sql`).
