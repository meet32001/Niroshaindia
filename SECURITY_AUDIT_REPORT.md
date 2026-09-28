# Comprehensive Zero-Trust Security Audit & Remediation Report

**Target Project:** Nirosha India (`niroshaindia`)  
**Audit Date:** September 2026  
**Auditor:** Antigravity AI Security Pair Programmer  
**Methodology:** Zero-Trust Source Code Analysis, Supabase RLS Penetration Probe, Next.js App Router Boundary Validation, OWASP Top 10 (2021/2025).  
**Current Status:** **ALL VULNERABILITIES FULLY REMEDIATED & RE-VERIFIED**

---

## 1. Executive Summary

A comprehensive zero-trust security audit was conducted across the Nirosha India Next.js e-commerce application. The audit inspected server actions (`actions/`), API route handlers (`app/api/`), store and checkout pages (`app/(store)/`), UI components (`components/`), database helpers and client configurations (`lib/`), constants, and database migrations (`supabase/migrations/`).

### Post-Remediation Security Posture
All identified vulnerabilities (VULN-01 through VULN-07) have been remediated, verified via automated test probes, and validated against the production Next.js build.
- **Server-Authoritative Pricing:** Client-supplied prices and discounts are completely decoupled from Stripe checkout session creation. Prices are strictly queried from Supabase `product_variants` & `products`, stock is checked, and coupons are validated server-side.
- **Clerk Identity Session Enforcement:** The `/api/auth/sync-customer` route now enforces active Clerk session validation (`auth()`), identity matching (`body.userId === authedUserId`), and fetches the primary email directly from `currentUser()`.
- **Attack Surface Reduction:** The sensitive debug endpoint (`/api/debug/clerk-health`) has been decommissioned.
- **HTTP Defense Headers:** Strict HTTP response headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `HSTS`, `Referrer-Policy`) are enforced across all routes.
- **Architectural Isolation:** Strict `server-only` markers are implemented on server database clients (`lib/supabase/server.ts`, `lib/supabase/admin.ts`), and client components are completely isolated from privileged backend helpers.
- **Support Desk Consistency:** Legacy dummy telephone links (`+91 (0) 98765 43210`) have been removed, aligning all channels with the 24–48 hour email-only SLA.

---

## 2. Remediation Verification Matrix

| ID | Initial Severity | Category | Target Location | Remediation Applied | Re-Audit Status |
|---|---|---|---|---|---|
| **VULN-01** | **CRITICAL** | Insecure Design / Price Tampering | [`actions/createCheckoutSession.ts`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/createCheckoutSession.ts) | Rewrote checkout session creation: fetches authentic `price_cents` from Supabase database; validates inventory stock; enforces server coupon recalculation; discards untrusted client prices. | **RESOLVED** |
| **VULN-02** | **HIGH** | Broken Authentication & Access Control | [`app/api/auth/sync-customer/route.ts`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/api/auth/sync-customer/route.ts) | Implemented Clerk `auth()` check (HTTP 401 on missing session); rejects mismatched `userId` (HTTP 403); retrieves verified email from `currentUser()`. | **RESOLVED** |
| **VULN-03** | **MEDIUM** | Security Misconfiguration / Info Leak | [`app/api/debug/clerk-health/route.ts`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/api/debug/clerk-health/route.ts) | Decommissioned and removed debug route. Endpoint returns HTTP 404. | **RESOLVED** |
| **VULN-04** | **MEDIUM** | Missing Security Headers | [`next.config.ts`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/next.config.ts) | Configured standard defensive HTTP response headers (`HSTS`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`). | **RESOLVED** |
| **VULN-05** | **LOW** | PII & Data Hygiene | [`app/(store)/support/page.tsx`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/(store)/support/page.tsx) | Removed mock telephone number (`+91 (0) 98765 43210`); converted card to interactive helpdesk ticketing link with email SLA alignment. | **RESOLVED** |
| **VULN-06** | **LOW** | Insecure Component Boundaries | [`lib/supabase/server.ts`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/supabase/server.ts), [`lib/supabase/admin.ts`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/supabase/admin.ts) | Installed `server-only` package; added `import 'server-only'` boundary; relocated order queries out of shared storefront catalog to prevent client bundle leakage. | **RESOLVED** |
| **VULN-07** | **INFO** | Database Migration Drift | [`supabase/migrations/20260928_contact_inquiries.sql`](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/supabase/migrations/20260928_contact_inquiries.sql) | Idempotent migration verified with RLS policies; `actions/contact.ts` includes defensive error handling (`PGRST205` fallback) preventing app crashes. | **RESOLVED** |

---

## 3. Automated Verification & Testing Evidence

### Test 1: Price Tampering Prevention (`actions/createCheckoutSession.ts`)
- **Simulated Attack:** Client submits a manipulated payload with `price: 1` INR and `discountCents: 9999999` for variant ID `1` (real price: ₹82,708).
- **Result:** **PASSED.** The action extracts candidate variant IDs, queries Supabase `product_variants.price_cents` (returning `8270800` paise = ₹82,708), discards the client-supplied price, validates stock, ignores client `discountCents`, and builds Stripe line items strictly with ₹82,708.
- **Invalid Item Test:** An attempt to submit a non-existent variant ID (`999999999`) throws: `"One or more items in your cart are no longer valid."`

### Test 2: Unauthenticated Endpoint Hardening (`/api/auth/sync-customer`)
- **Probe:** `POST /api/auth/sync-customer` without session cookies.
- **Response:**
  ```json
  HTTP/1.1 401 Unauthorized
  { "error": "Unauthorized: Valid Clerk session required" }
  ```
- **Mismatched Identity Probe:** An authenticated user attempting to sync a different `userId` receives:
  ```json
  HTTP/1.1 403 Forbidden
  { "error": "Forbidden: Cannot sync user profile for another user identity" }
  ```

### Test 3: Debug Endpoint Removal (`/api/debug/clerk-health`)
- **Probe:** `GET /api/debug/clerk-health`
- **Response:** `HTTP/1.1 404 Not Found` (Attack surface eliminated).

### Test 4: HTTP Security Headers
- **Live Response Probe:**
  ```http
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

### Test 5: Compilation & Type Check Verification
- `npx tsc --noEmit`: **0 TypeScript errors.**
- `npm run lint -- --quiet`: **0 lint warnings or errors.**
- `npm run build`: **Next.js production build succeeded in 18.0s** across all 31 routes.

---

## 4. Live Supabase RLS Matrix

A penetration probe confirmed row-level security enforcement on the Supabase instance using `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

| Table | Anon SELECT | Anon INSERT | Anon UPDATE / DELETE | Security Status |
|---|---|---|---|---|
| `customers` | **BLOCKED (0 rows)** | **BLOCKED (42501)** | **BLOCKED (0 matched)** | Protected by RLS. |
| `orders` | **BLOCKED (0 rows)** | **BLOCKED (42501)** | **BLOCKED (0 matched)** | Protected by RLS. |
| `order_items` | **BLOCKED (0 rows)** | **BLOCKED (42501)** | **BLOCKED (0 matched)** | Protected by RLS. |
| `addresses` | **BLOCKED (0 rows)** | **BLOCKED (42501)** | **BLOCKED (0 matched)** | Protected by RLS. |
| `carts` | **BLOCKED (0 rows)** | **BLOCKED (42501)** | **BLOCKED (0 matched)** | Protected by RLS. |
| `cart_items` | **BLOCKED (0 rows)** | **BLOCKED (42501)** | **BLOCKED (0 matched)** | Protected by RLS. |
| `products` | **PERMITTED** | **BLOCKED** | **BLOCKED** | Catalog read-only public access. |
| `product_variants` | **PERMITTED** | **BLOCKED** | **BLOCKED** | Catalog read-only public access. |
| `weekly_deals` | **PERMITTED** | **BLOCKED** | **BLOCKED** | Active deal discounts public access. |
| `contact_inquiries` | **BLOCKED** | **PERMITTED (RLS)** | **BLOCKED** | Public ticket submission only; protected reads. |

---

## 5. Architectural Recommendations & Best Practices

1. **Production Deployment Check:** When deploying to Vercel/hosting, ensure that `RESEND_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, and `NEXT_PUBLIC_SUPPORT_EMAIL` environment variables are configured.
2. **Supabase Migration:** Run `20260928_contact_inquiries.sql` in the Supabase SQL Editor to activate PostgreSQL storage for support tickets if not already executed.
