# NEXORA — COMPLETE PROJECT DOCUMENTATION

**Single source of truth** for the Nexora codebase.  
**Authority order when sources disagree:** (1) source code, (2) Prisma schema, (3) `package.json` / config, (4) current tests, (5) older docs.

**Last consolidated:** 2026-08-08  
**Product status:** Release Candidate — **READY WITH WARNINGS** (core app complete; optional external services incomplete)  
**Google Auth status:** **GOOGLE AUTH WORKING** (manual browser E2E confirmed)

---

## Table of contents

1. [Project Overview](#1-project-overview)
2. [Product Vision](#2-product-vision)
3. [Complete Feature Inventory](#3-complete-feature-inventory)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [API Documentation](#6-api-documentation)
7. [Authentication Architecture](#7-authentication-architecture)
8. [Database Architecture](#8-database-architecture)
9. [Security Architecture](#9-security-architecture)
10. [Business Logic — Profitability](#10-business-logic--profitability)
11. [Refund System](#11-refund-system)
12. [Product Profitability](#12-product-profitability)
13. [Dashboard](#13-dashboard)
14. [UI / Design System](#14-ui--design-system)
15. [Environment Configuration](#15-environment-configuration)
16. [Local Development Setup](#16-local-development-setup)
17. [Testing](#17-testing)
18. [Final QA Status](#18-final-qa-status)
19. [Known Limitations](#19-known-limitations)
20. [Deployment](#20-deployment)
21. [Troubleshooting](#21-troubleshooting)
22. [Development History / Important Fixes](#22-development-history--important-fixes)
23. [Current Project Status](#23-current-project-status)
24. [Future Roadmap](#24-future-roadmap)
25. [Developer Handoff](#25-developer-handoff)

---

## 1. Project Overview

| Item | Value |
|------|--------|
| **Application name** | Nexora |
| **Tagline** | AI-powered commerce growth for marketplace sellers |
| **Project type** | Full-stack SaaS dashboard (seller operations + growth) |
| **Repo package (FE)** | `tiktok-market-dash` |
| **Repo package (BE)** | `nexora-backend` |
| **License** | UNLICENSED (academic / portfolio) |

### What Nexora is

Nexora is an **AI-powered Commerce Growth / Seller Management SaaS platform**. Sellers manage catalog, inventory, customers, orders, refunds, profitability, paid campaigns, creatives, audiences, store connection settings, and AI-assisted insights from one authenticated dashboard.

### Target users

TikTok Marketplace (and similar marketplace) **sellers / store operators** — not end shoppers.

### Problem solved

Sellers juggle stock, orders, ads, and performance across tools. Nexora centralizes operations, shows **net** financial performance (including refunds), and surfaces AI recommendations grounded in the seller’s own data.

### Core value proposition

- Tenant-scoped commerce ops (products, inventory, customers, orders, refunds)
- Product-level profitability (units, net revenue, COGS, profit, margin)
- Growth tools (campaigns, ad creatives, audiences)
- Dashboard KPIs + charts + store health
- AI insights with Gemini + heuristic fallback
- Email/password + Google OAuth authentication

### What Nexora is NOT

- Not a customer-facing e-commerce storefront or marketplace
- Not a payment processor / Stripe billing product (billing UI is placeholder)
- Not a live Shopify/TikTok Partner production connector yet (architecture + sandbox / “coming soon”)
- Not a standalone “AI Tools” product page — AI is embedded in dashboard/context APIs

---

## 2. Product Vision

### Business purpose

Help sellers run day-to-day operations and improve growth decisions with clear economics and AI guidance.

### Seller workflow (MVP)

1. Register / login (email or Google)
2. Manage products + cost prices
3. Track inventory and low stock
4. Manage customers and orders
5. Process refunds when needed; see net profitability
6. Run / inspect campaigns, creatives, audiences
7. Review dashboard KPIs and AI insights
8. Connect store settings (sandbox / future Partner)

### AI philosophy

AI consumes **real tenant business context** (products, orders, profitability, campaigns) via `gatherBusinessContext`. Prefer Gemini when configured; otherwise return structured **heuristic** insights so demos never hard-crash.

### MVP philosophy

Ship a coherent seller dashboard with correct tenancy, real APIs (no mock orders), correct net financials, and production-shaped auth — while clearly labeling Partner integrations and physical returns as future work.

### Long-term direction

Multi-channel store sync (Shopify, TikTok Shop, WooCommerce, Amazon, Daraz), deeper automation, team collaboration, competitor insights, and richer generative AI for ads/creative.

---

## 3. Complete Feature Inventory

### Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Register (email/password) | Live | Zod + express-validator; special-char policy |
| Login | Live | JWT + refresh session |
| Password visibility toggles | Live | Login / Register UI |
| Password strength meter | Live | Register |
| Terms acceptance | Live | Register validation |
| Google OAuth register/login | Live | Passport authorization-code redirect |
| JWT access + refresh | Live | Access ~15m, refresh ~7d |
| `/auth/me` profile | Live | GET/PATCH/DELETE |
| Change password | Live | Authenticated |
| Logout / logout-all | Live | Client clears tokens; logout-all revokes refresh sessions |
| Auth callback page | Live | Strict Mode–safe hash token recovery |
| Dark/light theme persists across auth | Live | `ThemeContext` |

### Dashboard

| Feature | Status |
|---------|--------|
| KPI cards (revenue, orders, products, customers) | Live |
| Revenue / sales charts | Live (net of refunds) |
| Product insights (incl. profit) | Live |
| Customer insights | Live |
| Recent orders | Live |
| Activity feed | Live |
| Store health / low stock | Live |
| Date presets (today, yesterday, 7d, 14d, custom/all via API) | Live |
| AI insights panel (embedded) | Live |
| ROAS / conversion rate fields | Present in KPI payload |

### Products

| Feature | Status |
|---------|--------|
| List / search / filter / CRUD | Live |
| Categories, SKU, price, costPrice, stock, status | Live |
| Images (upload / Cloudinary or local) | Live |
| Product detail + performance KPIs | Live |
| Rankings (units, revenue, profit, margin, worst) | Live |
| Batch performance endpoint | Live |
| Ownership (`Product.userId`) | Live |

### Orders

| Feature | Status |
|---------|--------|
| List, search, status filters, counts | Live |
| Detail by id or `orderNumber` | Live |
| Status update | Live |
| Timeline | Live |
| Net vs gross amounts (refund-aware) | Live |
| Refunds list / create | Live |
| Status badges: Refunded / Partially Refunded | Live |

### Refunds

| Feature | Status |
|---------|--------|
| Normalized `Refund` model | Live |
| Full / partial / multiple refunds | Live |
| Over-refund rejection | Live |
| Serializable transaction + concurrency | Live |
| Tenant ownership | Live |
| Sets `OrderStatus.REFUNDED` on full refund | Live |
| Auto inventory restore | **Not implemented** (documented limitation) |

### Inventory

| Feature | Status |
|---------|--------|
| List / analytics / dashboard widgets | Live |
| Adjust / restock / out-of-stock / bulk | Live |
| Movement history | Live |
| Low-stock awareness | Live |
| Scoped via product ownership | Live |

### Customers

| Feature | Status |
|---------|--------|
| CRUD, search, analytics | Live |
| Order history | Live |
| LTV / totals net of refunds | Live |
| `userId` tenancy + unique `(userId, email)` | Live |

### Campaigns / Ad Manager / Audiences

| Feature | Status |
|---------|--------|
| Campaign CRUD, analytics, duplicate | Live + `userId` |
| Ad creatives CRUD, preview, review | Live; ownership via `campaign.userId` |
| Audience CRUD, analytics | Live + `userId` |
| Cross-user IDOR → 404/400 | Live |

### AI

| Feature | Status |
|---------|--------|
| `GET/POST` insights, refresh, recommendations, forecasts, campaign suggestions | Live |
| Gemini provider | Optional (`GEMINI_API_KEY`) |
| Heuristic fallback | Live |
| Embedded in dashboard (no standalone AI Tools page) | By design |

### Store integrations

| Feature | Status |
|---------|--------|
| Integration list / status / connect UI model | Live |
| Providers enum: SHOPIFY, TIKTOK_SHOP, WOOCOMMERCE | Schema + API |
| Shopify connect | **Blocked** (“coming soon”) |
| TikTok Shop | Sandbox sync architecture; not Partner production OAuth |
| Disconnect / sync / sync logs | Present for sandbox-shaped flows |

### Settings / Profile / Notifications / Uploads

| Feature | Status |
|---------|--------|
| Store + notification settings | Live |
| Billing settings endpoint | Placeholder-shaped |
| Profile page + avatar upload | Live |
| Notifications CRUD / read-all | Live |
| Activity log | Live |

---

## 4. Frontend Architecture

### Stack (from root `package.json`)

| Layer | Technology |
|-------|------------|
| Runtime UI | React **19.2.x**, React DOM |
| Bundler | Vite **8.x** |
| Language | JavaScript (JSX) |
| Routing | React Router DOM **7.x** |
| State | Redux Toolkit + react-redux |
| HTTP | Axios (`axiosPublic` / `axiosPrivate`) |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Styling | Tailwind CSS **4.x** (`@tailwindcss/vite`) |
| Motion | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React + Material Symbols (UI) |
| Class helpers | `clsx`, `tailwind-merge`, `class-variance-authority` |

> **Note:** UI is custom Tailwind + CVA-style primitives. There is no `components.json` shadcn scaffold; do not assume full shadcn/ui.

### Entry points

```text
src/main.jsx  → StrictMode → App.jsx → AppProviders + AppRouter
```

Path alias: `@` → `./src` (`vite.config.js`).

### Folder structure (actual)

```text
src/
  assets/
  components/{auth,legal,modals,navigation,panels,ui}/
  config/
  constants/
  contexts/          # ThemeContext, StoreConnectionContext
  data/
  features/{ads,ai,analytics,audiences,auth,campaigns,customers,
            dashboard,integrations,inventory,media,notifications,
            orders,products,settings}/
  hooks/
  layouts/
  lib/               # axios, sessionBridge
  pages/{ads,audience,auth,campaigns,customers,dashboard,inventory,
         legal,orders,products,profile,settings,system}/
  providers/
  redux/
  routes/
  services/
  styles/
  types/
  utils/
  validations/
  App.jsx, main.jsx, index.css
```

### Routing (SPA)

| Path | Page |
|------|------|
| `/` | Redirect → `/dashboard` |
| `/login`, `/register` | Auth (PublicRoute + AuthLayout) |
| `/auth/callback` | Google OAuth token landing |
| `/terms`, `/privacy` | Legal |
| `/dashboard` | Dashboard |
| `/dashboard/products` … `/new` … `/:id` … `/:id/edit` | Products |
| `/dashboard/orders` … `/:id` | Orders |
| `/dashboard/inventory` | Inventory |
| `/dashboard/customers` … `/:id` | Customers |
| `/dashboard/campaigns` … `/:id` | Campaigns |
| `/dashboard/ads` | Ad Manager |
| `/dashboard/audience` | Audiences |
| `/dashboard/settings`, `/dashboard/profile` | Settings / Profile |
| `*` | NotFound |

### State management

- Feature slices under `src/features/*` (auth, products, orders, customers, inventory, dashboard, campaigns, ads, audiences, ai, integrations, notifications, settings, …)
- `rootReducer` **resets feature state on logout** (prevents cross-user leakage in the SPA)
- Auth tokens stored in `localStorage` key `nexora_auth`

### Theme

- `ThemeContext` toggles `html.dark`, persists `nexora_theme`
- Design tokens in `src/index.css` (`@theme` + `.dark` overrides)
- Primary brand purple `#4648d4` (existing design system — preserve)

---

## 5. Backend Architecture

### Stack (from `backend/package.json`)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 18 |
| HTTP | Express **5.x** |
| ORM | Prisma **7.x** + `@prisma/adapter-pg` + `pg` |
| Auth | JWT, bcrypt, Passport + `passport-google-oauth20` |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |
| Uploads | multer (+ Cloudinary SDK) |
| Jobs | node-cron |
| Logging | morgan + custom logger |

### Entry points

```text
backend/src/server.js  → boots HTTP
backend/src/app.js     → Express app, middleware, routes
backend/src/routes/index.js → mounts env.apiPrefix (default /api/v1)
backend/src/routes/v1/index.js → feature routers
```

### Layout

```text
backend/src/
  config/       # env, cors, passport
  jobs/         # inventoryCheck, storeSync, aiRefresh, cleanup
  lib/          # prisma client
  middlewares/  # auth, validate, errors, logger, notFound
  modules/      # auth, products, orders, inventory, customers,
                # campaigns, ads, audiences, dashboard, ai,
                # integrations, settings, uploads, notifications, activity, health
  routes/
  utils/        # jwt, ApiError, ApiResponse, refundMath, productPerformance, …
prisma/
  schema.prisma
  migrations/
  seed.js
tests/
```

### Cross-cutting middleware (`app.js`)

- Helmet (COOP allows popups for OAuth)
- Compression, CORS, JSON/urlencoded parsers
- Sanitization (mongo operators + XSS strip)
- Rate limits (global API + stricter `/auth`)
- Static `/uploads`
- Passport initialize
- Request logger, notFound, central error handler

---

## 6. API Documentation

**Base URL:** `http://localhost:5000/api/v1` (local)  
**Auth header:** `Authorization: Bearer <accessToken>` unless noted public.

### Health

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | No | Liveness + DB status |

### Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/register` | No | Create local user |
| POST | `/auth/login` | No | Issue JWT + refresh |
| POST | `/auth/refresh` | No | Rotate access via refresh |
| GET/PATCH/DELETE | `/auth/me` | Yes | Current user |
| POST | `/auth/change-password` | Yes | Change password |
| POST | `/auth/logout` | Yes | Client logout ack |
| POST | `/auth/logout-all` | Yes | Revoke refresh sessions |
| GET | `/auth/google` | No | Start OAuth (`intent=login\|register`) |
| GET | `/auth/google/callback` | No | OAuth callback → SPA redirect |

### Products

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/products` | Yes | Paginated + performance columns |
| GET | `/products/rankings` | Yes | `metric=` units\|revenue\|profit\|margin\|worst |
| GET | `/products/performance` | Yes | Batch `ids=` |
| POST | `/products` | Yes | Create |
| GET/PATCH/DELETE | `/products/:id` | Yes | Ownership enforced |
| GET | `/products/:id/performance` | Yes | Detail KPIs + trends; `range=` |

### Orders & refunds

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/orders` | Yes | User-scoped; net amounts |
| GET | `/orders/:id` | Yes | cuid or `orderNumber` |
| PATCH | `/orders/:id/status` | Yes | Status enum |
| GET/POST | `/orders/:id/refunds` | Yes | List / create refund |
| GET | `/orders/refund/:refundId` | Yes | Owner-only |

### Inventory / Customers / Campaigns / Ads / Audiences

See mounted routers under `backend/src/modules/*/`. All list/detail mutations are authenticated and tenant-scoped where models carry `userId` (ads via campaign ownership).

Key paths:

- Inventory: `/inventory`, `/analytics`, `/dashboard`, `/:id/stock|adjust|restock|out-of-stock|history`, `/bulk`
- Customers: `/customers`, `/analytics`, `/dashboard`, `/:id`, `/:id/orders`
- Campaigns: `/campaigns`, `/analytics`, `/:id`, `/:id/duplicate`
- Ads: `/ads`, `/analytics`, `/:id`, `/:id/preview`, `/:id/review`
- Audiences: `/audiences`, `/analytics`, `/:id`

### Dashboard

| Method | Path |
|--------|------|
| GET | `/dashboard` |
| GET | `/dashboard/kpis` |
| GET | `/dashboard/revenue` |
| GET | `/dashboard/sales` |
| GET | `/dashboard/product-insights` |
| GET | `/dashboard/customer-insights` |
| GET | `/dashboard/recent-orders` |
| GET | `/dashboard/activity` |
| GET | `/dashboard/store-health` |

Query presets commonly include `preset` / date range params consumed by the dashboard service (net revenue).

### AI

| Method | Path |
|--------|------|
| GET | `/ai/insights` |
| POST | `/ai/insights/generate` |
| POST | `/ai/insights/refresh` |
| GET | `/ai/recommendations` |
| GET | `/ai/forecasts` |
| GET | `/ai/campaign-suggestions` |

### Integrations / Settings / Uploads / Notifications / Activity

- Integrations: `/integrations`, `/status`, `/connect`, `/:id`, `/:id/sync`, sync logs
- Settings: `/settings`, `/settings/store`, `/settings/notifications`, `/settings/billing`, `/settings/security`
- Uploads: `POST/DELETE /uploads/avatar`, `POST /uploads/image`
- Notifications: list, unread-count, read, read-all, delete
- Activity: `GET /activity`

---

## 7. Authentication Architecture

### Email / password

1. **Register** → validate password policy → bcrypt hash (12 rounds) → create `User` (`provider=local`) → (FE navigates to login with `registered=1`; email register does not auto-login)
2. **Login** → verify password → `sessionPayload` → access JWT + refresh JWT → refresh hash stored in `RefreshSession`
3. **Protected APIs** → `authenticate` middleware verifies access JWT
4. **Refresh** → verify refresh JWT + DB session row → issue new pair
5. **Logout** → client discards tokens; **logout-all** revokes refresh sessions
6. **`/auth/me`** → load public user for SPA

#### Password policy (FE + BE)

- Minimum 8 characters
- At least one uppercase, one lowercase, one digit, one special (`[^A-Za-z0-9]`)
- Shared helper: `backend/src/utils/passwordPolicy.js`
- FE Zod: `src/features/auth/authSchemas.js`

### Google OAuth (actual flow)

Nexora uses **Passport Google OAuth 2.0 Authorization Code** (server redirect).  
It does **not** use GIS ID-token buttons, popups, or `VITE_GOOGLE_*`.

```text
Login/Register "Google"
  → window.location → GET /api/v1/auth/google?redirect=1&intent=login|register
  → Passport → accounts.google.com (state carries intent)
  → GET /api/v1/auth/google/callback?code&state
  → handleGoogleAuth(profile, intent)
  → find/create/update User
  → sessionPayload (JWT + refresh)
  → 302 → {CLIENT_URL}/auth/callback#token=…&refreshToken=…
  → AuthCallbackPage persists tokens, GET /auth/me, Redux setCredentials
  → /dashboard
```

| Intent | Behavior |
|--------|----------|
| `register` | Create Google user if email new → JWT → dashboard. Existing email → `already_registered`. |
| `login` | Existing user (email or Google `providerId`) → JWT. Unknown email → `not_registered` (no auto-create). |

**Local Google Cloud (exact):**

- JS origins: `http://localhost:5173`, `http://localhost:5000`
- Redirect URI: `http://localhost:5000/api/v1/auth/google/callback`
- Env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `CLIENT_URL`, `CORS_ORIGIN`

**Cancel:** `error=access_denied` → clean redirect to login/register (no error query).  
**Invalid code:** safe redirect `?error=google_failed` (no crash, no secret leak).

### React Strict Mode callback fix (critical)

**Bug:** In development, React Strict Mode mounts → unmounts → remounts `/auth/callback`. The first mount read `#token…`, saved to `localStorage`, cleared the hash; the remount saw an empty hash and falsely navigated to `?error=google_failed`.

**Fix (`src/pages/auth/AuthCallbackPage.jsx`):**

1. Persist tokens **before** clearing the hash
2. On remount, **recover** tokens from `localStorage` if hash is empty
3. Dedupe in-flight `getMe` via module-scoped promise so remount awaits the same completion

### Key files

| Layer | Path |
|-------|------|
| Passport | `backend/src/config/passport.js` |
| Auth routes/controller/service | `backend/src/modules/auth/*` |
| Password policy | `backend/src/utils/passwordPolicy.js` |
| JWT | `backend/src/utils/jwt.js` |
| FE service | `src/services/authService.js` |
| Callback UI | `src/pages/auth/AuthCallbackPage.jsx` |
| OAuth error copy | `src/utils/oauthErrors.js` |

---

## 8. Database Architecture

**ORM:** Prisma · **DB:** PostgreSQL · **Schema:** `backend/prisma/schema.prisma` (authoritative)

### Enums (high signal)

- `AuthProvider`: `local` | `google`
- `OrderStatus`: `PENDING` | `PROCESSING` | `DELIVERED` | `CANCELLED` | `UNDER_REVIEW` | **`REFUNDED`**
- `ProductStatus`, `CustomerStatus`, campaign/creative/audience enums, `IntegrationProvider` (`SHOPIFY`, `TIKTOK_SHOP`, `WOOCOMMERCE`), `NotificationType`, …

### Models & ownership

| Model | Table | Ownership |
|-------|-------|-----------|
| User | `users` | Root tenant |
| UserSettings | `user_settings` | `userId` unique |
| Product | `products` | optional `userId` (seed assigns demo) |
| Inventory | `inventory` | via Product 1:1 |
| StockMovement | `stock_movements` | product/inventory |
| Customer | `customers` | **`userId`** required; unique `(userId, email)` |
| Order | `orders` | **`userId`** required |
| OrderItem | `order_items` | via Order; `unitCost` snapshot |
| **Refund** | `refunds` | **`userId`** + `orderId`, `amount`, `reason?`, `createdAt` |
| Campaign | `campaigns` | **`userId`** |
| AdCreative | `ad_creatives` | via `campaign.userId` |
| Audience | `audiences` | **`userId`** |
| CampaignAudience | join | campaign ↔ audience |
| StoreIntegration / SyncLog | | `userId` |
| AiInsightCache | | optional `userId` |
| Notification / ActivityLog / LoginHistory / RefreshSession | | user-scoped |

### Relationship sketch

```text
User 1─* Product, Customer, Order, Campaign, Audience, Refund, Integration, …
Customer 1─* Order 1─* OrderItem
Order 1─* Refund
Product 1─1 Inventory 1─* StockMovement
Campaign 1─* AdCreative
Campaign *─* Audience (CampaignAudience)
```

### Migrations of note

- Product profitability / `unitCost`
- Tenant `userId` on customers & orders
- Tenant campaigns & audiences
- Order refunds + `REFUNDED` status

### Seed

`backend` → `npm run seed` → demo user `demo@nexora.com` / `Demo1234!` + sample commerce/growth data owned by demo user.

---

## 9. Security Architecture

| Control | Implementation |
|---------|----------------|
| Password hashing | bcrypt (12 rounds) |
| JWT access/refresh | Signed secrets; refresh rows hashed in DB |
| Transport headers | Helmet |
| CORS | `CORS_ORIGIN` / `CLIENT_URL` allowlist |
| Rate limiting | API + stricter auth window |
| Input validation | express-validator + Zod (FE) |
| Sanitization | mongo-sanitize + XSS strip |
| Secrets | Backend `.env` only; never `VITE_` for secrets |
| Google secret | Backend-only; FE starts OAuth via navigation to API |
| OAuth tokens in URL | Hash fragment (not query) |
| SPA logout hygiene | Redux root reset on logout |
| IDOR | Service-layer `userId` filters; cross-tenant → 404 |

### IDOR fixes (confirmed)

Customers, Orders, Campaigns, Audiences, Ad creatives (via campaign), Dashboard/AI campaign context — all scoped to the authenticated user.

### Password special character

Previously digits/case-only; now FE+BE require special character (aligned with product policy).

---

## 10. Business Logic — Profitability

Implemented in `backend/src/utils/refundMath.js` + `productPerformance.js` (+ dashboard/customers consumers).

### Sale inclusion

- **Included statuses:** `PENDING`, `PROCESSING`, `DELIVERED`, `UNDER_REVIEW` (with partial refunds applied)
- **Excluded:** `CANCELLED`, `REFUNDED`, and orders whose refund sum ≥ total (treated as full)

### Formulas

```text
Gross Sales (order/product lines) = Σ lineTotal
Allocated Refunds                 = proportional share of order refunds (by lineTotal)
Net Sales / Net Revenue           = max(0, Gross − Refunds)
Units Sold                        = Σ quantity          (retained on partial refund)
COGS                              = Σ (unitCost × qty)  (retained on partial refund)
Gross Profit                      = Net Sales − COGS
Profit Margin (%)                 = (Gross Profit / Net Sales) × 100
ASP                               = Net Sales / Units Sold
```

`unitCost` prefers **OrderItem snapshot**; falls back to `Product.costPrice` for legacy rows.

### Event matrix

| Event | Net Revenue | Units | COGS | Profit |
|-------|-------------|-------|------|--------|
| Completed sale | Gross | Full | Full | Net − COGS |
| Cancelled | 0 (excluded) | 0 | 0 | 0 |
| Partial refund | Gross − refunds | Retained | Retained | Net − COGS |
| Full refund | 0 (excluded) | 0 | 0 | 0 |

**MVP policy:** financial refund without modeled physical return → COGS/units stay for partial refunds.

### Example

Sale $100, cost $60, refund $40 → Net $60, COGS $60, Profit $0, Margin 0%.

---

## 11. Refund System

### Model (`Refund`)

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | PK |
| userId | string | Tenant |
| orderId | string | Parent order |
| amount | Decimal(14,2) | > 0 |
| reason | string? | Optional |
| createdAt | DateTime | |

### API

- `POST /api/v1/orders/:id/refunds` `{ amount, reason? }`
- `GET /api/v1/orders/:id/refunds`
- `GET /api/v1/orders/refund/:refundId`

### Rules

- Amount must be finite and **> 0**
- Cannot exceed remaining refundable (`total − Σ refunds`)
- Cannot refund `CANCELLED` or already `REFUNDED`
- Full refund sets `OrderStatus.REFUNDED`
- Prisma **Serializable** transaction; conflict → retry-oriented error (`P2034`)
- Cross-tenant create/list/get → **404**
- Customer `totalSpent` / AOV recomputed net of refunds
- **Does not** restore inventory

### Concurrency

Live race: simultaneous 70% + 50% attempts on one order → one succeeds, one rejected; total refunded never exceeds order total.

---

## 12. Product Profitability

### Where users see it

- Products table columns (sold / profit)
- Product detail performance grid + trends
- Dashboard product insights / top profit
- AI context profitability summaries

### Metrics

`unitsSold`, `ordersCount`, `grossSales`, `netSales`, `cogs`, `grossProfit`, `profitMargin`, `averageSellingPrice`, trends.

### Ranges

`today`, `yesterday`, `7d`/`last7`, `14d`/`last14`, `custom` (+ dates), `all`.

---

## 13. Dashboard

### Data sources

`dashboard.service.js` aggregates **user-scoped** orders (net), products, customers, inventory, activity, campaigns.

### Typical widgets

- KPI cards: revenue, orders, products (w/ inventory value), customers
- Revenue & sales series (net)
- Product insights (incl. profit)
- Customer insights
- Recent orders
- Activity
- Store health / low stock
- ROAS / conversion rate fields in KPI payload
- Embedded AI insights

### Date filtering

Presets such as today / yesterday / last 7 / last 14 / custom (and API `all` where supported). Frontend dashboard controls map to backend range queries.

---

## 14. UI / Design System

Preserve existing design; do not redesign.

| Aspect | Implementation |
|--------|----------------|
| Aesthetic | Premium SaaS, glass panels, soft purple brand |
| Modes | Light + dark (`ThemeContext`); **colors** change, layouts stay |
| Typography | Theme fonts via CSS tokens (Inter family in theme) |
| Charts | Recharts |
| Motion | Framer Motion |
| Navigation | Sidebar + dashboard shell |
| Tables | Shared table styles |

### CSS standards (from `src/index.css`)

| Token | Value |
|-------|-------|
| Toolbar controls height | **38px** |
| Table header height | **43px** |

Filter tabs: transparent background; selected state uses purple + bold text (existing pattern). Default list page sizes follow each page’s pagination (commonly up to 100 where implemented).

---

## 15. Environment Configuration

**Never commit real secrets. Never put Google/JWT/DB secrets in `VITE_*`.**

### Frontend (project root `.env`)

| Variable | Required | Secret? | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | Yes | No | API base including `/api/v1` |
| `VITE_APP_NAME` | Optional | No | Display name |
| `VITE_DEFAULT_THEME` | Optional | No | Initial theme hint |

### Backend (`backend/.env`)

| Variable | Required | Secret? | Purpose |
|----------|----------|---------|---------|
| `NODE_ENV` | Yes (prod) | No | `production` / `development` |
| `PORT` | Optional | No | Default `5000` |
| `API_PREFIX` | Optional | No | Default `/api/v1` |
| `DATABASE_URL` | **Yes** | Yes | Postgres connection |
| `JWT_SECRET` / `JWT_ACCESS_SECRET` | **Yes** (prod) | Yes | Access token signing |
| `JWT_REFRESH_SECRET` | **Yes** (prod) | Yes | Refresh signing |
| `JWT_EXPIRES_IN` / `JWT_ACCESS_EXPIRES_IN` | Optional | No | Default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Optional | No | Default `7d` |
| `CLIENT_URL` | **Yes** | No | SPA origin for OAuth redirects |
| `CORS_ORIGIN` | **Yes** | No | Allowed browser origin(s) |
| `GOOGLE_CLIENT_ID` | Feature | Semi-public | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Feature | **Yes** | Google OAuth (backend only) |
| `GOOGLE_CALLBACK_URL` | Feature | No | Must match Console redirect |
| `GEMINI_API_KEY` | Optional | Yes | Live Gemini |
| `GEMINI_MODEL` | Optional | No | Default `gemini-2.0-flash` |
| `CLOUDINARY_CLOUD_NAME` | Optional | No | Media CDN |
| `CLOUDINARY_API_KEY` | Optional | Semi | Media |
| `CLOUDINARY_API_SECRET` | Optional | **Yes** | Media |
| `UPLOAD_DIR` | Optional | No | Local upload fallback |
| `UPLOAD_MAX_FILE_SIZE_MB` | Optional | No | Default 5 |
| `RATE_LIMIT_*` | Optional | No | Throttles |
| `JOBS_ENABLED` | Optional | No | Cron on/off |

### Placeholders

```text
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5433/nexora?schema=public
JWT_SECRET=<random-32+-chars>
JWT_REFRESH_SECRET=<random-32+-chars>
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:5000/api/v1
```

Shopify / TikTok Partner / Stripe / transactional email: **no env vars read by current code**.

---

## 16. Local Development Setup

### Prerequisites

- Node.js ≥ 18
- PostgreSQL (local often port **5433**; Docker may use 5432)
- npm

### Steps

```bash
# 1) Clone
git clone <repo-url>
cd Tiktok-market-dash

# 2) Frontend deps
npm install

# 3) Backend deps
cd backend
npm install

# 4) Env
cp .env.example .env                 # from backend/
# edit DATABASE_URL, JWT_*, CLIENT_URL, CORS_ORIGIN, optional Google/Gemini/Cloudinary
cd ..
# root .env
# VITE_API_URL=http://localhost:5000/api/v1

# 5–8) Database
cd backend
npx prisma migrate deploy            # or: npm run prisma:migrate
npx prisma generate
npm run seed                         # demo@nexora.com / Demo1234!

# 9) Start backend
npm run dev                          # http://localhost:5000

# 10) Start frontend (new terminal, repo root)
cd ..
npm run dev                          # http://localhost:5173
```

Optional: `backend` Docker Compose for Postgres if present in repo.

### Demo credentials (after seed)

```text
Email:    demo@nexora.com
Password: Demo1234!
```

---

## 17. Testing

### Commands (actual)

| Check | Command | Location |
|-------|---------|----------|
| Backend tests | `npm test` | `backend/` (`node --test tests/**/*.test.js`) |
| Frontend build | `npm run build` | root |
| Frontend lint | `npm run lint` | root (oxlint) |
| Prisma validate | `npx prisma validate` | `backend/` |
| Prisma generate | `npx prisma generate` | `backend/` |
| Seed | `npm run seed` | `backend/` |

### Coverage areas in automated tests

- Health / auth 401 smoke
- Password policy validators
- Product performance math
- Refund profitability math + intent helpers
- Settings validators

### Latest known automated counts (2026-08-08 finalize)

```text
Backend:  41 passed / 0 failed
Frontend: build PASS
Prisma:   validate + generate PASS
```

### Manual / live QA

- Auth + Google browser E2E (**WORKING**)
- IDOR matrices (customers, orders, campaigns, ads, audiences)
- Refund full/partial/multi/over/race
- Dashboard / product performance consistency

---

## 18. Final QA Status

| Area | Status | Notes |
|------|--------|-------|
| Authentication (email) | **PASS** | Special-char policy enforced |
| Google OAuth | **PASS** | Manual browser E2E WORKING |
| JWT / `/auth/me` / protected routes | **PASS** | |
| Products + profitability | **PASS** | Net of refunds |
| Orders | **PASS** | Live API (no mocks) |
| Refunds | **PASS** | Model + concurrency |
| Inventory | **PASS** | |
| Customers | **PASS** | Net LTV |
| Campaigns | **PASS** | Tenant-scoped |
| Ad Manager | **PASS** | Via campaign ownership |
| Audiences | **PASS** | Tenant-scoped |
| Dashboard | **PASS** | Net revenue |
| AI | **PASS w/ caveat** | Heuristic if Gemini unavailable |
| IDOR suite | **PASS** | |
| Frontend build | **PASS** | |
| Backend tests | **PASS** (41/41) | |
| Prisma | **PASS** | |
| Cloudinary | **WARN** | Optional; local uploads fallback |
| Shopify Partner | **BLOCKED** | External / future |
| TikTok Partner live | **BLOCKED** | Sandbox only |

**Overall product status:** `READY WITH WARNINGS`

---

## 19. Known Limitations

1. **Physical returns / automatic stock restore on refund** — not modeled; refunds are financial-only.
2. **Cloudinary** — optional locally; required for multi-instance PaaS uploads.
3. **Shopify** — connect rejected as coming soon; no Partner env vars.
4. **TikTok Shop Partner / Ads Marketing API** — not production-wired; sandbox / DB metrics.
5. **Gemini** — may fall back to heuristic depending on key/provider health.
6. **Stripe billing / email delivery** — not implemented.
7. **Frontend component test suite** — checklist / manual + backend Node tests (limited FE unit automation).

Do **not** list fixed IDOR, mock-orders, Google JWT-register, or Strict Mode callback bugs as open issues.

---

## 20. Deployment

### Recommended topology

| Layer | Host |
|-------|------|
| Frontend | **Vercel** (Vite SPA + `vercel.json` rewrites) |
| Backend | **Railway** or **Render** (`backend/` as root) |
| Database | Managed PostgreSQL |
| Media | **Cloudinary** |
| AI | Google Gemini (optional) |

### Production checklist

1. Set strong `JWT_SECRET` / `JWT_REFRESH_SECRET` (≥32, not dev defaults)
2. `DATABASE_URL` → `npx prisma migrate deploy && npx prisma generate`
3. `CLIENT_URL` + `CORS_ORIGIN` = real SPA origin
4. `VITE_API_URL` = `https://<api-host>/api/v1`
5. Google Console production redirect = `https://<api-host>/api/v1/auth/google/callback`
6. Cloudinary for durable uploads
7. `NODE_ENV=production` (hides stacks)
8. Health: `GET /api/v1/health`

Deployment guides historically lived in `DEPLOYMENT_GUIDE.md` (content merged here). Deploy is **documented**, not asserted as already live in production.

---

## 21. Troubleshooting

### Frontend won’t start

- Node ≥ 18; `npm install` at repo root
- Port 5173 free; `npm run dev`

### Backend won’t start

- `cd backend && npm install && npm run dev`
- Check `DATABASE_URL` and Postgres listening
- Prisma client generated

### Prisma / migration failures

```bash
cd backend
npx prisma validate
npx prisma migrate deploy
npx prisma generate
```

### Auth / JWT failures

- Align FE `VITE_API_URL` with running API
- Clear `localStorage` key `nexora_auth`
- Ensure JWT secrets set (prod)

### Google OAuth

| Item | Local value |
|------|-------------|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |
| Callback | `http://localhost:5000/api/v1/auth/google/callback` |

Common issues:

- `redirect_uri_mismatch` → Console URI must match `GOOGLE_CALLBACK_URL` exactly (`localhost` ≠ `127.0.0.1`)
- `not_registered` → use Register→Google first (login does not auto-create)
- `already_registered` → use Login→Google
- Historic false `google_failed` after consent → Strict Mode hash clear (fixed in `AuthCallbackPage`)

### CORS

`CORS_ORIGIN` must include the exact SPA origin you open in the browser.

### Cloudinary / AI unavailable

App continues: local `/uploads`; AI heuristic fallback.

### Missing env

Google missing → `google_not_configured` redirect; email auth still works.

---

## 22. Development History / Important Fixes

| Fix | Summary |
|-----|---------|
| Orders API | Removed mock-only orders; live module + UI wiring |
| Customer/Order IDOR | `userId` tenancy migration + service scoping |
| Campaign/Audience tenancy | `userId` + seed ownership |
| Ad Manager ownership | Enforced via `campaign.userId` |
| Dashboard/AI campaign leak | Queries scoped by user |
| Password special char | FE Zod + BE validators + change-password |
| Logout state leak | `rootReducer` resets features on logout |
| Refunds + profitability | `Refund` model, net math across products/dashboard/customers |
| Google register JWT | Register intent issues session tokens (not only `/login?registered=1`) |
| Google Strict Mode race | Token recover + promise dedupe on `/auth/callback` |
| Media / API Keys pages | Removed from product navigation where applicable |
| Shopify branding on login | Removed; Google + email only |
| Dashboard clutter | Duplicate AI / quick-actions cleaned per prior product decisions |

---

## 23. Current Project Status

### COMPLETED

- Auth (email + Google + JWT + refresh)
- Products + profitability
- Orders + refunds (financial)
- Inventory, customers
- Dashboard (net KPIs)
- Campaigns, ads, audiences (tenant-safe)
- AI insights (Gemini + heuristic)
- Settings, profile, notifications, uploads
- Security IDOR hardening
- Seeded demo environment
- Master documentation (this file)

### OPTIONAL / EXTERNAL DEPENDENCY

- Cloudinary production credentials
- Gemini reliability / paid quota
- Google Cloud OAuth client for each deployed environment

### FUTURE

- Shopify / TikTok Partner production OAuth & sync
- Physical return / inventory restore workflow
- Stripe billing, email delivery
- Multi-store / team collaboration / advanced generative AI

---

## 24. Future Roadmap

Labeled **future work** (not implemented as production features today):

- Shopify production integration
- TikTok Shop Partner live sync + Ads Marketing API
- WooCommerce deeper sync
- Amazon / Daraz channels
- Multi-store management
- Competitor tracking
- Team collaboration / roles beyond basic `user`/`admin` enum usage
- AI demand forecasting upgrades
- AI advertisement / image generation suites
- Advanced automation / workflows
- Physical returns management

---

## 25. Developer Handoff

### If you are a new developer — start here

1. Read **this document** end-to-end
2. Configure env (§15) and run local setup (§16)
3. Log in as `demo@nexora.com` / `Demo1234!`
4. Trace:
   - FE entry: `src/main.jsx` → `AppRouter.jsx`
   - BE entry: `backend/src/server.js` → `app.js` → `routes/v1`
   - Schema: `backend/prisma/schema.prisma`
   - Auth: `backend/src/modules/auth` + `src/pages/auth`
   - Money math: `backend/src/utils/refundMath.js`, `productPerformance.js`
5. Run `cd backend && npm test` and root `npm run build` before claiming done

### Development philosophy

- Preserve existing architecture and approved UI
- Do not redesign completed screens
- Reuse components and patterns
- Maintain tenant isolation on every new query
- Validate all backend input
- Keep secrets server-side
- Prefer smallest correct fix over rewrites
- Test (automated + relevant live checks) before claiming completion
- Do not invent Partner integrations or pretend sandbox is production
- Do not introduce unnecessary dependencies

---

## Appendix A — Script cheat sheet

| Where | Command | Purpose |
|-------|---------|---------|
| Root | `npm run dev` | Vite FE |
| Root | `npm run build` | Production bundle |
| Root | `npm run lint` | Oxlint |
| Backend | `npm run dev` | API (nodemon) |
| Backend | `npm start` | Production API |
| Backend | `npm test` | Automated tests |
| Backend | `npm run seed` | Demo data |
| Backend | `npx prisma migrate deploy` | Apply migrations |
| Backend | `npx prisma generate` | Client generate |
| Backend | `npx prisma validate` | Schema validate |

---

## Appendix B — Consolidation note

This file consolidates and supersedes prior scattered docs including: `FINAL_QA_REPORT.md`, `FINAL_TEST_CHECKLIST.md`, `GOOGLE_AUTH_SETUP.md`, `DATABASE_SCHEMA.md`, `API_REFERENCE.md`, `PRODUCT_PROFITABILITY_DOCUMENTATION.md`, `API_SETUP_GUIDE.md`, `REQUIRED_API_KEYS_AND_CREDENTIALS.md`, `DEPLOYMENT_GUIDE.md`, `TESTING_GUIDE.md`, `RELEASE_CHECKLIST.md`, `FINAL_SYSTEM_DOCUMENTATION.md`, `CAMPAIGNS_AI_DOCUMENTATION.md`, `DASHBOARD_STORE_INTEGRATIONS_DOCUMENTATION.md`, `INVENTORY_CUSTOMERS_DOCUMENTATION.md`, `backend/docs/AUTH.md`, and related architecture markdown. Conflicts were resolved from **source code** and **current test results** (e.g. backend suite **41** tests, not older “33/39” counts).

---

*End of Nexora complete project documentation.*
