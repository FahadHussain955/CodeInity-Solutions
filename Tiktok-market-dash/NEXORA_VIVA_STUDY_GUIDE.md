# NEXORA — VIVA & PROJECT STUDY GUIDE

**Purpose:** Easy revision before your university evaluation / viva.  
**Not a replacement for** [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) (that file is the full technical reference).

**How to use this guide:** Read sections out loud. Memorize the short answers. Use the “better answers” when the evaluator asks you to explain more.

---

## 1. Project in 30 Seconds

### What you can say to the evaluator

Nexora is a full-stack web application for online marketplace sellers. Sellers use it to manage products, stock, customers, and orders in one place. It also shows **net profitability after refunds**, not only gross sales. What makes it different is that it combines operations, growth tools (campaigns, ads, audiences), and AI help in one dashboard. AI is used for business insights and for generating product details from a product image.

### One-line answer

**Nexora is a seller dashboard that helps marketplace sellers manage products, orders, and profits, with AI insights and secure login.**

---

## 2. Project in 2 Minutes

*(Speak this naturally — don’t read like a textbook.)*

“So Nexora is basically a seller management system. First the seller registers or logs in — with email/password or Google. After login they land on the dashboard, where they can see KPIs like revenue, orders, and store health.

From there they can add products with price and cost price, manage inventory and low stock, and see customers and their orders. If a customer gets a refund, the system records it and updates net revenue and profit, so the numbers stay honest.

There’s also a growth side — campaigns, ads, and audiences — stored and managed inside Nexora. Then there’s AI: the seller can open AI insights for recommendations, and on Add Product they can upload an image and let Gemini draft the product fields, which they edit before saving.

Finally, if they haven’t connected a TikTok Shop yet, we show a soft popup encouraging them to connect. Right now that connection is a **sandbox/demo** flow — not a live TikTok Partner production sync. That’s the honest version of the project.”

---

## 3. Problem Statement

### What problem were we solving?

**Simple answer**  
Sellers had to jump between many tools for products, stock, orders, and ads. It was hard to see real profit after refunds.

**Slightly detailed answer**  
Marketplace sellers need one place to run day-to-day work: catalog, inventory, customers, orders, and refunds. Without that, they may look at “sales” numbers that ignore refunds and product cost. Nexora centralizes that data under one login and calculates clearer profit. It also adds AI help and a path toward shop connection (sandbox today).

---

## 4. Main Features

| Feature | What it does | Why we need it |
|---------|--------------|----------------|
| **Authentication** | Lets users register, log in, and log out safely | Protects each seller’s private data |
| **Google Login** | Sign in / register with a Google account | Faster login without remembering another password |
| **Dashboard** | Shows KPIs, charts, recent orders, activity | Gives a quick health check of the business |
| **Products** | Create, edit, delete products with price and cost | Catalog is the core of selling |
| **Inventory** | Track stock, restock, low-stock levels | Prevents selling items you don’t have |
| **Customers** | Store buyers and their purchase stats | Helps understand who buys from you |
| **Orders** | List and manage order status and items | Tracks what was sold |
| **Refunds** | Record partial or full money returns | Keeps money numbers truthful |
| **Profitability** | Net revenue minus cost of goods | Shows if products actually make money |
| **Campaigns** | Create/manage marketing campaigns in Nexora | Organizes growth experiments |
| **Ads** | Manage ad creatives linked to campaigns | Stores creatives and review status in-app |
| **Audiences** | Save audience groups for campaigns | Targets who a campaign is for |
| **AI Insights** | Gemini (or fallback) business tips | Helps sellers decide what to improve |
| **AI Product Generation** | Image → draft product fields | Speeds up catalog creation |
| **Profile Avatar** | Upload photo or show default avatar | Clear profile UI even with no photo |
| **TikTok Shop Connection** | Connect form + onboarding prompt (sandbox) | Demonstrates shop-linking UX; not Partner production |

---

## 5. Technology Stack — Easy Version

**Note:** This project’s frontend is **JavaScript (JSX)**, not TypeScript.

### React

**What is it?**  
A frontend JavaScript library for building the user interface.

**Why did we use it?**  
Nexora has many screens and reusable pieces (tables, forms, sidebars). React fits interactive dashboards well.

### Vite

**What is it?**  
A modern tool that runs the React app in development and builds it for production.

**Why did we use it?**  
It starts fast and builds the SPA (Single Page Application — one app that changes pages without full browser reloads) quickly.

### JavaScript

**What is it?**  
The programming language used on both the frontend and backend in this project.

**Why did we use it?**  
One language across the stack makes the full-stack project easier to build and explain.

### Node.js

**What is it?**  
A runtime that lets JavaScript run on the server (not only in the browser).

**Why did we use it?**  
So we can build the API backend in JavaScript.

### Express

**What is it?**  
A Node.js web framework for creating REST APIs (APIs that use HTTP methods like GET/POST).

**Why did we use it?**  
It lets us organize routes (URLs), middleware (code that runs before the main logic), and modules cleanly.

### PostgreSQL

**What is it?**  
A relational database — data stored in tables with relationships.

**Why did we use it?**  
Orders, refunds, and users need clear relationships and trustworthy money fields.

### Prisma

**What is it?**  
An ORM (Object-Relational Mapper) — a tool that lets us talk to the database using JavaScript instead of writing every SQL query by hand.

**Why did we use it?**  
Safer, clearer database access and a schema file that documents our models.

### JWT

**What is it?**  
JSON Web Token — a signed digital pass that proves “this request is from a logged-in user.”

**Why did we use it?**  
The SPA needs a standard way to authenticate API calls without storing passwords on every request.

### bcrypt

**What is it?**  
A library that hashes passwords (turns them into a one-way scramble) before saving.

**Why did we use it?**  
So even if the database leaks, attackers don’t get real passwords.

### Google OAuth / Passport

**What is it?**  
OAuth is “login with Google” without Nexora seeing the Google password. Passport is the Node library that runs that Google login flow.

**Why did we use it?**  
Convenience and fewer weak passwords; users trust Google login.

### Gemini

**What is it?**  
Google’s AI model used by the backend for insights and image understanding.

**Why did we use it?**  
It can read product images and generate useful text for sellers.

### Axios

**What is it?**  
A frontend HTTP client for calling the backend API.

**Why did we use it?**  
It sends requests, attaches the access token, and helps refresh sessions when tokens expire.

### Vercel

**What is it?**  
A common host for frontend SPAs. This repo includes `vercel.json` for SPA routing.

**Why did we use it?**  
Easy static hosting for the built React app (rewrites all paths to `index.html`).

### Railway (backend config present)

**What is it?**  
A host for backend apps. This repo has `backend/railway.json` (migrate DB, start API, health check).

**Why did we use it?**  
Fits deploying the Express API + running Prisma migrations on start.

### Cloudinary

**What is it?**  
An optional cloud service for storing uploaded images.

**Why did we use it?**  
In production / multi-server setups, local disk uploads are fragile; Cloudinary stores images in the cloud. Locally, Nexora can fall back to a local `uploads` folder if Cloudinary is not configured.

---

## 6. System Architecture — Very Easy

```
User (browser)
    ↓
React Frontend
    ↓
REST API (/api/v1)
    ↓
Express Backend
    ↓
Prisma
    ↓
PostgreSQL Database
```

| Layer | Simple explanation |
|-------|--------------------|
| **User** | Seller opens the website |
| **React Frontend** | Screens and buttons |
| **REST API** | Agreed URLs like `/products` that return/send JSON data |
| **Express Backend** | Business rules, security, AI calls |
| **Prisma** | Translates app actions into database operations |
| **PostgreSQL** | Permanent storage |

### Viva question: Why don’t we connect React directly to PostgreSQL?

**Simple answer:**  
Because the database password and business rules would be exposed in the browser. Anyone could steal data.

**Slightly better:**  
The frontend is public. Secrets and validation must live on the backend. React talks only to our API; the API talks to PostgreSQL.

---

## 7. Frontend

### What React does

**Simple:** Builds the screens you see.  
**Technical:** Components render UI; state updates when data changes.

### What Vite does

**Simple:** Runs and builds the React app.  
**Technical:** Dev server + production bundle into `dist/`.

### What components are

**Simple:** Reusable UI pieces (button areas, navbar, avatar).  
**Example:** `UserAvatar`, `Navbar`, modals.

### What pages are

**Simple:** Full screens for a feature (Login, Dashboard, Products).  
**Path idea:** files under `src/pages/`.

### How routing works

**Simple:** The URL chooses which page to show.  
**Technical:** React Router maps `/dashboard/products` to the products page; protected routes require login.

### How authentication state works

**Simple:** After login, Nexora remembers you’re logged in.  
**Technical:** Redux auth slice + `localStorage` key `nexora_auth` stores tokens/user; ProtectedRoute blocks guests.

### How frontend calls backend APIs

**Simple:** Axios sends HTTP requests to `VITE_API_URL`.  
**Technical:** Private client adds `Authorization: Bearer <accessToken>`; on 401 it tries refresh.

### Errors / loading

**Simple:** Pages show loading and error messages when requests fail.  
**Technical:** Slice `status`/`error` and page notices; lazy routes use Suspense.

---

## 8. Backend

### What Node.js does

Runs JavaScript on the server.

### What Express does

Defines the API and plugs in middleware.

### What routes are

URL + method mappings, e.g. `POST /api/v1/products`.

### What middleware is

Code that runs before the controller — e.g. check JWT, validate body, rate limit.

### What services are

Where business logic lives (create product, compute refunds, call Gemini).

### How a request reaches the database

Route → authenticate → validate → service → Prisma → PostgreSQL.

### How errors are handled

Services throw structured errors (`ApiError`); a central error handler returns a clean JSON response.

### Example: Create Product

1. User clicks save on Add Product.  
2. Frontend sends `POST /api/v1/products` with product data + access token.  
3. Backend authenticates the user.  
4. Validators check the data.  
5. Products service processes it.  
6. Prisma writes to PostgreSQL.  
7. Backend returns the created product.  
8. Frontend updates the UI / navigates.

---

## 9. Database

### PostgreSQL (simple)

A serious table-based database. Good for related business data.

### Prisma (simple)

Our schema + client for talking to PostgreSQL safely from Node.

### Important models (what each is for)

| Model | Used for |
|-------|----------|
| **User** | Seller account (email, password hash, avatar, role) |
| **Product** | Items for sale (name, SKU, price, cost, image) |
| **Inventory** | Stock levels for a product |
| **Customer** | Buyer profiles belonging to a seller |
| **Order** | A sale to a customer (status, total) |
| **OrderItem** | Lines inside an order (qty, unit price, optional unit cost) |
| **Refund** | Money returned on an order |
| **Campaign** | Marketing campaign owned by a user |
| **AdCreative** (Ads) | Ad creative belonging to a campaign |
| **Audience** | Audience definition owned by a user |
| **StoreIntegration** | Connected shop record (e.g. TikTok Shop sandbox) |
| **RefreshSession** | Hashed refresh tokens for login sessions |

### Important relationships (from Prisma)

- User → Products, Customers, Orders, Campaigns, Audiences, Refunds, StoreIntegrations  
- Product → Inventory (one-to-one style link)  
- Order → OrderItems  
- Order → Refunds  
- Customer → Orders  
- Campaign → AdCreatives  
- Campaign ↔ Audience through **CampaignAudience**

---

## 10. Authentication — Very Important

### What is authentication?

**Simple:** Proving who you are before seeing private data.

### What happens when a user logs in? (email/password)

1. User enters email and password.  
2. Frontend sends `POST /api/v1/auth/login`.  
3. Backend finds the user by email.  
4. Password is checked with **bcrypt** (compare typed password to stored hash).  
5. Backend creates an **access token** and a **refresh token** (JWTs).  
6. Refresh token is stored in the DB as a **hash** in `RefreshSession`.  
7. Frontend saves the session in `nexora_auth` and uses the access token on protected APIs.

**Important detail:** Email **register** creates the account but **does not** log you in automatically — you must login after. Google register/login **does** create a session with tokens.

---

## 11. JWT — Explain Like You’re in a Viva

### What is JWT?

A small signed string that says “user X is logged in,” without sending the password every time.

### Why did we use JWT?

Because the React app and API are separate; tokens are a clean way to authorize API calls.

### What is an access token?

A short-lived pass for API requests. Default lifetime: about **15 minutes**.

### What is a refresh token?

A longer-lived token used to get a new access token. Default lifetime: about **7 days**. Only a hash is stored in the database.

### Why are there two tokens?

If someone steals a short access token, damage is limited. The refresh token renews access without forcing login every 15 minutes — and can be revoked (especially with logout-all).

### Easy accurate analogy

- **Access token** = temporary building badge (expires soon).  
- **Refresh token** = ability to get a new badge at the desk (longer, tracked/revocable).

---

## 12. bcrypt

### What is bcrypt?

A password hashing tool. Hashing means one-way scrambling.

### Why don’t we store passwords directly?

If the database leaks, plaintext passwords would let attackers enter every account.

### What happens during login?

Nexora hashes/compares: it runs bcrypt compare between the typed password and the stored hash. If they match, login succeeds.

*(Speak for ~20 seconds.)*

---

## 13. Google OAuth

### What is OAuth?

A standard way to say: “Let Google confirm who I am,” without sharing your Google password with Nexora.

### Why Google login?

Faster onboarding and fewer forgotten passwords.

### What happens on “Continue with Google”?

1. Browser goes to Nexora’s backend Google start URL.  
2. Google asks the user to approve.  
3. Google redirects to Nexora’s **callback** URL.  
4. Passport strategy reads the Google profile (email, id, etc.).  
5. Nexora finds or creates the user (depending on login vs register intent).  
6. Nexora issues JWT tokens and redirects to the frontend `/auth/callback`.  
7. Frontend saves tokens and opens the dashboard.

### Does Google send the user’s password to Nexora?

**No.** Nexora never receives the Google password.

### Actual flow (authorization code via Passport — not a GIS popup ID-token flow)

```
Nexora → Google → User approves → Google callback → Nexora verifies → session tokens → dashboard
```

---

## 14. Security — Questions Evaluators Love

### Password hashing

**What is it?** Turning passwords into irreversible hashes.  
**Why?** Protects users if the DB leaks.  
**How?** bcrypt with cost factor 12.

### JWT authentication

**What is it?** Signed tokens on API requests.  
**Why?** Proves identity without passwords on every call.  
**How?** `Authorization: Bearer` + authenticate middleware.

### Refresh token security

**What is it?** Longer token used only to renew access.  
**Why?** Limits damage from stolen short tokens; allows revocation.  
**How?** Stored hashed in `RefreshSession`; rotated on refresh; logout-all revokes all.

### Input validation

**What is it?** Checking request data before trusting it.  
**Why?** Stops bad/malicious input.  
**How?** express-validator on routes; Zod on auth forms in the frontend.

### Rate limiting

**What is it?** Limiting how many requests one client can make.  
**Why?** Slows brute-force and abuse.  
**How?** API limiter + stricter auth limiter.

### CORS

**What is it?** Browser rule about which websites may call your API.  
**Why?** Stops random sites from using a logged-in browser session against your API carelessly.  
**How?** Allowed origins from `CORS_ORIGIN` / `CLIENT_URL`.

### Helmet

**What is it?** Middleware that sets safer HTTP headers.  
**Why?** Reduces common web header risks.  
**How?** Enabled in Express `app.js`.

### Tenant isolation

**What is it?** Each seller only sees their own data.  
**Why?** Multi-user SaaS safety.  
**How?** Almost every query filters by authenticated `userId`.

### IDOR prevention

**What is it?** Blocking “change the ID in the URL to steal another user’s record.”  
**Why?** Classic API bug.  
**How?** Lookups require ownership; cross-tenant → not found.

---

## 15. Tenant Isolation — Very Important

### Question: What stops User A from seeing User B’s products?

**Simple answer:**  
Every logged-in request knows User A’s id. Product queries only return rows owned by that id.

**Technical:**  
```
authenticated userId
+ database filter by owner
= only that user’s data
```

### What is IDOR? (simple)

IDOR means **Insecure Direct Object Reference**: guessing another user’s object id (like order `456`) to open it.

### Example

If User A opens `/orders/123` then changes it to `/orders/456`, the backend still checks: “Does order 456 belong to User A?” If not, access is denied (typically as not found). Ownership is enforced in services, not only in the UI.

---

## 16. AI System — Very Important

### What AI features does Nexora have?

1. **AI Insights** (panel) — tips/recommendations/forecast-style outputs from business context.  
2. **AI Product Generation** — upload image → draft product fields.

### Why Gemini?

It can generate text and understand images (multimodal).

### Does the frontend call Gemini directly?

**No.** Frontend → Nexora backend → Gemini. The API key stays on the server.

### What information is given to the AI?

Business context from the seller’s data (products, orders, profitability, campaigns, etc.), gathered by the backend.

### Insights flow

```
User → React → Nexora API → gather business context → Gemini → response → frontend
```

### What if Gemini is unavailable?

For **insights**: Nexora uses a **heuristic fallback** (rule-based tips from the same kind of data, without Gemini).  
For **image-to-product**: there is **no** heuristic fallback — it errors if Gemini fails.

### What is the heuristic fallback?

A non-AI backup generator so the insights demo still works when the Gemini key is missing or the provider fails.

---

## 17. AI Image-to-Product

```
Upload image
→ backend receives/loads image
→ Gemini analyzes it
→ draft fields (title, description, etc.)
→ user edits
→ user saves product
```

**Why useful?** Faster cataloging from a photo.  
**What Gemini does?** Suggests product text/details from the image.  
**What the user controls?** Everything — AI does not auto-save; user confirms by saving.  
**If AI fails?** Error shown; user can fill the form manually.

---

## 18. Profitability

### How do you calculate profit? (from actual policy)

```
Order total − Refunds = Net Revenue   (cancelled / fully refunded orders → $0)

Net Revenue − Cost of Goods Sold (COGS) = Profit
```

**COGS** = cost of the goods sold (from line `unitCost` when available, else product `costPrice`).

**Profit margin** ≈ profit ÷ net sales (safe handling when sales are zero).

### Full refund

Order treated as reversed financially → **no sales contribution** (status becomes `REFUNDED` when fully covered).

### Partial refund

Net revenue goes down by the refund amount. For MVP policy, **units/COGS stay** (money refund without modeled physical return).

### Cancelled order

Excluded from sales aggregates (net contribution 0).

### Tiny example

- Order total: **$100**  
- Product cost (COGS): **$40**  
- Partial refund: **$20**  
- Net revenue: **$80**  
- Profit: **$80 − $40 = $40**

If instead fully refunded **$100**: net revenue **$0**, order not counted as a successful sale.

---

## 19. Refunds

**What happens?** A refund row is saved; remaining refundable amount is checked; full refund sets order status to `REFUNDED`. Customer spend stats are recomputed. **Stock is not restored automatically.**

**Full refund vs revenue:** Order leaves sales (net 0).  
**Partial refund vs revenue:** Net revenue decreases.  
**Profit:** Lower net revenue usually means lower profit.  
**Why important?** Without refunds, dashboards lie about success.

**Example:** Sold $50, refunded $10 → net $40 before cost.

---

## 20. Dashboard

### What can a seller see?

From a user point of view: KPI cards, revenue/sales charts, product insights, customer insights, recent orders, activity feed, and store-health style signals — plus a button to open **AI Insights**.

### Where does data come from?

Authenticated calls to `/api/v1/dashboard/...` (and AI endpoints for the insights panel). Backend calculates using the seller’s orders/products/customers and refund-aware math.

---

## 21. Products & Inventory

- **Create/edit** products with name, SKU, category, **price**, optional **cost price**, image, description, status.  
- **Stock** lives in Inventory linked to the product.  
- **Low stock** uses reorder level / health signals.  
- **Updates:** restock, adjust, mark out of stock, bulk updates, history movements.  
- **Profitability** uses sales lines + refunds + costs (see §18).

---

## 22. Orders & Customers

- **Orders** store status, total, payment method notes, and link to a customer.  
- **Order items** store what was sold (name, qty, prices; optional product link and unit cost).  
- **Customers** belong to a seller and track totals like orders count and spend (updated with refunds).  
- Seller can open lists and detail pages for both.

---

## 23. Campaigns / Ads / Audiences

These modules let sellers create and manage campaigns, ad creatives, and audiences **inside Nexora’s database**.

### Safe viva answer: “Are your TikTok ads actually live?”

**No.** They are managed in Nexora for the project’s growth module. This is **not** a production TikTok Ads Marketing API sync unless we wire Partner APIs later.

---

## 24. TikTok Shop Connection

### Is TikTok Shop production integration complete?

**No.** Connect + sync are **sandbox/demo-shaped**.

### What if the user has not connected a shop?

After login, once integrations finish loading, a professional prompt can appear.

### Why does the popup appear?

To encourage connecting TikTok Shop so the seller understands the intended workflow.

### What does Maybe Later do?

Dismisses the prompt and remembers that choice for **7 days** (per user in localStorage), so it doesn’t spam every page click.

### Is this a real TikTok Partner API integration?

**No.** The CTA opens the existing connect modal; sync uses a sandbox adapter. Shopify/WooCommerce connect is blocked as “coming soon.”

---

## 25. Default Profile Avatar

### What if the user has no profile picture?

A shared **default avatar** image is shown (`UserAvatar` + `default-avatar.svg`).

### What if the uploaded image fails to load?

Same default avatar appears (`onError` fallback). Uploaded photos still show when the URL works. Upload/remove still uses the uploads API.

---

## 26. API

### What is an API?

A set of URLs the frontend uses to ask the backend to do something or fetch data.

### Flow

```
Frontend → API request → Route → Auth → Validation → Service → Database → Response
```

### Real Nexora examples

1. `POST /api/v1/auth/login` — log in  
2. `GET /api/v1/dashboard/kpis` — dashboard numbers  
3. `POST /api/v1/orders/:id/refunds` — create a refund  

---

## 27. Testing

| Area | What exists |
|------|-------------|
| **Framework** | Node.js built-in test runner (`node:test`) for backend |
| **Backend tests** | Files under `backend/tests/` — validators, password policy, refund/profit math, product AI helpers, HTTP smoke (health/401), etc. |
| **Count** | **45** tests in the project’s `backend/tests` suite |
| **Frontend tests** | **No** automated FE unit/e2e suite found |
| **Build** | `npm run build` (Vite) |
| **Lint** | `npm run lint` (Oxlint) |
| **Prisma** | `prisma generate` / `migrate` / `validate` via backend scripts |

**Safe line:** “We rely on backend automated tests plus frontend lint/build and manual checks.”

---

## 28. Deployment

| Piece | Simple hosting story |
|-------|----------------------|
| Frontend | Build SPA → host statically (Vercel-style; `vercel.json` rewrites) |
| Backend | Node API (Railway config present: migrate + start + healthcheck) |
| Database | Managed PostgreSQL via `DATABASE_URL` |
| Env vars | Secrets only on backend; frontend mainly needs `VITE_API_URL` |

### When a user opens the deployed site

Browser loads React → React calls your public API URL → API uses JWT → Prisma → Postgres. Google login needs the correct callback URL in Google Cloud Console.

---

## 29. What I Should NOT Claim in the Viva

| Don’t claim | Safe professional line |
|-------------|------------------------|
| Live TikTok Partner production sync | “We implemented sandbox connect/sync architecture; production Partner OAuth is next.” |
| Live Shopify/WooCommerce sync | “Connect is blocked as coming soon; schema supports it later.” |
| Stripe billing is live | “Billing endpoint is placeholder-shaped; Stripe isn’t integrated.” |
| Physical returns restore stock | “Refunds are financial-only today; inventory restore is future work.” |
| Full email password reset | “Forgot/reset routes currently redirect to login; email delivery isn’t built.” |
| Large frontend automated test suite | “Backend has automated tests; frontend uses lint, build, and manual QA.” |
| Frontend calls Gemini with a key in the browser | “Gemini keys stay on the backend only.” |
| Campaigns = live TikTok Ads API | “Campaigns/ads/audiences are managed inside Nexora’s database.” |

---

## 30. Top 40 Viva Questions

### 1. What is Nexora?

**Short:** A seller dashboard for marketplace operations, profit tracking, and AI help.  
**Better:** It’s a full-stack app where sellers manage products, stock, customers, orders, refunds, and growth tools, with net profitability and AI insights.  
**Deeper:** React/Vite SPA + Express/Prisma/PostgreSQL API under `/api/v1`.

### 2. Why did you build it?

**Short:** To give sellers one place for operations and clearer profit.  
**Better:** Sellers struggle with scattered tools and misleading gross sales. Nexora centralizes data and refund-aware numbers.  
**Deeper:** Also demonstrates auth, tenancy, AI, and honest sandbox integrations.

### 3. What problem does it solve?

**Short:** Fragmented seller tools and unclear profit after refunds.  
**Better:** One login for catalog, inventory, orders, customers, refunds, and insights.  
**Deeper:** Net revenue and COGS-based profit in backend utilities.

### 4. Why React?

**Short:** Great for interactive dashboards with reusable UI.  
**Better:** Many pages share layout/components; React handles UI state well.  
**Deeper:** React 19 + React Router + Redux Toolkit.

### 5. Why Express?

**Short:** Simple modular REST APIs in Node.  
**Better:** Easy routes, middleware, and feature modules.  
**Deeper:** Express 5 app with helmet, CORS, rate limits, Passport.

### 6. Why PostgreSQL?

**Short:** Relational data with integrity.  
**Better:** Orders/refunds/users need foreign keys and decimals.  
**Deeper:** Prisma schema maps enums, uniques, indexes.

### 7. Why Prisma?

**Short:** Safer, clearer database access.  
**Better:** Schema-as-code and typed client queries.  
**Deeper:** Migrations + seed for demo data.

### 8. What is an API?

**Short:** A contract of URLs for frontend↔backend communication.  
**Better:** Frontend sends HTTP; backend returns JSON.  
**Deeper:** Versioned REST under `/api/v1`.

### 9. How does frontend communicate with backend?

**Short:** Axios HTTP calls to the API base URL.  
**Better:** Private requests include Bearer access token; refresh on expiry.  
**Deeper:** `src/lib/axios.js` + feature services.

### 10. What is JWT?

**Short:** A signed login token for APIs.  
**Better:** Proves identity without sending password each time.  
**Deeper:** Access/refresh types with separate secrets.

### 11. Access vs refresh token?

**Short:** Access is short; refresh renews access.  
**Better:** ~15m access, ~7d refresh; refresh hashed in DB.  
**Deeper:** Rotation on refresh; logout-all revokes sessions.

### 12. Why bcrypt?

**Short:** Hash passwords safely.  
**Better:** Don’t store plaintext; compare hashes on login.  
**Deeper:** Cost factor 12 in auth service.

### 13. How does Google OAuth work?

**Short:** User approves on Google; Nexora gets profile, creates session.  
**Better:** Passport authorization-code redirect + callback + JWT to SPA.  
**Deeper:** login vs register intents; no Google password shared.

### 14. How do you protect APIs?

**Short:** JWT middleware on private routes.  
**Better:** Plus validation, rate limits, CORS, helmet.  
**Deeper:** Authenticate → validate → service ownership checks.

### 15. How do you prevent IDOR?

**Short:** Always check resource ownership.  
**Better:** Changing an id in the URL can’t open another tenant’s row.  
**Deeper:** Queries include `userId` / campaign ownership.

### 16. What is tenant isolation?

**Short:** Each seller only sees their data.  
**Better:** Authenticated user id filters every sensitive query.  
**Deeper:** Multi-tenant SaaS pattern without separate DBs per user.

### 17. How does AI work?

**Short:** Backend gathers context and calls Gemini.  
**Better:** Frontend never holds the Gemini key.  
**Deeper:** Insights cached; providers: Gemini + heuristic.

### 18. Why Gemini?

**Short:** Strong text + image understanding.  
**Better:** Fits insights and product-from-image.  
**Deeper:** Default model `gemini-2.0-flash` via env.

### 19. What happens when Gemini fails?

**Short:** Insights fall back to heuristics; product AI errors.  
**Better:** Demo insights still work without Gemini.  
**Deeper:** Product generate requires Gemini multimodal.

### 20. How does image-to-product work?

**Short:** Upload image → Gemini draft → user edits → save.  
**Better:** No auto-create without user confirmation.  
**Deeper:** `POST /ai/products/generate` then products CRUD.

### 21. How do you calculate profit?

**Short:** Net revenue minus COGS.  
**Better:** Net = total − refunds (with exclusions).  
**Deeper:** `refundMath` + `productPerformance.aggregateItems`.

### 22. How do refunds affect profit?

**Short:** They reduce net revenue, so profit usually falls.  
**Better:** Full refund removes the order from sales.  
**Deeper:** Partial keeps units/COGS in MVP policy; no stock restore.

### 23. How does inventory work?

**Short:** Stock rows linked to products with adjustments/history.  
**Better:** Restock, adjust, out-of-stock, bulk, reorder level.  
**Deeper:** `Inventory` + `StockMovement` models.

### 24. How are orders related to products?

**Short:** Through order items.  
**Better:** Each line has qty/price and may link to a product id.  
**Deeper:** Historical unitCost can be stored on the line.

### 25. How are customers related to orders?

**Short:** Each order belongs to one customer.  
**Better:** Customer totals update from order/refund activity.  
**Deeper:** `Customer.userId` + `Order.customerId`.

### 26. What is Prisma?

**Short:** ORM for PostgreSQL.  
**Better:** Schema defines models; client queries in services.  
**Deeper:** Prisma 7 + adapter-pg in this project.

### 27. What is middleware?

**Short:** Code that runs before the main route handler.  
**Better:** Auth, validation, logging, rate limit.  
**Deeper:** Express middleware chain in `app.js`.

### 28. What is CORS?

**Short:** Browser rule for cross-origin API calls.  
**Better:** Only allowed frontend origins can call the API from browsers.  
**Deeper:** Configured from env origins.

### 29. What is rate limiting?

**Short:** Cap requests per time window.  
**Better:** Protects login from brute force.  
**Deeper:** Separate stricter limit on `/auth`.

### 30. What is Helmet?

**Short:** Safer HTTP headers middleware.  
**Better:** Hardens basic web header posture.  
**Deeper:** Enabled with popup/COOP tweaks for OAuth UX.

### 31. How are secrets handled?

**Short:** Backend `.env` only; never in `VITE_*`.  
**Better:** JWT, Google secret, Gemini, DB URL stay server-side.  
**Deeper:** Frontend only needs public API URL.

### 32. How is the project deployed?

**Short:** SPA frontend + API backend + Postgres.  
**Better:** Vercel-style FE, Railway-style BE config in repo.  
**Deeper:** migrate deploy on start; healthcheck `/api/v1/health`.

### 33. What are your biggest challenges?

**Short:** Auth edge cases, tenancy, and honest net profit.  
**Better:** Google callback/session handling and refund math were tricky.  
**Deeper:** Keeping Partner integrations labeled sandbox, not fake-live.

### 34. What was the hardest feature?

**Short:** Refund-aware profitability / secure auth flows.  
**Better:** Making KPIs match refund policy across modules.  
**Deeper:** Partial vs full refund rules + transactions.

### 35. What is your strongest feature?

**Short:** Secure multi-tenant seller core + net profit + AI.  
**Better:** End-to-end path from auth to refunds to insights.  
**Deeper:** Pick one you coded deeply (auth, refunds, or AI) and explain it.

### 36. What is incomplete?

**Short:** Live Partner sync, Stripe, email reset, FE tests.  
**Better:** See limitations section — we document them honestly.  
**Deeper:** Physical returns not modeled.

### 37. Is TikTok integration live?

**Short:** No — sandbox connect/sync.  
**Better:** Prompt + modal exist; Partner API is future.  
**Deeper:** Shopify/WooCommerce connect blocked as coming soon.

### 38. What would you improve next?

**Short:** Real TikTok Partner OAuth and sync.  
**Better:** Also Stripe, email verification/reset, FE tests.  
**Deeper:** Inventory restore on returns workflow.

### 39. How would you scale the system?

**Short:** Separate FE/API/DB, Cloudinary, horizontal API instances.  
**Better:** Cache AI insights, rate limits, managed Postgres.  
**Deeper:** Don’t store uploads only on one local disk in multi-instance hosts.

### 40. Why is this a full-stack project?

**Short:** We built UI, API, database, auth, and deployment shape.  
**Better:** Frontend SPA + Express API + Prisma/Postgres + external optional services.  
**Deeper:** Security, tenancy, AI orchestration, and business logic all live in the system.

---

## 31. Rapid-Fire Revision

**React?** Frontend UI library.  
**Vite?** Frontend tooling / bundler.  
**JavaScript?** Language used in this project (JSX, not TypeScript).  
**SPA?** Single Page Application.  
**Express?** Backend web framework for Node.js.  
**Node.js?** Server runtime for JavaScript.  
**PostgreSQL?** Relational database.  
**Prisma?** Type-safe ORM for database access.  
**ORM?** Tool that maps objects/models to DB tables.  
**API?** Interface for frontend↔backend requests.  
**REST?** Style of API using HTTP methods and URLs.  
**Axios?** Frontend HTTP client.  
**JWT?** Token-based authentication.  
**Access token?** Short-lived API pass (~15m).  
**Refresh token?** Longer token to renew access (~7d).  
**bcrypt?** Password hashing.  
**Hash?** One-way scramble of data.  
**OAuth?** Login through a provider like Google.  
**Passport?** Node library running Google OAuth strategy.  
**Middleware?** Pre-handler request pipeline code.  
**CORS?** Cross-origin browser access control.  
**Helmet?** HTTP security headers middleware.  
**Rate limiting?** Cap requests to reduce abuse.  
**Validation?** Checking input before trusting it.  
**Tenant?** One seller’s isolated data space.  
**Tenant isolation?** Only see your own rows.  
**IDOR?** Accessing another user’s object by changing an ID.  
**SaaS?** Software as a Service (multi-user web product).  
**CRUD?** Create, Read, Update, Delete.  
**Gemini?** AI model for insights and image-to-product.  
**Fallback?** Backup behavior when AI fails (insights heuristics).  
**Heuristic?** Rule-based non-Gemini insights generator.  
**COGS?** Cost of Goods Sold.  
**Net revenue?** Sales after refunds (with policy exclusions).  
**Profit?** Net revenue − COGS.  
**Profit margin?** Profit as a share of net sales.  
**Refund?** Money returned on an order.  
**Sandbox?** Demo/placeholder integration, not production Partner API.  
**Cloudinary?** Optional cloud image hosting.  
**Migration?** Database schema change applied by Prisma.  
**Vercel?** Frontend static hosting pattern in this repo.  
**Railway?** Backend deploy config present in this repo.  
**Redux?** Frontend global state management.  
**Bearer token?** Access token sent in Authorization header.

---

## 32. My 5-Minute Presentation Script

*(Speak naturally. Adjust timing as needed.)*

**1. Introduction**  
“Hi — my project is Nexora, a full-stack seller dashboard for marketplace sellers.”

**2. Problem**  
“Sellers often manage products, stock, orders, and ads in separate places, and sales numbers can ignore refunds, so profit looks better than it really is.”

**3. Solution**  
“Nexora puts operations in one app: products, inventory, customers, orders, refunds, dashboard KPIs, and growth modules, with AI support.”

**4. Main features**  
“After login, you get a dashboard, full product and inventory management, customers and orders, refund handling, campaigns/ads/audiences inside the app, AI insights, and image-to-product drafting.”

**5. Technology stack**  
“Frontend is React with Vite and Redux. Backend is Node with Express. Database is PostgreSQL through Prisma. Auth uses JWT and bcrypt, plus Google OAuth with Passport. AI uses Gemini on the backend.”

**6. Architecture**  
“The browser never talks to the database directly. React calls our REST API, Express runs business logic, Prisma writes to PostgreSQL.”

**7. Authentication / security**  
“Passwords are hashed. Login issues short access tokens and longer refresh tokens. Protected routes need the access token. We also validate input, rate-limit auth, and filter every seller’s data by user id to stop IDOR.”

**8. AI**  
“For insights, the backend gathers the seller’s business context and calls Gemini — or falls back to heuristics if Gemini isn’t available. For product images, Gemini drafts fields, but the seller edits and saves manually. The frontend never holds the Gemini key.”

**9. Profitability / refunds**  
“Profit is based on net revenue after refunds, minus cost of goods. Full refunds remove the order from sales. Partial refunds reduce net revenue. We don’t auto-restore stock on refund in this version.”

**10. TikTok connection**  
“If a shop isn’t connected, we show a polite popup. Connecting uses our existing modal, but sync is sandbox — not a live TikTok Partner production integration. I’m clear about that.”

**11. Limitations**  
“Not done yet: production Partner APIs, Stripe billing, email password reset, physical returns, and frontend automated tests.”

**12. Conclusion**  
“Overall, Nexora shows a complete full-stack path — UI, API, database, security, business logic, and AI — with honest limits on external marketplace APIs.”

---

## 33. My 30-Second Emergency Answers

1. **What is Nexora?** A seller dashboard for products, orders, profit, and AI help.  
2. **Who is it for?** Online marketplace sellers.  
3. **Frontend?** React + Vite SPA.  
4. **Backend?** Node.js + Express API.  
5. **Database?** PostgreSQL with Prisma.  
6. **Login?** Email/password or Google; JWT for APIs.  
7. **Passwords?** Hashed with bcrypt — never stored plain.  
8. **Two tokens?** Short access + longer refresh.  
9. **Security?** Auth middleware, validation, rate limits, tenant filters.  
10. **AI?** Backend → Gemini; insights can fall back to heuristics.  
11. **Profit?** Net revenue after refunds minus COGS.  
12. **TikTok live?** No — sandbox connection demo.  
13. **Ads live on TikTok?** No — stored in Nexora.  
14. **Hardest part?** Auth sessions / refund-aware profit.  
15. **Next step?** Real Partner OAuth sync and stronger billing/email features.

---

## 34. Difficult Terms — Simple Meanings

| Term | Simple meaning | How Nexora uses it |
|------|----------------|--------------------|
| **JWT** | Signed login pass | Access/refresh tokens for API auth |
| **OAuth** | Login via Google | Passport Google authorization-code flow |
| **API** | Backend endpoints | `/api/v1/...` REST routes |
| **REST** | HTTP-style API design | GET/POST/PATCH/DELETE resources |
| **ORM** | DB access via models | Prisma Client in services |
| **Prisma** | Our ORM tool | `schema.prisma` + queries |
| **Middleware** | Pre-processing layer | Auth, CORS, rate limit, validate |
| **bcrypt** | Password hasher | Register/login password security |
| **Hash** | One-way scramble | Passwords + refresh token hashes |
| **Refresh token** | Renew access | Stored hashed in `RefreshSession` |
| **Access token** | Call protected APIs | Bearer header (~15m) |
| **CORS** | Allowed web origins | Env-configured SPA origin |
| **IDOR** | Steal by changing IDs | Blocked via ownership checks |
| **Tenant** | One seller’s account space | `userId` scoping |
| **SaaS** | Multi-user cloud app style | Many sellers, one codebase |
| **SPA** | App without full reloads | React Router dashboard |
| **CRUD** | Basic data operations | Products, customers, campaigns… |
| **Gemini** | Google AI model | Insights + image-to-product |
| **Fallback** | Backup plan | Heuristic insights if Gemini fails |
| **COGS** | Product cost for sold items | Used in profit math |
| **Net revenue** | After refunds | Dashboard/product KPIs |
| **Profit margin** | Profit ÷ net sales | Performance endpoints/UI |
| **Rate limiting** | Request caps | API + auth limiters |
| **Helmet** | Secure headers | Express security middleware |
| **Validation** | Input checking | express-validator + Zod (auth) |
| **Migration** | DB schema update | Prisma migrate on deploy |

---

## 35. Final “Know Your Project” Checklist

Before the evaluation, make sure you can explain:

- [ ] What Nexora is  
- [ ] Problem it solves  
- [ ] Main features  
- [ ] Frontend (React/Vite/Redux)  
- [ ] Backend (Node/Express)  
- [ ] Database (PostgreSQL)  
- [ ] Prisma  
- [ ] JWT  
- [ ] Refresh tokens  
- [ ] bcrypt  
- [ ] Google OAuth  
- [ ] Tenant isolation  
- [ ] IDOR prevention  
- [ ] AI architecture  
- [ ] Gemini  
- [ ] AI fallback (insights only)  
- [ ] Image-to-product  
- [ ] Profit calculation  
- [ ] Refund calculation  
- [ ] Inventory  
- [ ] Orders  
- [ ] Campaigns/ads/audiences (in-app, not live Ads API)  
- [ ] TikTok connection (sandbox)  
- [ ] Security  
- [ ] Testing (45 backend tests; no FE suite)  
- [ ] Deployment shape  
- [ ] Limitations  
- [ ] Future improvements  

---

**IMPORTANT:** This study guide is based on the current source code and `PROJECT_DOCUMENTATION.md`. If they disagree, verify the source code before answering an evaluator.
