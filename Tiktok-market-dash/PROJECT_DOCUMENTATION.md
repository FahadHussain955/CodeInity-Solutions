# NEXORA — Complete Project Documentation

**Single source of truth** for the Nexora codebase.  
**Authority order when sources disagree:** (1) source code, (2) Prisma schema, (3) `package.json` / config, (4) automated tests, (5) older docs.

| Meta | Value |
|------|--------|
| **Last verified against source** | 2026-08-09 |
| **Frontend package** | `tiktok-market-dash` (Vite SPA at repo root) |
| **Backend package** | `nexora-backend` (`backend/`) |
| **Product maturity** | Release Candidate — core seller dashboard implemented; some external Partner integrations are sandbox or blocked |

---

## Table of contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Core Features](#4-core-features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Database Architecture](#9-database-architecture)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Google OAuth](#11-google-oauth)
12. [Security](#12-security)
13. [Product Management](#13-product-management)
14. [Inventory Management](#14-inventory-management)
15. [Orders & Customers](#15-orders--customers)
16. [Refund System](#16-refund-system)
17. [Dashboard](#17-dashboard)
18. [Campaigns, Ads & Audiences](#18-campaigns-ads--audiences)
19. [AI System](#19-ai-system)
20. [TikTok Shop / Marketplace Integration](#20-tiktok-shop--marketplace-integration)
21. [Default Profile Avatar](#21-default-profile-avatar)
22. [API Documentation](#22-api-documentation)
23. [Environment Variables](#23-environment-variables)
24. [Testing](#24-testing)
25. [Deployment](#25-deployment)
26. [Error Handling](#26-error-handling)
27. [Known Limitations](#27-known-limitations)
28. [Future Roadmap](#28-future-roadmap)
29. [Important File/Folder Map](#29-important-filefolder-map)
30. [Important Technical Flows](#30-important-technical-flows)
31. [Project Evaluation & Viva Preparation](#31-project-evaluation--viva-preparation)
32. [Final Project Summary](#32-final-project-summary)

**Status legend used below**

| Label | Meaning |
|-------|---------|
| **Fully implemented** | End-to-end in current code (UI + API + DB where applicable) |
| **Optional / external** | Works when credentials/services are configured; otherwise degrades or disables |
| **Sandbox / placeholder** | Present for demos/architecture; not a live Partner production connector |
| **Future work** | Not implemented as production behavior |
| **Not confirmed** | Could not be fully verified from current implementation |

---

## 1. Project Overview

| Item | Value |
|------|--------|
| **Project name** | **Nexora** |
| **What it is** | A full-stack SaaS seller dashboard for marketplace commerce operations and growth |
| **Primary channel focus** | TikTok Marketplace / TikTok Shop–oriented workflows (with multi-provider schema scaffolding) |
| **Target users** | Online marketplace sellers who need products, inventory, orders, customers, campaigns, and insights in one place |
| **Core value proposition** | Centralize seller operations, show **net** profitability (after refunds), and provide AI-assisted insights — with production-shaped auth and tenant isolation |

Nexora is **not**:

- A live Shopify/TikTok Shop Partner production sync product (Partner APIs are not wired; TikTok connect is sandbox-shaped)
- A billing/payment processor (Stripe is not implemented)
- A standalone AI chat product (AI is embedded: insights panel + product-from-image draft)

---

## 2. Problem Statement

Marketplace sellers often manage catalog, stock, orders, refunds, customers, and ads across fragmented tools. That makes it hard to answer:

- What is my **true** revenue after refunds?
- Which products are profitable after cost of goods?
- Which SKUs are low on stock?
- What should I fix next (pricing, inventory, campaigns)?

A centralized seller-management platform is useful because it:

1. Stores operational data under one authenticated account (tenant).
2. Computes consistent financial KPIs from the same order/refund rules.
3. Surfaces growth tools (campaigns/ads/audiences) and AI guidance from real business context.
4. Provides a path toward marketplace connection (sandbox today; Partner OAuth later).

---

## 3. Project Objectives

### Business objectives

- Give sellers a single dashboard for day-to-day operations and growth decisions.
- Make profitability **net of refunds**, not gross-only vanity metrics.
- Support onboarding via email/password and Google sign-in.
- Encourage TikTok Shop connection without pretending Partner APIs are live.

### Technical objectives

- SPA frontend (React + Vite) calling a versioned REST API (`/api/v1`).
- Express modular backend with Prisma + PostgreSQL.
- JWT access + refresh session model with tenant-scoped queries.
- Secure uploads (Cloudinary optional; local fallback).
- AI insights via Gemini when configured, with heuristic fallback for insights.
- Clear separation of implemented vs sandbox vs future work.

---

## 4. Core Features

### 4.1 Authentication, registration, login, logout

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** |
| **What** | Email/password register & login; JWT sessions; logout; logout-all |
| **Why** | Protect seller data and isolate tenants |
| **Frontend** | `src/pages/auth/LoginPage.jsx`, `RegisterPage.jsx`; `src/features/auth/authSlice.js`; `src/hooks/useAuth.js`; `src/services/authService.js` |
| **Backend** | `backend/src/modules/auth/` |
| **DB** | `User`, `RefreshSession`, `LoginHistory`, `ActivityLog` |
| **Security** | bcrypt (12 rounds); password policy; rate limits on `/auth`; validators |

**Important behavior (from code):**

- **Email register** (`POST /auth/register`) returns the public user object and **does not** issue JWTs. User must log in afterward.
- **Email login** issues access + refresh tokens and stores a hashed refresh session.
- **Logout** (`POST /auth/logout`) is documented in code as client-side discard of tokens (JWT is client-held for MVP).
- **Logout-all** revokes all active refresh sessions for the user.

### 4.2 Google OAuth

| Aspect | Detail |
|--------|--------|
| **Status** | **Optional / external** (requires Google Cloud OAuth credentials) |
| **What** | Passport Google OAuth 2.0 **authorization-code** redirect flow |
| **Frontend** | Redirect to API `/auth/google`; complete on `/auth/callback` (`AuthCallbackPage.jsx`) |
| **Backend** | `backend/src/config/passport.js`, `auth.routes.js`, `auth.service.js` → `handleGoogleAuth` |
| See | [§11 Google OAuth](#11-google-oauth) |

### 4.3 User profile, avatar upload, default avatar

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** |
| **What** | Profile overview/activity/security; avatar upload/remove; default avatar fallback |
| **Frontend** | `ProfilePage.jsx`, `UserAvatar.jsx`, `default-avatar.svg` |
| **Backend** | `GET/PATCH/DELETE /auth/me`; `POST/DELETE /uploads/avatar` |
| **DB** | `User.avatar`, `User.avatarPublicId`; activity via `ActivityLog` |
| See | [§21 Default Profile Avatar](#21-default-profile-avatar) |

### 4.4 Dashboard

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** |
| **What** | KPIs, revenue/sales charts, product/customer insights, recent orders, activity, store health |
| **Frontend** | `src/pages/dashboard/DashboardPage.jsx` |
| **Backend** | `backend/src/modules/dashboard/` |
| See | [§17 Dashboard](#17-dashboard) |

### 4.5 Products

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** (+ optional Gemini for image→product draft) |
| **What** | CRUD, rankings, performance, images, AI draft fill on Add Product |
| **Frontend** | `ProductsPage`, `AddProductPage`, `ProductDetailPage` |
| **Backend** | `backend/src/modules/products/`; AI generate in `modules/ai` |
| **DB** | `Product`, linked `Inventory`, `OrderItem` |
| See | [§13 Product Management](#13-product-management) |

### 4.6 Inventory

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** |
| **What** | Stock levels, restock/adjust/out-of-stock, bulk, history, analytics, dashboard widgets |
| **Frontend** | `InventoryPage.jsx` |
| **Backend** | `backend/src/modules/inventory/` |
| **DB** | `Inventory`, `StockMovement` |
| See | [§14 Inventory Management](#14-inventory-management) |

### 4.7 Customers

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** |
| **What** | CRUD, analytics, purchase history; totals recomputed with refunds |
| **Frontend** | `CustomersPage`, `CustomerDetailPage` |
| **Backend** | `backend/src/modules/customers/` |
| **DB** | `Customer` (`userId` required; unique `[userId, email]`) |

### 4.8 Orders & refunds

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** (financial refunds; no physical return/stock restore) |
| **What** | Order list/detail, status updates, partial/full refunds |
| **Frontend** | `OrdersPage`, `OrderDetailPage` |
| **Backend** | `orders/` + `refunds.service.js` |
| **DB** | `Order`, `OrderItem`, `Refund` |
| See | [§15](#15-orders--customers), [§16](#16-refund-system) |

### 4.9 Profitability

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** (calculation utilities + product/dashboard usage) |
| **What** | Net revenue after refunds; COGS/profit/margin aggregation |
| **Code** | `backend/src/utils/refundMath.js`, `productPerformance.js` |
| See | [§13](#13-product-management), [§16](#16-refund-system) |

### 4.10 Campaigns, ads, audiences

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** as first-party CRUD + analytics in Nexora DB (not live TikTok Ads Marketing API) |
| **What** | Campaigns with creatives/audiences links; ad review/preview; audience targeting fields |
| **Backend** | `campaigns/`, `ads/`, `audiences/` — ownership via `userId` / campaign ownership |
| See | [§18](#18-campaigns-ads--audiences) |

### 4.11 AI insights, recommendations, forecasts

| Aspect | Detail |
|--------|--------|
| **Status** | **Fully implemented** with **optional Gemini**; insights have **heuristic fallback** |
| **What** | Insights panel; recommendations/forecasts/campaign-suggestions derived from insights + DB context; product-from-image (Gemini-only) |
| See | [§19 AI System](#19-ai-system) |

### 4.12 TikTok Shop / integrations

| Aspect | Detail |
|--------|--------|
| **Status** | **Sandbox / placeholder** for TikTok connect+sync; Shopify/WooCommerce **connect blocked** (“coming soon”) |
| **What** | Connect modal, status APIs, sandbox sync progress; post-login connect prompt |
| See | [§20](#20-tiktok-shop--marketplace-integration) |

### 4.13 Notifications, settings, activity, uploads

| Feature | Status | Notes |
|---------|--------|-------|
| Notifications list/read/unread | Fully implemented | `Notification` model |
| Settings store + notification prefs | Fully implemented | `UserSettings` |
| Billing settings endpoint | **Placeholder-shaped** | Reads plan fields from settings; **no Stripe** |
| Security settings endpoint | Present | Exposes security-related settings payload from service |
| Activity log | Fully implemented | `ActivityLog` |
| Image/avatar uploads | Fully implemented | Cloudinary **optional**; local `UPLOAD_DIR` fallback |

---

## 5. Technology Stack

### Frontend (root `package.json`)

| Technology | Version (declared) | Where used | Why |
|------------|-------------------|------------|-----|
| React | `^19.2.8` | UI | Component model for SPA |
| React DOM | `^19.2.8` | Rendering | Browser mount |
| Vite | `^8.2.0` | Bundler/dev server | Fast FE toolchain |
| React Router DOM | `^7.18.2` | Routing | SPA routes + layouts |
| Redux Toolkit + react-redux | `^2.12.0` / `^9.3.0` | Client state | Feature slices, async thunks |
| Axios | `^1.19.0` | HTTP | Public/private clients + refresh interceptors |
| React Hook Form | `^7.84.0` | Auth forms | Controlled validation UX |
| Zod + resolvers | `^4.4.3` / `^5.7.1` | Auth schemas | Schema validation on login/register |
| Tailwind CSS (+ Vite plugin) | `^4.3.3` | Styling | Design tokens / utility UI |
| Recharts | `^3.10.1` | Charts | Dashboard visualizations |
| Framer Motion | `^12.43.0` | Motion | UI animations where used |
| Lucide React | `^1.28.0` | Icons | Icon set (alongside Material Symbols in markup) |
| Oxlint | `^1.75.0` | Lint | `npm run lint` |

### Backend (`backend/package.json`)

| Technology | Version (declared) | Where used | Why |
|------------|-------------------|------------|-----|
| Node.js | `>=18` (engines) | Runtime | Async server |
| Express | `^5.2.1` | HTTP API | Modular REST |
| Prisma + adapter-pg + pg | `^7.9.1` / `^8.16.3` | ORM + DB driver | Type-safe PostgreSQL access |
| PostgreSQL | via `DATABASE_URL` | Persistence | Relational multi-tenant data |
| bcrypt | `^6.0.0` | Passwords | Hashing |
| jsonwebtoken | `^9.0.3` | Access/refresh JWTs | Stateless access + signed refresh |
| Passport + passport-google-oauth20 | `^0.7.0` / `^2.0.0` | Google OAuth | Authorization-code strategy |
| express-validator | `^7.3.2` | Input validation | Route validators |
| helmet / cors / compression / morgan | as declared | Hardening & logging | Baseline API security |
| express-rate-limit | `^8.6.2` | Abuse control | API + auth limiters |
| multer | `^2.2.0` | Uploads | Multipart parsing |
| cloudinary | `^2.10.0` | Media (optional) | Cloud image hosting |
| node-cron | `^4.6.0` | Jobs | Background tasks when enabled |
| express-mongo-sanitize | `^2.2.0` | Input sanitize | Operator injection hardening on body/query |

**Not in dependencies (do not claim as used):** Stripe SDK, TikTok Shop Partner SDK, Shopify API SDK, Nodemailer/SendGrid (email delivery), GIS / Google Identity Services client library.

---

## 6. System Architecture

```
┌─────────────────┐
│  Seller (Browser)│
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────┐
│ React + Vite SPA            │
│ (Redux, Router, Axios)      │
└────────┬────────────────────┘
         │ REST /api/v1  + Bearer JWT
         ▼
┌─────────────────────────────┐
│ Express API (backend/)      │
│ Middleware → Routes →       │
│ Controllers → Services      │
└────────┬────────────────────┘
         │ Prisma Client
         ▼
┌─────────────────────────────┐
│ PostgreSQL                  │
└─────────────────────────────┘

Optional / external (when configured):
  • Google OAuth (Passport redirect)
  • Google Gemini (insights + product-from-image)
  • Cloudinary (uploads; else local disk)
```

| External service | Role in Nexora | Status |
|------------------|----------------|--------|
| Google OAuth | Sign-in / register | Optional; disabled if env unset |
| Gemini API | AI insights + multimodal product draft | Optional for insights (heuristic fallback); **required** for product-from-image |
| Cloudinary | Avatar/product images | Optional; local fallback |
| TikTok Shop Partner API | Live catalog/order sync | **Not production-wired** — sandbox sync only |
| Shopify / WooCommerce Partner APIs | Multi-channel sync | Connect **blocked** as coming soon |

---

## 7. Frontend Architecture

### Entry & providers

| Piece | Path |
|-------|------|
| Entry | `src/main.jsx` → `App.jsx` |
| Providers | `src/providers/AppProviders.jsx` — Redux → `ThemeProvider` → `StoreConnectionProvider` → `AuthBootstrap` |
| Router | `src/routes/AppRouter.jsx` |

### Routing

- **Public:** `/login`, `/register`, `/terms`, `/privacy` (PublicRoute + AuthLayout)
- **OAuth landing:** `/auth/callback`
- **Protected dashboard shell:** `/dashboard/*` (ProtectedRoute + DashboardLayout)
- **Forgot/reset password routes** redirect to `/login` (no full reset flow implemented in router)

Route constants: `src/constants/routes.js`.

### Pages (actual)

Under `src/pages/`: auth, dashboard, products, orders, inventory, customers, campaigns, ads, audience, settings, profile, legal, system (`NotFoundPage`).

### Components / layouts

| Area | Paths |
|------|-------|
| Layout | `src/layouts/DashboardLayout.jsx`, auth layout under layouts/components as used by router |
| Nav | `src/components/navigation/Sidebar.jsx`, `Navbar.jsx` |
| Modals | `ConnectStoreModal.jsx`, `TikTokConnectPrompt.jsx` |
| AI panel | `src/components/panels/AIInsightsPanel.jsx` |
| Shared UI | `src/components/ui/*` including `UserAvatar.jsx` |

### State management

- Redux feature slices in `src/features/*` registered in `src/redux/rootReducer.js`.
- **On logout**, root reducer resets feature state (prevents cross-user SPA leakage).
- Auth persisted in `localStorage` key `nexora_auth` (`src/constants/auth.js`).

### API communication

- `src/lib/axios.js` — `axiosPublic` / `axiosPrivate`
- Private client attaches Bearer access token; on 401 attempts refresh via `/auth/refresh`
- Feature services in `src/services/*`

### Auth gates & session

- `ProtectedRoute.jsx` / `PublicRoute.jsx`
- `AuthBootstrap` restores session on load
- Idle session guard (`SessionIdleGuard`) uses idle timeout constants from `src/constants/auth.js` (15 minutes idle; refresh interval 5 minutes)

### Theme

- `src/contexts/ThemeContext.jsx` — light/dark; persists `nexora_theme`; toggles `html.dark`

### Forms & validation

- Auth: React Hook Form + Zod (`src/features/auth/authSchemas.js`)
- Many dashboard forms use local component state / manual checks (no project-wide Zod requirement)

### Error / loading UX

- Slice `status` / `error` / page-local notice banners
- Lazy routes with Suspense in `AppRouter`
- Exact per-page skeleton patterns: **follow each page** (not a single global design system document beyond CSS tokens)

### Responsive UI

- Sidebar collapses behind mobile menu in `DashboardLayout`; Tailwind breakpoints used throughout

---

## 8. Backend Architecture

### Entry

| Piece | Path |
|-------|------|
| Process entry | `backend/src/server.js` — Prisma connect, listen, start jobs if enabled |
| Express app | `backend/src/app.js` |
| Env | `backend/src/config/env.js` |
| Prisma client | `backend/src/lib/prisma.js` |
| V1 mounts | `backend/src/routes/v1/index.js` |

### Middleware order (`app.js`)

1. Disable `x-powered-by`; `trust proxy`
2. Helmet, compression, CORS
3. JSON / urlencoded parsers
4. Sanitize (`express-mongo-sanitize` + XSS deep strip)
5. Rate limit on API prefix; stricter limit on `/auth`
6. Static `/uploads`
7. Request logger (morgan)
8. Passport initialize
9. Routes
10. `notFoundHandler` → `errorHandler`

### Module pattern

Each domain under `backend/src/modules/<name>/` typically has:

`*.routes.js` → `*.controller.js` → `*.service.js` (+ `*.validators.js` where present)

### Auth middleware

- `backend/src/middlewares/authenticate.js` (Bearer access JWT → `req.user`)

### Validation & errors

- express-validator chains + `validateRequest`
- `ApiError` + centralized `errorHandler`
- `ApiResponse` helpers for envelopes

### Jobs (optional)

Under `backend/src/jobs/` (inventory check, store sync, AI refresh, cleanup) — gated by env such as `JOBS_ENABLED` (see `.env.example`).

---

## 9. Database Architecture

**ORM:** Prisma (`backend/prisma/schema.prisma`)  
**DB:** PostgreSQL

### Relationship overview (simplified)

```
User ──┬── Product ── Inventory ── StockMovement
       ├── Customer ── Order ── OrderItem
       │                 └── Refund
       ├── StoreIntegration ── SyncLog
       ├── Campaign ── AdCreative
       │        └── CampaignAudience ── Audience
       ├── UserSettings (1:1)
       ├── Notification
       ├── ActivityLog
       ├── LoginHistory
       ├── RefreshSession
       └── AiInsightCache
```

### Tenant ownership

| Model | Tenancy |
|-------|---------|
| Customer, Order, Refund, Campaign, Audience, StoreIntegration, SyncLog, Notification, UserSettings, LoginHistory, RefreshSession | **`userId` required** (or via parent) |
| Product | `userId` **optional** in schema (`String?`) — services typically scope by user; dashboard helpers also allow `userId: null` legacy rows via `OR` |
| AiInsightCache / ActivityLog | optional `userId` |

### Notable constraints

- `User.email` unique; `@@unique([provider, providerId])`
- `Customer @@unique([userId, email])`
- `Product.sku` globally unique
- `Order.orderNumber` unique
- `StoreIntegration @@unique([userId, provider, storeUrl])`
- Soft delete via `User.deletedAt`

### Enums (selected)

`AuthProvider`, `Role`, `ProductStatus`, `OrderStatus` (incl. `REFUNDED`), `IntegrationProvider` (`SHOPIFY`, `TIKTOK_SHOP`, `WOOCOMMERCE`), campaign/ad/audience status enums, `NotificationType`, etc. — full list in schema.

---

## 10. Authentication & Authorization

### Password policy

Min 8 chars; upper; lower; digit; special (`backend/src/utils/passwordPolicy.js`). Enforced on register and change-password (FE Zod + BE validators).

### Registration (email)

1. Validate body  
2. Hash password with **bcrypt** (12 rounds)  
3. Create user (or reactivate soft-deleted email)  
4. Return `{ user }` **without tokens**  
5. Frontend expects user to log in

### Login (email)

1. Find active user with password  
2. `bcrypt.compare`  
3. Write `LoginHistory`  
4. Issue **access JWT** + **refresh JWT**  
5. Store **SHA-256 hash** of refresh token in `RefreshSession`  
6. Return tokens + public user

### Access JWT vs refresh JWT

| Token | Typical expiry (env defaults) | Purpose |
|-------|-------------------------------|---------|
| Access | `15m` (`JWT_EXPIRES_IN` / `JWT_ACCESS_EXPIRES_IN`) | Authorize API calls |
| Refresh | `7d` (`JWT_REFRESH_EXPIRES_IN`) | Obtain new token pair via `POST /auth/refresh` |

Secrets: `JWT_SECRET` / `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (see env module for resolution).

### Refresh flow

1. Client sends refresh token  
2. Verify JWT signature/expiry  
3. Match active `RefreshSession` by hash  
4. Revoke old session; create new session (rotation)  
5. Return new access + refresh

### Logout

- **Logout:** client discards tokens (API acknowledges; does not revoke refresh in MVP comment)  
- **Logout-all:** revokes all refresh sessions server-side  

### `/auth/me`

- `GET` current user  
- `PATCH` profile fields  
- `DELETE` soft-delete account  

### Protected routes & authorization

- Almost all business routes use `authenticate`  
- Authorization is primarily **tenant isolation** (row-level `userId` / campaign ownership), not a rich RBAC UI  
- `Role` enum exists (`user` / `admin`); admin seeding exists in `prisma/seed.js` — fine-grained admin-only route matrix: **not confirmed as a full admin console** beyond role field usage

### Tenant isolation / IDOR

Services look up resources with `userId` (or campaign.userId for ads). Cross-tenant access should yield **404**-style not found rather than leaking existence — verified by ownership patterns in growth modules and IDOR-focused tests/helpers.

---

## 11. Google OAuth

**Actual approach:** Passport **`passport-google-oauth20`** authorization-code redirect (server-side).  
**Not used:** Google Identity Services (GIS) button, ID-token-only popup login, or client-side Google SDK auth — those are **not** the implemented path.

### Configuration

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client |
| `GOOGLE_CLIENT_SECRET` | Backend secret |
| `GOOGLE_CALLBACK_URL` | Must match Google Console redirect URI exactly (default `http://localhost:5000/api/v1/auth/google/callback`) |
| `CLIENT_URL` | SPA origin for post-login redirect |

If Google env is incomplete, strategy is not registered; email auth still works.

### Flow

1. FE calls `GET {API}/auth/google?redirect=1&intent=login|register`  
2. Passport redirects to Google consent  
3. Google redirects to `GET /api/v1/auth/google/callback`  
4. `authService.handleGoogleAuth(profile, intent)`  
5. API redirects browser to `{CLIENT_URL}/auth/callback#token=...&refreshToken=...` (hash preferred to avoid Referer leakage)  
6. `AuthCallbackPage` persists tokens, calls `/auth/me`, navigates to dashboard  

### Register vs login intent

| Intent | Behavior |
|--------|----------|
| `register` | Create Google user if email is new → issue JWT. If email already exists → `already_registered` |
| `login` | Existing user (email or Google `providerId`) → JWT. Unknown email → `not_registered` (no auto-create) |

### Common failure cases

| Symptom | Likely cause |
|---------|----------------|
| `google_not_configured` | Missing Google env |
| `not_registered` | Login intent for unknown Google email |
| `already_registered` | Register intent but email exists |
| `google_failed` | Callback/page failure (FE maps errors) |
| Redirect URI mismatch | Console URI ≠ `GOOGLE_CALLBACK_URL` |
| CORS issues | `CORS_ORIGIN` / `CLIENT_URL` ≠ SPA origin |

---

## 12. Security

| Mechanism | Protects against | Where |
|-----------|------------------|-------|
| bcrypt password hashing | Offline password theft from DB dumps | Auth service |
| Strong password policy | Weak credentials | Validators + Zod |
| Short-lived access JWT | Long-lived stolen bearer tokens | JWT utils + middleware |
| Hashed refresh sessions + rotation | Refresh token reuse / DB token theft | `RefreshSession` |
| Logout-all | Stolen refresh persistence | Auth routes |
| `authenticate` on APIs | Anonymous access to tenant data | Middleware |
| express-validator | Malformed / unsafe input | Route validators |
| Helmet | Common HTTP header weaknesses | `app.js` |
| CORS allowlist | Unauthorized browser origins | `config/cors.js` |
| Rate limiting | Brute force / abuse | API + auth limiters |
| Sanitize + XSS strip | NoSQL operator injection / stored XSS vectors in input | Middleware |
| Tenant `userId` filters | **IDOR** / cross-tenant reads | Services |
| Upload MIME/size limits | Malicious oversized/non-image uploads | Multer config |
| Secrets only in backend env | Client secret leakage | No `VITE_*` for JWT/Google secret/Gemini/DB |
| Soft-deleted users blocked | Login to deleted accounts | Auth lookups |
| Path checks for AI local images | Path traversal outside upload root | `ai.service.js` `assertInsideUploads` |

Production notes: use strong unique JWT secrets (≥32 chars), HTTPS, Cloudinary for multi-instance uploads, correct OAuth redirect URIs.

---

## 13. Product Management

### Lifecycle

- **Create / edit / delete** via products API and `AddProductPage` / list / detail pages  
- Fields include name, SKU, category, price, optional **costPrice**, image, description, status (`ACTIVE` / `DRAFT` / `ARCHIVED`)  
- Creating a product typically ties inventory stock

### Images

- Upload via `POST /uploads/image` (Cloudinary or local)  
- Product stores image URL string

### Profit & margin

- Performance endpoints aggregate order lines with refund-aware net revenue  
- Cost uses historical `OrderItem.unitCost` when present, else product `costPrice` (see `productPerformance.js`)  
- Profit ≈ net revenue − COGS; margin derived safely for zero sales

### AI draft (optional Gemini)

See [§19](#19-ai-system) image-to-product flow — fills form; **does not auto-save** product.

---

## 14. Inventory Management

| Capability | Implementation |
|------------|----------------|
| Stock tracking | `Inventory.currentStock`, `reservedStock`, `reorderLevel`, `maxStockLevel` |
| Low stock | Reorder level + dashboard/store-health style signals; inventory check job when jobs enabled |
| Updates | `PATCH .../stock`, `adjust`, `restock`, `out-of-stock`, `bulk` |
| History | `StockMovement` rows |
| APIs | `/api/v1/inventory/*` |
| Models | `Inventory`, `StockMovement`, linked `Product` |

**Refunds do not restore stock** (financial-only refunds).

---

## 15. Orders & Customers

### Orders

- Statuses: `PENDING`, `PROCESSING`, `DELIVERED`, `CANCELLED`, `UNDER_REVIEW`, `REFUNDED`  
- Own items with denormalized product name/SKU/prices and optional `unitCost`  
- List/detail + status patch endpoints  
- Totals on `Order.totalAmount`; net figures use refund math

### Customers

- Belong to a user (`userId`)  
- Metrics: `totalOrders`, `totalSpent`, `averageOrderValue`, `lastOrderDate`  
- Recomputed when refunds change net spend (`refunds.service` → `recomputeCustomerStats`)  
- Purchase history via customer orders endpoint

---

## 16. Refund System

| Topic | Behavior in code |
|-------|------------------|
| Partial refund | Creates `Refund` row; reduces net revenue; order stays non-`REFUNDED` until fully covered |
| Full refund | When cumulative refunds ≥ order total → status `REFUNDED` |
| Validation | Amount > 0; cannot exceed remaining refundable; cannot refund `CANCELLED` or already `REFUNDED` |
| Profitability | `refundMath.js`: cancelled/full-refunded excluded from sales aggregates; partial reduces net revenue while retaining COGS/units for partial policy |
| Inventory | **Not restored** |
| Concurrency | Create runs inside `prisma.$transaction` to serialize checks/create/status update |

Endpoints: `POST/GET /orders/:id/refunds`, `GET /orders/refund/:refundId`.

---

## 17. Dashboard

### Backend sources (`/api/v1/dashboard/...`)

| Endpoint | Purpose |
|----------|---------|
| `GET /dashboard` | Overview aggregation |
| `GET /dashboard/kpis` | KPI cards (revenue net of refunds, orders, products, customers, related rates as implemented) |
| `GET /dashboard/revenue` | Revenue series |
| `GET /dashboard/sales` | Sales series |
| `GET /dashboard/product-insights` | Product insight widgets |
| `GET /dashboard/customer-insights` | Customer insight widgets |
| `GET /dashboard/recent-orders` | Recent orders |
| `GET /dashboard/activity` | Activity feed |
| `GET /dashboard/store-health` | Store/inventory health signals |

Date presets parsed in service (`today`, `yesterday`, `last7`, `last14`, custom `start`/`end`).

### Frontend

`DashboardPage.jsx` consumes dashboard slice/service; Navbar can open **AI Insights** panel (separate AI module).

---

## 18. Campaigns, Ads & Audiences

| Entity | Ownership | Notes |
|--------|-----------|-------|
| Campaign | `userId` | Objectives, budgets, metrics fields in DB |
| AdCreative | via `campaignId` | Review status, preview endpoint |
| Audience | `userId` | Types INTEREST / LOOKALIKE / CUSTOM |
| CampaignAudience | join | Links campaigns ↔ audiences |

APIs under `/campaigns`, `/ads`, `/audiences` (CRUD + analytics; ads review/preview; campaign duplicate).

**Important:** This is **Nexora’s own growth data model**, not a confirmed live TikTok Ads Marketing API integration.

---

## 19. AI System

### Provider & model

| Item | Value |
|------|--------|
| Provider | Google Gemini REST (`generativelanguage.googleapis.com`) |
| Default model | `gemini-2.0-flash` (`GEMINI_MODEL`) |
| API key | `GEMINI_API_KEY` (backend only) |
| Code | `backend/src/modules/ai/providers/geminiProvider.js` |
| Heuristic | `heuristicProvider.js` |

### Where AI is used

| Feature | Endpoint | Gemini | Fallback |
|---------|----------|--------|----------|
| Insights | `GET/POST /ai/insights*`, refresh | Yes if key | **Heuristic** if missing key or Gemini fails |
| Recommendations | `GET /ai/recommendations` | Via insights pipeline | Same cache/heuristic path |
| Forecasts | `GET /ai/forecasts` | Derived from insights/context | Same family |
| Campaign suggestions | `GET /ai/campaign-suggestions` | Derived | Same family |
| Product from image | `POST /ai/products/generate` | **Required** multimodal | **No heuristic** — errors if Gemini unavailable |

Insights are cached ~15 minutes in `AiInsightCache`.

### Business context

Service gathers tenant business context (products, orders, profitability, campaigns, etc.) before prompting — see `ai.service.js` / `prompts/promptBuilder.js`.

### Frontend

- **Insights:** `AIInsightsPanel.jsx` + `aiSlice` / `aiService`  
- **Product AI:** `AddProductPage.jsx` — upload image → optional `/uploads/image` → `/ai/products/generate` → populate editable fields (respect dirty fields) → user saves product separately  

### Image-to-product flow (implemented)

```
User selects image on Add Product
    → optional POST /uploads/image
    → POST /ai/products/generate (auth, multimodal Gemini)
    → normalize payload (title, description, category, highlights, keywords, suggested SKU)
    → form fields filled (no auto-create)
    → user reviews/edits
    → POST/PATCH /products to persist
```

---

## 20. TikTok Shop / Marketplace Integration

### Honest status

| Capability | Status |
|------------|--------|
| Integration list/status/connect/disconnect/sync APIs | Implemented |
| TikTok Shop connect form (name, URL, optional token) | Implemented — stores integration; metadata marks sandbox |
| TikTok sync progress messages | **Sandbox** simulated progress (Partner API TODO in providers) |
| Shopify connect | **Blocked** with “coming soon” |
| WooCommerce connect | **Blocked** with “coming soon” |
| Production TikTok Shop Partner OAuth / live catalog sync | **Not implemented** |

### Connect TikTok Shop (current behavior)

1. User opens Connect modal (Sidebar, Settings, or onboarding prompt)  
2. Submits store URL + name (+ optional token)  
3. `POST /integrations/connect` with platform `TikTok Shop`  
4. DB row in `StoreIntegration` (`TIKTOK_SHOP`)  
5. Sync endpoint runs **sandbox** adapter (fake staged progress), not Partner API pulls  

### Unconnected users — connection prompt

| Piece | Path |
|-------|------|
| Prompt UI | `src/components/modals/TikTokConnectPrompt.jsx` |
| Dismiss helper | `src/utils/tiktokConnectPrompt.js` |
| Mounted in | `DashboardLayout.jsx` |
| State | `StoreConnectionContext` (`getStoreForPlatform('TikTok Shop')`, `loadStatus`, `openConnectModal`) |

**Shows when:** authenticated + integrations finished loading + no TikTok Shop store + not dismissed.  
**Does not show every navigation** if dismissed.  
**Maybe Later:** writes localStorage dismiss until timestamp (**7 days**, keyed by user id).  
**Connect CTA:** dismisses prompt and opens existing `ConnectStoreModal` for TikTok Shop.  
**Connected users:** prompt hidden.

---

## 21. Default Profile Avatar

| Item | Detail |
|------|--------|
| Default asset | `src/assets/default-avatar.svg` |
| Component | `src/components/ui/UserAvatar.jsx` |
| URL helper | `src/utils/mediaUrl.js` → `resolveMediaUrl` |
| Used in | `Navbar.jsx`, `ProfilePage.jsx` |

### When default appears

- `avatar` / `profilePicture` / related aliases missing or empty  
- Resolved URL fails to load (`img onError`)  

### When uploaded photo shows

- User has a valid `user.avatar` (or override `src`) that loads successfully  
- Upload via `uploadsService.uploadAvatar` → `POST /uploads/avatar` → refresh `/auth/me`  
- Remove via `DELETE /uploads/avatar`  

Upload functionality is unchanged; `UserAvatar` is display-only fallback logic.

---

## 22. API Documentation

Base prefix: **`/api/v1`** (configurable via `API_PREFIX`).  
Auth header: `Authorization: Bearer <accessToken>` unless noted.

### Auth

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/register` | No | Create local account (no JWT) |
| POST | `/auth/login` | No | Issue access + refresh |
| POST | `/auth/refresh` | No (body refresh) | Rotate tokens |
| GET | `/auth/google` | No | Start Google OAuth |
| GET | `/auth/google/callback` | No | OAuth callback |
| GET | `/auth/me` | Yes | Current user |
| PATCH | `/auth/me` | Yes | Update profile |
| DELETE | `/auth/me` | Yes | Soft-delete account |
| POST | `/auth/change-password` | Yes | Change password |
| POST | `/auth/logout` | Yes | Client logout acknowledge |
| POST | `/auth/logout-all` | Yes | Revoke refresh sessions |

### Health

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/health` | No | Health check |
| GET | `/` (app root) | No | API envelope |

### Products

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/products` | Yes | List |
| GET | `/products/rankings` | Yes | Rankings |
| GET | `/products/performance` | Yes | Performance list |
| POST | `/products` | Yes | Create |
| GET | `/products/:id` | Yes | Detail |
| GET | `/products/:id/performance` | Yes | Product performance |
| PATCH | `/products/:id` | Yes | Update |
| DELETE | `/products/:id` | Yes | Delete |

### Inventory

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/inventory` | Yes | List |
| GET | `/inventory/analytics` | Yes | Analytics |
| GET | `/inventory/dashboard` | Yes | Dashboard widgets |
| POST | `/inventory/bulk` | Yes | Bulk update |
| GET | `/inventory/:id` | Yes | Detail |
| GET | `/inventory/:id/history` | Yes | Movements |
| PATCH | `/inventory/:id/stock` | Yes | Set stock |
| POST | `/inventory/:id/adjust` | Yes | Adjust |
| POST | `/inventory/:id/restock` | Yes | Restock |
| POST | `/inventory/:id/out-of-stock` | Yes | Mark OOS |

### Customers

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/customers` | Yes | List |
| GET | `/customers/analytics` | Yes | Analytics |
| GET | `/customers/dashboard` | Yes | Dashboard |
| POST | `/customers` | Yes | Create |
| GET | `/customers/:id` | Yes | Detail |
| GET | `/customers/:id/orders` | Yes | Purchase history |
| PATCH | `/customers/:id` | Yes | Update |
| DELETE | `/customers/:id` | Yes | Delete |

### Orders & refunds

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/orders` | Yes | List |
| GET | `/orders/refund/:refundId` | Yes | Refund by id |
| GET | `/orders/:id` | Yes | Detail |
| PATCH | `/orders/:id/status` | Yes | Update status |
| GET | `/orders/:id/refunds` | Yes | List refunds |
| POST | `/orders/:id/refunds` | Yes | Create refund |

### Dashboard

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/dashboard` | Yes | Overview |
| GET | `/dashboard/kpis` | Yes | KPIs |
| GET | `/dashboard/revenue` | Yes | Revenue |
| GET | `/dashboard/sales` | Yes | Sales |
| GET | `/dashboard/product-insights` | Yes | Product insights |
| GET | `/dashboard/customer-insights` | Yes | Customer insights |
| GET | `/dashboard/recent-orders` | Yes | Recent orders |
| GET | `/dashboard/activity` | Yes | Activity |
| GET | `/dashboard/store-health` | Yes | Store health |

### Campaigns / Ads / Audiences

Mounted at `/campaigns`, `/ads`, `/audiences` with list/create/analytics/get/patch/delete patterns; campaigns also `POST /:id/duplicate`; ads also `GET /:id/preview`, `PATCH /:id/review`.

### AI

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/ai/insights` | Yes | Get insights (cache) |
| POST | `/ai/insights/generate` | Yes | Generate |
| POST | `/ai/insights/refresh` | Yes | Refresh |
| GET | `/ai/recommendations` | Yes | Recommendations |
| GET | `/ai/forecasts` | Yes | Forecasts |
| GET | `/ai/campaign-suggestions` | Yes | Campaign suggestions |
| POST | `/ai/products/generate` | Yes | Image → product draft |

### Integrations

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/integrations` | Yes | List |
| GET | `/integrations/status` | Yes | Status |
| POST | `/integrations/connect` | Yes | Connect (TikTok allowed; others may block) |
| GET/PATCH/DELETE | `/integrations/:id` | Yes | CRUD-ish |
| POST | `/integrations/:id/sync` | Yes | Sync |
| GET | `/integrations/:id/sync` | Yes | Sync status |
| GET | `/integrations/:id/sync/logs` | Yes | Logs |

### Settings / notifications / activity / uploads

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/settings` | Yes | Settings |
| PATCH | `/settings/store` | Yes | Store prefs |
| PATCH | `/settings/notifications` | Yes | Notification prefs |
| GET | `/settings/billing` | Yes | Placeholder billing payload |
| GET | `/settings/security` | Yes | Security settings payload |
| GET | `/notifications` | Yes | List |
| GET | `/notifications/unread-count` | Yes | Unread |
| PATCH | `/notifications/:id/read` | Yes | Mark read |
| POST | `/notifications/read-all` | Yes | Mark all |
| DELETE | `/notifications/:id` | Yes | Delete |
| GET | `/activity` | Yes | Activity log |
| POST | `/uploads/avatar` | Yes | Avatar upload |
| DELETE | `/uploads/avatar` | Yes | Remove avatar |
| POST | `/uploads/image` | Yes | Generic image upload |

---

## 23. Environment Variables

### Frontend

| Variable | Required | Secret? | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | Yes (for non-default API) | No | Axios base URL (default `http://localhost:5000/api/v1`) |

### Backend (from `.env.example` + code usage)

| Variable | Required | Secret? | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | Yes | PostgreSQL connection |
| `JWT_SECRET` / `JWT_ACCESS_SECRET` | Yes (prod) | Yes | Access token signing |
| `JWT_REFRESH_SECRET` | Yes (prod) | Yes | Refresh signing |
| `JWT_EXPIRES_IN` / `JWT_ACCESS_EXPIRES_IN` | Optional | No | Access TTL (default ~15m) |
| `JWT_REFRESH_EXPIRES_IN` | Optional | No | Refresh TTL (default ~7d) |
| `PORT` | Optional | No | Server port (default 5000) |
| `API_PREFIX` | Optional | No | Default `/api/v1` |
| `NODE_ENV` | Optional | No | Environment mode |
| `CLIENT_URL` | Yes for OAuth/CORS | No | SPA origin |
| `CORS_ORIGIN` | Yes in prod | No | Allowed origins |
| `GOOGLE_CLIENT_ID` | For Google auth | Semi-public | OAuth client |
| `GOOGLE_CLIENT_SECRET` | For Google auth | Yes | OAuth secret |
| `GOOGLE_CALLBACK_URL` | For Google auth | No | Redirect URI |
| `GEMINI_API_KEY` | For Gemini | Yes | AI provider |
| `GEMINI_MODEL` | Optional | No | Default `gemini-2.0-flash` |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Optional | Yes (key/secret) | Cloud uploads |
| `UPLOAD_DIR` | Optional | No | Local upload folder |
| `UPLOAD_MAX_FILE_SIZE_MB` | Optional | No | Upload size cap |
| `RATE_LIMIT_*` | Optional | No | Rate limit knobs |
| `JOBS_ENABLED` | Optional | No | Background jobs |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional (seed) | Yes (password) | Seed admin overrides |

**Do not place** JWT, Google client secret, Gemini, Cloudinary, or DB secrets in `VITE_*` variables.

Shopify/TikTok Partner / Stripe keys: **not read by current application code**.

---

## 24. Testing

### Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| Root | `npm run lint` | Oxlint |
| Root | `npm run build` | Vite production build |
| Root | `npm run dev` | Vite dev server |
| Backend | `npm test` | `node --test tests/**/*.test.js` |
| Backend | `npx prisma validate` / `generate` / `migrate` | Schema tooling |

### Backend automated tests

Framework: **Node.js built-in test runner** (`node:test`).

Test files under `backend/tests/` (project suite — not `node_modules`):

| File | Focus |
|------|--------|
| `auth.validation.test.js` | Auth validators |
| `auth.refresh.validation.test.js` | Refresh validators |
| `auth.google.intent.test.js` | OAuth intent resolution |
| `password.policy.test.js` | Password strength rules |
| `http.smoke.test.js` | Root/health/401 smoke |
| `health.test.js` | ApiError, helpers, sanitize |
| `refund.profitability.test.js` | Refund/net math |
| `productPerformance.test.js` | Aggregation helpers |
| `productAi.test.js` | Product AI normalize helpers |
| `growth.ownership.test.js` | Growth service ownership exports |
| `settings.validation.test.js` | Settings validators |

**Verifiable count:** **45** `test(...)` cases in `backend/tests/*.test.js` (count the suite files only).

### Frontend tests

**None found** — no Vitest/Jest/Playwright config or `*.test.*` under `src/`. Validation is lint + build + manual QA.

### Prisma

Validate/generate/migrate via Prisma CLI scripts in backend `package.json`.

---

## 25. Deployment

### Frontend

| Item | Detail |
|------|--------|
| Build | `npm run build` → `dist/` |
| Hosting pattern | Static SPA (e.g. **Vercel**) |
| Config | `vercel.json` SPA rewrite: all routes → `/index.html` |
| Env | `VITE_API_URL` pointing at public API `/api/v1` |

### Backend

| Item | Detail |
|------|--------|
| Start | `npm start` → `node src/server.js` |
| Railway config | `backend/railway.json` — NIXPACKS; `npx prisma migrate deploy && npm start`; healthcheck `/api/v1/health` |
| DB | Managed PostgreSQL + `DATABASE_URL` |
| Uploads | Prefer Cloudinary in multi-instance hosts |

### Production checklist

1. Strong JWT secrets  
2. Migrate + generate Prisma  
3. `CLIENT_URL` + `CORS_ORIGIN` = real SPA origin  
4. Google Console redirect = API callback URL  
5. Optional Gemini / Cloudinary  
6. Do not expose backend secrets to Vite  

---

## 26. Error Handling

| Layer | Behavior |
|-------|----------|
| Backend | `ApiError` codes/status; `errorHandler` formats responses; validators return 400-class errors |
| Frontend API | Axios helpers map messages; slices store `error` |
| Auth failures | 401; refresh interceptor; login redirects |
| Google failures | Redirect query/hash errors handled on auth pages / callback |
| AI insights failure | Falls back to heuristic provider when Gemini fails/missing |
| AI product generate failure | Surfaces error — **no** heuristic product invent |
| Uploads | Cloudinary fail → local disk fallback (service); validation rejects bad MIME/size |
| Integrations | Shopify/WooCommerce connect rejected with clear “coming soon” messages |

---

## 27. Known Limitations

1. **TikTok Shop Partner API** not production-wired (sandbox sync).  
2. **Shopify / WooCommerce** connect blocked as coming soon.  
3. **Stripe / real billing** not implemented (billing endpoint is placeholder-shaped).  
4. **Email delivery** (verification, password reset mail) not implemented; forgot/reset routes redirect to login.  
5. **Physical returns / stock restore on refund** not implemented.  
6. **Gemini dependency** for product-from-image; quota/rate limits can block live AI fills.  
7. **Cloudinary** optional — local uploads unsuitable for multi-instance without shared storage.  
8. **Frontend automated tests** absent.  
9. **Email registration** does not auto-issue JWT (must login).  
10. **Logout** does not revoke refresh tokens (use logout-all).  
11. **Campaign/ads metrics** are app-managed — not confirmed as live TikTok Ads API sync.  
12. **Product.userId** optional in schema — historical null rows possible; prefer always setting ownership on create.

---

## 28. Future Roadmap

Explicitly **future / not production today**:

- TikTok Shop Partner OAuth + live catalog/order sync  
- TikTok Ads Marketing API sync  
- Shopify / WooCommerce production connectors  
- Physical returns + inventory restore  
- Stripe billing & invoices  
- Transactional email (verify / reset)  
- Richer multi-store / team RBAC  
- Broader FE automated test suite  
- Advanced generative creative tools beyond current Gemini usage  

---

## 29. Important File/Folder Map

```
Tiktok-market-dash/
├── package.json                 # Frontend scripts/deps
├── vite.config.js
├── vercel.json                  # SPA rewrites
├── PROJECT_DOCUMENTATION.md     # This file
├── README.md
├── src/
│   ├── main.jsx / App.jsx
│   ├── routes/                  # AppRouter, guards
│   ├── pages/                   # Feature pages
│   ├── components/              # Nav, modals, UI, panels
│   ├── features/                # Redux slices
│   ├── services/                # API clients
│   ├── contexts/                # Theme, StoreConnection
│   ├── layouts/
│   ├── hooks/
│   ├── constants/
│   ├── lib/axios.js
│   ├── utils/                   # mediaUrl, tiktokConnectPrompt, …
│   └── assets/default-avatar.svg
└── backend/
    ├── package.json
    ├── railway.json
    ├── prisma/schema.prisma
    ├── prisma/seed.js
    ├── tests/                   # 45 automated tests
    └── src/
        ├── server.js / app.js
        ├── config/              # env, cors, passport
        ├── middlewares/
        ├── modules/             # auth, products, orders, …
        ├── jobs/
        ├── utils/               # jwt, refundMath, …
        └── services/cloudinary.service.js
```

---

## 30. Important Technical Flows

### A. Login flow

```
Register (optional) → Login form
  → POST /auth/login
  → access + refresh tokens
  → store nexora_auth
  → ProtectedRoute allows /dashboard
```

### B. Google OAuth flow

```
FE → GET /auth/google?intent=login|register
  → Google consent
  → GET /auth/google/callback
  → handleGoogleAuth
  → redirect SPA /auth/callback#token&refreshToken
  → getMe → dashboard
```

### C. JWT refresh flow

```
API 401 or scheduled refresh
  → POST /auth/refresh { refreshToken }
  → verify + rotate RefreshSession
  → new token pair → retry request
```

### D. Product creation flow

```
Add Product page → fill fields (manual and/or AI draft)
  → optional image upload
  → POST /products
  → inventory row associated
  → list/detail reflect new product
```

### E. Refund flow

```
Order detail → POST /orders/:id/refunds { amount, reason }
  → transaction: validate remaining → create Refund
  → if full: status REFUNDED
  → recompute customer stats
  → dashboard/product nets use refundMath
```

### F. AI insight flow

```
Open AI Insights panel
  → GET/POST /ai/insights*
  → gatherBusinessContext
  → Gemini if key else heuristic
  → cache AiInsightCache (~15m)
  → render recommendations/forecasts derived endpoints as used by UI
```

### G. AI image-to-product flow

```
Upload image → (optional) /uploads/image
  → POST /ai/products/generate
  → Gemini multimodal
  → editable form fields
  → user saves via products API
```

### H. TikTok Shop connection flow

```
Prompt or Settings/Sidebar → ConnectStoreModal
  → POST /integrations/connect (TikTok Shop)
  → StoreIntegration row (sandbox metadata)
  → sync = sandbox progress adapter
```

### I. Default avatar fallback flow

```
UserAvatar resolves media URL
  → if missing/empty → default-avatar.svg
  → if img error → default-avatar.svg
  → else show uploaded avatar
```

---

## 31. Project Evaluation & Viva Preparation

Below are **30 likely evaluator questions** with short + technical answers grounded in this codebase.

### 1. Why React?

**Short:** Component-based SPA for a complex interactive dashboard.  
**Technical:** React 19 + Vite delivers routed pages, shared layouts, and Redux-connected views without full reloads.

### 2. Why Express?

**Short:** Lightweight Node framework for a modular REST API.  
**Technical:** Express 5 mounts versioned routers per domain (`/products`, `/orders`, …) with middleware for auth, validation, and errors.

### 3. Why PostgreSQL?

**Short:** Relational integrity for orders, refunds, and tenants.  
**Technical:** Foreign keys, uniques (`userId+email`), enums, and decimal money fields fit seller data better than a document-only store.

### 4. Why Prisma?

**Short:** Type-safe ORM over SQL with migrations.  
**Technical:** `schema.prisma` defines models; Prisma Client is used in services; adapter-pg connects to PostgreSQL.

### 5. Why JWT?

**Short:** Stateless API authentication for the SPA.  
**Technical:** Access tokens authorize Bearer requests; refresh tokens enable renewal without storing passwords client-side.

### 6. Access vs refresh token?

**Short:** Access is short-lived; refresh is longer and rotatable.  
**Technical:** Defaults ~15m access / ~7d refresh; refresh hashes stored in `RefreshSession` and rotated on use.

### 7. Why bcrypt?

**Short:** Safe password hashing.  
**Technical:** Cost factor 12; stores hash only; compare on login — resists rainbow tables vs plaintext/fast hashes.

### 8. How does Google OAuth work here?

**Short:** Server-side Passport authorization-code redirect.  
**Technical:** `/auth/google` → Google → `/auth/google/callback` → JWT hash redirect to `/auth/callback` — not GIS popup ID-token auth.

### 9. How is tenant isolation done?

**Short:** Almost every business row is owned by `userId`.  
**Technical:** Services query with the authenticated user’s id; cross-tenant IDs return not found.

### 10. How is IDOR prevented?

**Short:** Never trust client IDs alone — always scope by owner.  
**Technical:** Order/customer/campaign lookups include `userId`; ads resolve via campaign ownership.

### 11. How does AI work?

**Short:** Backend gathers business context and calls Gemini (or heuristics).  
**Technical:** `ai.service` + providers; insights cached; FE only calls Nexora API, never Gemini directly.

### 12. Why Gemini?

**Short:** Multimodal + text generation suitable for insights and product image understanding.  
**Technical:** Configured via `GEMINI_API_KEY` / `GEMINI_MODEL` (`gemini-2.0-flash` default).

### 13. What if Gemini fails?

**Short:** Insights fall back to heuristics; product-from-image errors.  
**Technical:** `heuristicProvider` for insights path; `POST /ai/products/generate` requires Gemini.

### 14. How is profitability calculated?

**Short:** Net revenue after refunds minus COGS.  
**Technical:** `refundMath` + `productPerformance.aggregateItems` using line costs and refund sums.

### 15. How do refunds affect revenue?

**Short:** They reduce net revenue; full refunds exclude orders from sales.  
**Technical:** Partial keeps units/COGS per policy; cancelled/REFUNDED excluded; dashboard KPIs use net helpers.

### 16. How does FE talk to BE?

**Short:** Axios REST to `/api/v1`.  
**Technical:** `VITE_API_URL`; private client attaches JWT and refreshes on 401.

### 17. How does API authentication work?

**Short:** Bearer access JWT middleware.  
**Technical:** `authenticate` verifies signature/expiry and attaches `req.user`.

### 18. Important DB relationships?

**Short:** User owns customers/orders/campaigns; orders have items and refunds; products have inventory.  
**Technical:** See Prisma relations in §9; `CampaignAudience` joins campaigns and audiences.

### 19. How does TikTok integration work today?

**Short:** Sandbox connect + fake sync — not Partner production.  
**Technical:** `StoreIntegration` + providers sandbox adapter; Shopify/WooCommerce connect blocked.

### 20. What is incomplete?

**Short:** Live Partner sync, Stripe, email reset, physical returns, FE unit tests.  
**Technical:** Documented in §27–§28.

### 21. Security highlights?

**Short:** Hashing, JWT, rate limits, validation, tenant filters, helmet/CORS.  
**Technical:** See §12 table.

### 22. Deployment architecture?

**Short:** SPA on Vercel-like host; API on Railway-like host; managed Postgres.  
**Technical:** `vercel.json` rewrites; `railway.json` migrate+start; env separation FE/BE.

### 23. Default avatar?

**Short:** Shared SVG when photo missing or broken.  
**Technical:** `UserAvatar` + `default-avatar.svg` + `onError`.

### 24. TikTok connect popup?

**Short:** Soft onboarding if unconnected; dismissible 7 days.  
**Technical:** `TikTokConnectPrompt` + localStorage helper; CTA opens `ConnectStoreModal`.

### 25. Does register log you in?

**Short:** Email register does **not** issue tokens.  
**Technical:** `auth.service.register` returns `{ user }` only; Google register **does** issue session tokens.

### 26. Password rules?

**Short:** 8+ with upper, lower, digit, special.  
**Technical:** Shared `passwordPolicy.js` + Zod on FE.

### 27. Are campaigns live TikTok ads?

**Short:** No — stored in Nexora DB.  
**Technical:** CRUD/analytics modules; not Marketing API production sync.

### 28. Cloudinary required?

**Short:** No locally; recommended in production multi-instance.  
**Technical:** Upload service falls back to `UPLOAD_DIR`.

### 29. How are refresh tokens stored?

**Short:** Only a hash in the database.  
**Technical:** `RefreshSession.tokenHash`; raw token only on client.

### 30. Strongest academic talking points?

**Short:** End-to-end SaaS with auth, tenancy, net profitability, AI with fallbacks, honest sandbox integrations.  
**Technical:** Cite modules: auth JWT+OAuth, refundMath, ai providers, integrations sandbox, UserAvatar/prompt UX polish.

---

## 32. Final Project Summary

### What Nexora successfully demonstrates

- A coherent **seller operations + growth** dashboard SPA  
- Production-shaped **auth** (email + Google OAuth authorization-code + JWT refresh sessions)  
- **Tenant-scoped** commerce data (products, inventory, customers, orders, refunds)  
- **Net profitability** thinking wired through refunds and performance helpers  
- Embedded **AI insights** (Gemini + heuristic) and **image-to-product drafts** (Gemini)  
- Clear UX for **profile avatars** and **TikTok connect onboarding** without overselling Partner APIs  

### Strongest technical features

1. JWT access/refresh + Google Passport flow  
2. Refund-aware financial calculations  
3. Modular Express + Prisma architecture  
4. AI context gathering with graceful insights fallback  
5. Honest sandbox marketplace connection model  

### Current limitations

Partner marketplace/ads production APIs, Stripe billing, email reset, physical returns, and frontend automated tests remain incomplete or out of scope.

### Overall maturity

**Release Candidate — READY WITH WARNINGS:** core academic/demo product is solid; external Partner integrations and some SaaS peripherals are optional, sandbox, or future work.

---

*End of Nexora complete project documentation. Generated from repository inspection on 2026-08-09. Prefer the source code if this file ever drifts.*
