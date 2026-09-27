# Project Handover & State Analysis Report

**Project Name:** Nirosha India Storefront  
**Date of Audit:** September 27, 2026  
**Auditor / System:** Antigravity Autonomous Pair-Programmer (Non-Destructive Inspection)  
**Target Repository:** `meet32001/Niroshaindia`  
**Current Active Branch:** `main` (Ahead of `origin/main` by 3 commits)

---

## Executive Summary
This document provides a complete, non-destructive audit and engineering handover report for the Nirosha India e-commerce platform. All metrics, file citations, and analysis have been extracted via active inspection of the local file system, Git source control, database migrations, and TypeScript codebase.

---

## 1. Git Repository & Sync State

### 1.1 Source Control Status
* **Working Tree State:** Clean. No modified, untracked, or staged files (`git status -s` yielded 0 output).
* **Active Branch:** `main`
* **Upstream Remote Tracking:** `origin/main` (`https://github.com/meet32001/Niroshaindia.git`)
* **Sync Health:** Ahead of `origin/main` by **3 commits**.

```
* main e096dc3 [origin/main: ahead 3] fix(shop): enforce strict case-insensitive alphabetical (A-Z) sorting for subcategories
origin  https://github.com/meet32001/Niroshaindia.git (fetch)
origin  https://github.com/meet32001/Niroshaindia.git (push)
```

### 1.2 Recent Commit History (Last 10 Commits)
| Hash | Scope / Message | Author |
|---|---|---|
| `e096dc3` | `fix(shop): enforce strict case-insensitive alphabetical (A-Z) sorting for subcategories` | Meet Shah |
| `2de81f2` | `feat(storefront): update navigation with home appliance subcategories and expand PDP variant selector for fins, lock types, and appliance capacities` | Meet Shah |
| `3f82bf4` | `feat(pdp): implement universal dynamic variant engine with multi-category attribute extraction and standardized PDP specifications` | Meet Shah |
| `8479019` | *(origin/main)* `fix(ci): make deals page dynamic and guard placeholder supabase queries to prevent build timeout in CI` | Meet Shah |
| `a10430d` | `refactor(pdp): standardize PDP by removing SKU badge, eliminating unused action links, adding ShareModal dialog, and removing numerical review counts site-wide` | Meet Shah |
| `089f9d2` | `feat(pdp): implement dynamic Color and Storage variant selector with real-time price and image gallery switching` | Meet Shah |
| `fe328e2` | `fix(ci): configure eslint rules and add fallback build environment variables` | Meet Shah |
| `d056b37` | `fix(ui): remove 256-bit SSL payment protection badges from cart and checkout` | Meet Shah |
| `9eb8139` | `fix(middleware): allow /checkout and /cart in public routes to prevent silent Clerk 404s` | Meet Shah |
| `3975b1f` | `fix(deals): fix claim VIP deal flow with direct checkout routing and auto-applied discount` | Meet Shah |

### 1.3 Uncommitted Changes Footprint
* `git diff --stat` output: **0 files changed, 0 insertions, 0 deletions**.

---

## 2. Codebase Scale & Stack Inventory

### 2.1 Codebase Scale by Language & File Extension
* **Tracked Project Files:** 245 files across 14 extensions.
* **Total Tracked Lines:** 58,340 lines (including lockfiles and catalog metadata).

| Extension | Category / Role | Tracked Files | Total Lines |
|---|---|---|---|
| `.json` | Package manifests, tsconfig, intelligence data | 5 | 24,642 |
| `.jpg` / `.png` | Static catalog graphics & branding assets | 27 | 13,384 |
| `.tsx` | React UI components, pages, layouts | 106 | 12,663 |
| `.ts` | TypeScript server actions, helpers, services | 54 | 6,432 |
| `.js` / `.mjs` | Scripts & build configs (`postcss`, `eslint`) | 3 | 412 |
| `.sql` | Tracked PostgreSQL database migrations | 6 | 225 |
| `.svg` | Vector icons & UI glyphs | 36 | 208 |
| `.css` | Global Tailwind CSS styling | 1 | 174 |
| `.yml` | GitHub Actions CI/CD workflows | 2 | 75 |
| `.md` | Documentation (`README`, `AGENTS`, `CLAUDE`) | 3 | 46 |
| `.gitignore` | Git ignore specification | 1 | 48 |
| `.ico` | Browser favicon | 1 | 31 |
| **TOTAL** | | **245** | **58,340** |

> [!NOTE]
> **Excluded Background Scrapers & Catalog Seeds:**
> In addition to the tracked files above, the repository contains 17 offline scraper/normalizer utilities in `scripts/` (~200 KB) and 7 massive catalog seed files in `supabase/` (~27 MB) that are intentionally listed in `.gitignore` to keep Vercel production deployment builds lightweight and performant.

### 2.2 Frameworks, Core Libraries & Runtime
* **Framework:** Next.js `^16.3.2` (App Router architecture, running with `--webpack`)
* **Runtime & Language:** Node.js (v20+ / v24+), TypeScript `^5.9.3`, React `^19.2.8`, React DOM `^19.2.8`
* **CSS & Design System:** Tailwind CSS `^4.3.3`, `@tailwindcss/postcss`, Radix / Base UI (`@base-ui/react` `^1.7.0`), `shadcn` `^4.19.0`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`, `lucide-react`, `motion` `^13.1.1`, `embla-carousel-react`
* **Authentication:** `@clerk/nextjs` `^7.8.1`, `svix` `^1.61.0`
* **Database & ORM Client:** `@supabase/supabase-js` `^2.112.4`, `pg` `^8.23.0`
* **Payments:** `stripe` `^22.5.0`
* **Email & Communications:** `resend` `^6.28.1`, `@react-email/components`, `@react-email/render`
* **CMS & Content Studio:** `sanity` `^6.11.0`, `next-sanity` `^13.3.3`, `@sanity/image-url`, `@sanity/vision`
* **State Management & Validation:** `zustand` `^5.0.15` (with persist middleware), `zod` `^4.5.4`
* **Scraping & Data Ingestion:** `puppeteer` `^25.10.0`, `puppeteer-extra`, `puppeteer-extra-plugin-stealth`, `cheerio` `^1.2.0`

### 2.3 Core Project Directories & Designated Roles
* `app/`: Next.js App Router root:
  * `app/(store)/`: Public-facing e-commerce storefront (`/`, `/shop`, `/product/[slug]`, `/deals`, `/cart`, `/checkout`, `/account`, `/orders`, `/wishlist`, `/category/[slug]`, `/brands`, `/contact`, `/terms`, `/privacy`).
  * `app/(auth)/`: Clerk-hosted sign-in, sign-up, and auth callback pages.
  * `app/(studio)/`: Sanity CMS management studio mounted at `/studio`.
  * `app/api/`: REST & webhook route handlers (`/api/webhook` for Stripe, `/api/webhook/clerk` for Clerk user sync, `/api/auth/sync-customer`, `/api/debug/clerk-health`).
* `actions/`: Next.js Server Actions handling server-side mutations and secure queries (`address.ts`, `categoryGrid.ts`, `createCheckoutSession.ts`, `deals.ts`, `deliveryRegions.ts`, `newsletter.ts`, `orders.ts`, `search.ts`, `syncCart.ts`, `syncCartWishlist.ts`, `syncCustomer.ts`, `wishlist.ts`).
* `components/`: Modular component tree:
  * `components/product/`: Product detail view, gallery, specs table, dynamic variant selector, add to cart/wishlist.
  * `components/shop/`: Shop filters, category sidebar list, price range slider, brand selector.
  * `components/cart/`: Cart drawer, cart line items, pricing summary.
  * `components/deals/`: Weekly deals countdown banner, VIP deal claiming modal.
  * `components/layout/`: Global navigation header, mobile bottom nav, footer, search modal.
  * `components/ui/`: Base Shadcn/Radix atomic primitives (`button`, `dialog`, `badge`, `input`, etc.).
* `lib/`: Domain business logic and service integrations:
  * `lib/supabase/`: Client and server-side Supabase client initializers.
  * `lib/db/`: Products normalization (`products.ts`), customer sync (`sync-user.ts`), customer auth resolution (`customer-helper.ts`).
  * `lib/utils/`: Universal variant parser (`variants.ts`), catalog normalizer (`catalog-normalizer.ts`), general utility helpers (`utils.ts`).
  * `lib/deals/`: Weekly deals rotating selection engine (`deal-selector.ts`).
  * `lib/services/`: India Post official PIN code validation (`pincode.ts`).
  * `lib/stripe.ts`: Stripe SDK client initialization.
* `constants/`: Global catalog taxonomies, navigation hierarchies, and brand directories (`navigation.ts`).
* `supabase/migrations/`: SQL migration files documenting table definitions, indexing, triggers, and RPC procedures.
* `types/`: Core TypeScript interfaces (`types/index.ts`).

---

## 3. Feature Set & Recent Architectural Additions

### 3.1 Authentication & User Management
* **Clerk v7 Authentication:** Mounted globally in [app/layout.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/layout.tsx) with `@clerk/nextjs`.
* **Route Protection Middleware:** Configured in [middleware.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/middleware.ts). Explicitly protects private customer routes (`/account`, `/orders`) while leaving public paths (`/`, `/shop`, `/product`, `/deals`, `/cart`, `/checkout`, `/contact`) open.
* **Bi-Directional Customer Synchronization:**
  * **Webhook Layer:** [app/api/webhook/clerk/route.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/api/webhook/clerk/route.ts) validates Svix signatures and auto-provisions or updates corresponding records in Supabase's `customers` table on `user.created` and `user.updated` events.
  * **Client Fallback:** [components/auth/AuthSyncProvider.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/auth/AuthSyncProvider.tsx) and [hooks/useCartSync.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/hooks/useCartSync.ts) guarantee that when a user logs in, guest cart and wishlist items in `localStorage` are migrated to Supabase.
  * **Auth Helper:** [lib/db/customer-helper.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/db/customer-helper.ts) provides a reusable server helper `getAuthenticatedCustomer()` that retrieves the authenticated Clerk user and resolves their internal Supabase UUID.

### 3.2 Database & External Service Integrations
* **Supabase PostgreSQL Schema:**
  * Products & Variants: `products`, `product_variants`, `product_specifications`, `product_images`, `categories`, `brands`.
  * Inventory: `warehouse_inventory` tracking `quantity_on_hand` and `quantity_reserved`.
  * E-Commerce State: `carts`, `cart_items`, `wishlists`, `wishlist_items`, `orders`, `order_items`, `addresses`, `coupons`.
  * Marketing & Growth: `weekly_deals`, `newsletter_subscribers`, `delivery_states`, `delivery_cities`.
* **PostgreSQL Performance Upgrades:**
  * Migration `20260914_catalog_performance_upgrade.sql` added composite indexes (`idx_products_cat_brand`, `idx_variants_price_active`) and trigger `trg_sync_variant_price_cache` to maintain min/max variant pricing directly on the parent product row.
  * Migration `20260913_sanitize_product_trigger.sql` enforces automated cleaning of product titles and manufacturer marketing artifacts.
* **Stripe Payment Gateway:** Integrated via [actions/createCheckoutSession.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/createCheckoutSession.ts) supporting INR payments, line items, address metadata, and webhook notifications in [app/api/webhook/route.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/api/webhook/route.ts).
* **Resend Email Service:** Powers automated transactional dispatches for VIP coupon claims and weekly discount bulletins ([actions/newsletter.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/newsletter.ts), [scripts/dispatch-weekly-deals.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/scripts/dispatch-weekly-deals.ts)).
* **India Post API:** Real-time postal verification in [lib/services/pincode.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/services/pincode.ts) validating PIN codes against official postal circles before allowing address saves.

### 3.3 E-Commerce & Business Logic
* **Universal Variant Engine ([lib/utils/variants.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/utils/variants.ts) & [components/product/VariantSelector.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/product/VariantSelector.tsx)):**
  * Built across recent commits `3f82bf4` and `2de81f2`.
  * Uses regex pattern matching to extract multi-category attributes from raw variant names: Color, Storage/RAM, Display Size, Appliance Capacity/Tonnage (e.g., `7 Kg`, `1.5 Ton`, `375 L`), Oil-Filled Radiator Fins (`9 Fins`, `11 Fins`), Safe Locker Locking Mechanisms (`Key Lock`, `Digital Keypad`, `Biometric & PIN`, `Dual Lock`), and Glass/Finish.
  * Enables dynamic PDP variant switching with synchronized image galleries, real-time pricing updates, and stock validation.
* **Faceted Search & Subcategory Navigation:**
  * Server action [actions/search.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/search.ts) and component [components/header/SearchBar.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/header/SearchBar.tsx) provide instant debounced product searches with price formatting and stock tags.
  * Commit `e096dc3` enforced strict case-insensitive alphabetical (A-Z) sorting for subcategories in both sidebar and top navigation.
* **Zustand Shopping Cart & Deals Store ([store.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/store.ts)):**
  * Persistent client-side cart managing items, quantities, subtotal calculations, and active VIP deals with auto-applied coupon discounts.
* **Weekly Deals Subsystem ([app/(store)/deals/page.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/(store)/deals/page.tsx)):**
  * Dynamically queries `weekly_deals` for active promotions with bumper deal markups and countdown timers.

---

## 4. Technical Debt, Discrepancies & Items Needing Attention

### 4.1 Debt Markers & Code Cleanliness Scan
* **TODO / FIXME / HACK Scan:** The codebase contains **0 occurrences** of `TODO`, `FIXME`, or `HACK` across all tracked source files.
* **TypeScript Compilation:** `npx tsc --noEmit` completes with **0 errors**.
* **ESLint Status:** `npm run lint` passes with **0 errors** (41 warnings related to `any` types and React 19 `react-hooks/set-state-in-effect` suggestions).

### 4.2 Route Inconsistencies & Dead Links
1. **`/deal` vs `/deals` Route Collision:**
   * An older, static page exists at [app/(store)/deal/page.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/(store)/deal/page.tsx) (created August 25).
   * The new dynamic weekly deals engine is located at [app/(store)/deals/page.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/(store)/deals/page.tsx).
   * While [next.config.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/next.config.ts) defines a permanent redirect from `/deal` to `/deals`, [constants/navigation.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/constants/navigation.ts#L154) and [components/layout/HomeBanner.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/layout/HomeBanner.tsx) still link to `/deal`. The legacy `/deal` directory should be purged and all links updated to `/deals`.
2. **Dead Footer Customer Care Links:**
   * [constants/navigation.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/constants/navigation.ts#L214-L220) defines links for `/warranty`, `/returns`, `/shipping`, and `/support`. None of these pages exist in `app/(store)/`, leading to 404 errors if clicked by customers.
3. **Orphaned Component with Hardcoded Mock Data:**
   * [components/cart/DeliveryAddress.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/cart/DeliveryAddress.tsx) defines `MOCK_ADDRESSES` and an `alert("Add Address modal coming up in checkout phase!")` stub. This component is not imported or used anywhere in the application.

### 4.3 Database Schema vs. TypeScript Types Discrepancies
1. **Under-typed Global Types ([types/index.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/types/index.ts)):**
   * Only `Product`, `Category`, `Brand`, `Blog`, `NavigationItem`, and `StockStatus` are declared.
   * `ProductVariant`, `Cart`, `CartItem`, `Order`, `OrderItem`, and `Address` are missing from the global types manifest. As a result, database join results are frequently cast to `any` across [ProductDetailView.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/product/ProductDetailView.tsx) and [app/(store)/orders/page.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/(store)/orders/page.tsx).
2. **`inventory_units` Non-Existence:**
   * There is no table named `inventory_units` in the Supabase schema. Stock is stored in the `warehouse_inventory` table (`quantity_on_hand`, `quantity_reserved`), with fallback resolution in [lib/db/products.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/db/products.ts#L164-L165).
3. **Critical Stripe Webhook Order Fulfillment Discrepancy:**
   * In [app/api/webhook/route.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/api/webhook/route.ts#L56-L80), the Stripe webhook fulfills successful checkouts by inserting into `orders` with `clerk_user_id`, `address` (JSON), and `items` (JSON array).
   * In contrast, [actions/orders.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/orders.ts#L17-L43) and [app/(store)/orders/page.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/(store)/orders/page.tsx) query `orders` by `customer_id` and join the relational table `order_items` (linking `variant_id`, `product_variants`).
   * **Impact:** Orders created via the Stripe webhook will not appear in the customer's `/orders` dashboard because `customer_id` is null and `order_items` rows are not created.

### 4.4 Inconsistent Client Fallbacks for Environment Variables
* In [actions/wishlist.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/wishlist.ts#L33-L36) and [actions/syncCartWishlist.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/actions/syncCartWishlist.ts#L12-L15), `createClient` is instantiated directly using non-null assertions:
  ```typescript
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  ```
  If these environment variables are missing during CI build or local setup without a `.env` file, these functions throw runtime exceptions instead of using the centralized `supabaseServer` singleton in [lib/supabase/server.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/lib/supabase/server.ts).

---

## 5. Future Roadmap & Handover Context

### 5.1 Immediate Operational Next Steps
1. **Push Ahead Commits Upstream:**
   * Local `main` is ahead of `origin/main` by 3 commits (`3f82bf4`, `2de81f2`, `e096dc3`). Run `git push origin main` to synchronize GitHub repository.
2. **Reconcile Stripe Webhook Fulfillment ([app/api/webhook/route.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/app/api/webhook/route.ts)):**
   * Resolve Clerk `userId` to `customer.id` via `customers` table.
   * Write relational rows to `order_items` during `checkout.session.completed` so orders display correctly in customer accounts.
3. **Clean Up Route & Navigation Collisions:**
   * Delete legacy directory `app/(store)/deal`.
   * Update [constants/navigation.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/constants/navigation.ts#L154) and [HomeBanner.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/layout/HomeBanner.tsx) to point to `/deals`.
   * Create placeholder policy pages or update links for `/warranty`, `/returns`, `/shipping`, `/support`.
4. **Delete Orphaned Files:**
   * Remove unused [components/cart/DeliveryAddress.tsx](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/components/cart/DeliveryAddress.tsx).

### 5.2 Pending Catalog & Taxonomy Tasks
1. **Expose Missing Kitchen Appliances Buckets (Category 603):**
   * Currently, [constants/navigation.ts](file:///Users/meetshah/Desktop/meet/Project/niroshaindia/constants/navigation.ts#L123) only exposes 3 kitchen subcategories: `microwaves-otgs`, `mixers-juicers-blenders`, `air-fryers`.
   * The database taxonomy in `scripts/normalize-all-categories.js` defines 5 additional buckets:
     * `kettles-coffee-makers` (Electric Kettles & Coffee Makers)
     * `cooktops-stoves` (Induction Cooktops & Stoves)
     * `kitchen-chimneys` (Kitchen Chimneys)
     * `toasters-sandwich-makers` (Toasters & Sandwich Makers)
     * `water-purifiers` (Water Purifiers)
   * These should be added to `PREVIEW_TABS` and category grid navigation.
2. **Catalog Deduplication & Cross-Category Cleaning:**
   * As observed in `supabase/seed_laptops_accessories.sql`, commercial coolers (e.g., Bluestar Visi Coolers) were inadvertently seeded into `laptops-accessories`. Re-running `scripts/normalize-all-categories.js` will reclassify misplaced products into their correct root departments.

### 5.3 Critical Environment Variables Matrix
To run this application locally or deploy to production, the following environment variables are required:

| Variable Name | Required By | Environment | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Client & Server | Local & Prod | Supabase project REST URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Client | Local & Prod | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Actions & Webhooks | Local & Prod | Supabase admin secret key (bypasses RLS) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Auth Client | Local & Prod | Clerk public frontend API key |
| `CLERK_SECRET_KEY` | Clerk Server SDK | Local & Prod | Clerk backend secret key |
| `CLERK_WEBHOOK_SECRET` | Webhook verification | Local & Prod | Svix webhook secret for Clerk event sync |
| `STRIPE_SECRET_KEY` | Stripe SDK | Local & Prod | Stripe API secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook | Local & Prod | Stripe signing secret (`whsec_...`) |
| `RESEND_API_KEY` | Email Notifications | Local & Prod | Resend API key for VIP deals & newsletter |
| `RESEND_FROM_EMAIL` | Email Notifications | Optional | Verified sender email (default: `onboarding@resend.dev`) |
| `NEXT_PUBLIC_APP_URL` | SEO & Redirections | Optional | Base canonical URL (e.g. `https://niroshaindia.com`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity Studio | Optional | Sanity project identifier (default: `ertg492t`) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity Studio | Optional | Sanity dataset name (default: `production`) |
