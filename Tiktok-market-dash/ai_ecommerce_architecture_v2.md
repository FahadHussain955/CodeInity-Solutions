# AI E-Commerce Growth Platform: Software Architecture Document

## 1. Overall Architecture

### 1.1 High-Level System Architecture
```text
[ Client (React/Vite) ] <-------> [ API Gateway / Load Balancer ]
                                           |
       +-----------------------------------+-----------------------------------+
       |                                                                       |
[ Node.js / Express Backend (REST API) ]                             [ External APIs ]
       |         |         |         |                               - Google Gemini / OpenAI
    [Auth]    [Core]     [AI]  [Integrations]                        - Cloudinary (Media)
       |         |         |         |                               - Stripe (Future)
       +---------+---------+---------+
                 |
        [ Prisma ORM Layer ]
                 |
        [ PostgreSQL DB ]
```

### 1.2 Frontend Architecture
The frontend is a React Single Page Application (SPA) utilizing **Vite** for fast builds and HMR. It implements a **Feature-Driven** architecture to ensure modularity. State is managed via **RTK Query** for server state and **Redux Toolkit** for complex client state. UI components rely on **shadcn/ui** and **Tailwind CSS**.

### 1.3 Backend Architecture
A Node.js/Express application structured as a **Modular Monolith**. 
- **Controllers**: Handle HTTP lifecycle and parsing.
- **Services**: Contain pure business logic and AI orchestration.
- **Repositories (Prisma)**: Abstract the data access layer.

### 1.4 Database Architecture
A relational **PostgreSQL** database managed through **Prisma ORM**. PostgreSQL is chosen for strict ACID compliance, relational integrity (essential for E-Commerce orders and inventory), and JSONB support for flexible metadata (like AI insights).

### 1.5 AI Architecture
The AI module is decoupled via an internal service interface (`AIService`). Whether using OpenAI or Gemini, the controller calls a generic method (e.g., `generateProductDescription(prompt)`). Swapping providers only requires rewriting the concrete implementation of the `AIService`.

---

## 2. Frontend Folder Structure

```text
src/
├── assets/            # Static files (images, icons, global CSS)
├── components/        # Shared UI components (Buttons, Cards, Modals - mostly shadcn/ui)
├── config/            # Environment variables and third-party configuration wrappers
├── constants/         # App-wide constants (Roles, Enum mappings)
├── contexts/          # React Contexts (ThemeContext, UIContext)
├── features/          # Domain-specific modules (The core logic)
│   ├── auth/          # Each feature contains its own /components, /hooks, /services, /slices
│   ├── products/
│   ├── orders/
│   └── analytics/
├── hooks/             # Global reusable custom hooks
├── layouts/           # Page wrappers (DashboardLayout, AuthLayout)
├── lib/               # Pre-configured instances of third-party libraries (Axios, Zod)
├── pages/             # Route-level components that import from /features and /layouts
├── providers/         # Global provider composition (StoreProvider, ThemeProvider)
├── redux/             # Global store configuration
├── routes/            # Route definitions and Route Guards
├── services/          # Global non-feature API services
├── styles/            # Tailwind entry point
├── types/             # Global TS interfaces
└── utils/             # Pure helper functions (formatDate, formatCurrency)
```

---

## 3. Backend Folder Structure

```text
src/
├── ai/                # AI Provider integrations (Gemini/OpenAI implementations)
├── auth/              # Authentication specific logic (JWT generation, strategies)
├── cloudinary/        # Cloudinary SDK wrappers and upload stream handlers
├── config/            # Env variables and environment-specific configs
├── constants/         # Magic strings, status codes, and enums
├── controllers/       # Route handlers (req, res, next)
├── helpers/           # Pure functions (password hashing, string manipulation)
├── jobs/              # Node Cron jobs (e.g., daily low-stock checks)
├── logs/              # Winston/Morgan log outputs (if local)
├── middleware/        # Express middlewares (authMiddleware, errorMiddleware)
├── prisma/            # Prisma schema, migrations, and seed scripts
├── repositories/      # Database abstraction layer (wrapping Prisma client)
├── routes/            # Express router definitions
├── services/          # Business logic layer (called by controllers)
├── uploads/           # Temporary local storage before Cloudinary upload
├── utils/             # Utility classes (AppError, CatchAsync)
└── validators/        # Express Validator / Zod schemas for request validation
```

---

## 4. Prisma Architecture

- **Schema Organization**: A single `schema.prisma` file, grouping related models logically (User/Auth, Products, Orders, System).
- **Migration Strategy**: Use `npx prisma migrate dev` during development for declarative schema tracking. `npx prisma migrate deploy` for CI/CD pipelines.
- **Repository Pattern**: We will wrap the Prisma Client in a Repository layer (e.g., `ProductRepository.ts`). This prevents controllers and services from being tightly coupled to Prisma's specific API, making it easier to write unit tests (mocking the repo) and execute complex transactions.
- **Best Practices**: Use Prisma's `select` and `include` explicitly to avoid over-fetching data. Utilize `@map` to keep database column names `snake_case` while keeping TypeScript properties `camelCase`.

---

## 5. Redux Architecture

- **Store**: Configured in `src/redux/store.ts` using `@reduxjs/toolkit`.
- **RTK Query**: **Highly Recommended**. We will use RTK Query for all API interactions to handle caching, background fetching, and deduplication automatically.
- **Feature Slices**: Used strictly for complex synchronous client state (e.g., a multi-step checkout form or complex table filter state). Located inside `src/features/{featureName}/slice.ts`.
- **Async Thunks**: Rarely used. Only implemented for complex workflows that require dispatching multiple actions in sequence where RTK Query's mutation lifecycle isn't sufficient.
- **Selectors**: Created using `createSelector` to memoize derived state (e.g., calculating total items selected in a table) to prevent re-renders.

---

## 6. Routing Architecture

- **Public Routes**: `/login`, `/register`. Accessible only if unauthenticated.
- **Protected Routes**: Root `/` requires a valid JWT.
- **Dashboard Routes (Nested)**: `/dashboard`, `/products`, `/orders`. Rendered inside `<DashboardLayout>`.
- **Auth Routes**: Handle token refresh workflows invisibly.
- **404 Route**: Catch-all `*` wildcard route.
- **Route Guards**: `<AuthGuard>`, `<PublicGuard>`, and `<RoleGuard>` wrap route components to verify permissions.
- **Lazy Loading**: Route components in `src/pages/` are dynamically imported using `React.lazy()` to code-split the bundle.
- **Role-Based Routing**: Architecture supports roles (`ADMIN`, `STAFF`, `SELLER`). `RoleGuard` accepts an array of allowed roles.

---

## 7. React Hooks Strategy

- `useAuth`: Exposes `user`, `login()`, `logout()`, and `isAuthenticated`.
- `useAxios`: Attaches JWT interceptors and handles refresh-token logic automatically on a specialized Axios instance.
- `useDebounce`: Delays values for text inputs to prevent API spam on search boxes.
- `useProducts` / `useOrders`: RTK Query auto-generated hooks (`useGetProductsQuery`).
- `useAnalytics`: Transforms raw backend statistical data into specific array formats required by Recharts.
- `useInventory`: Calculates stock depletion rates on the client side based on current cart/order drafts.
- `useTheme`: Manages dark/light mode switching.
- `useMedia`: Handles multi-image upload progress and preview URL generation.

---

## 8. Services Layer (API Communication)

- **Centralized Axios**: A base instance is created in `src/lib/axios.ts`. 
- **Interceptors**: 
  - *Request*: Injects `Authorization: Bearer <token>`.
  - *Response*: Intercepts `401 Unauthorized`. If the access token expires, it pauses the queue, uses a refresh token to get a new access token, updates the header, and replays the failed requests.
- **Module Services**: While RTK Query handles most fetching, specialized tasks (like uploading files with progress bars) use specific feature services (e.g., `features/products/services.ts`).
- **Token Management**: Access tokens stored in memory (or Redux state). Refresh tokens stored in `httpOnly` secure cookies.

---

## 9. Feature Organization

**Decision: Feature-First Architecture**

We will group files by **Feature** (`/features/orders`, `/features/products`) rather than by Layer (`/components`, `/hooks`).
**Why?** Scalability. In a Layer-first architecture, adding a new feature requires modifying 5 different directories. Feature-first keeps domains isolated, making it easy to delete, extract, or assign a specific feature to a team without causing merge conflicts across the codebase.

---

## 10. Shared Components Strategy

Organized in `src/components/`, broken down by atomic design principles:
- **Buttons / Inputs**: Wrappers around `shadcn/ui` with custom variants.
- **Cards**: `DashboardCard`, `MetricCard`.
- **Tables**: A reusable `DataTable` combining TanStack Table logic with custom styling.
- **Charts**: Reusable wrappers around Recharts to standardize colors and tooltips.
- **Dialogs**: A globally managed modal system (e.g., `ConfirmDialog`).
- **Loaders & Skeletons**: `PageLoader`, `TableSkeleton`, `CardSkeleton` for layout-preserving loading states.
- **Empty & Error States**: `NoDataState` and `ErrorBoundaryFallback` components for graceful failures.

---

## 11. State Management Strategy

- **Redux (RTK Query)**: Server state (Products, Orders, Customers).
- **Redux (Slices)**: Global UI state (Sidebar open/close, global notification toasts, complex multi-step wizards).
- **React Context**: Infrequently changing global configurations (Theme Preference, Localization/Language).
- **Local Component State (`useState`)**: Trivial component state (dropdown visibility, current tab, controlled input values).

---

## 12. Form Validation Strategy

- **React Hook Form (RHF)** handles the form state (uncontrolled inputs) to optimize performance.
- **Zod** defines the schema (`const productSchema = z.object({...})`).
- **Integration**: We use `@hookform/resolvers/zod` to pass the Zod schema to RHF's `resolver` property. 
- **Benefit**: The exact same Zod schema can be shared/replicated on the Node.js backend to ensure 100% parity between frontend and backend validation rules.

---

## 13. Environment Variables

**Frontend (`.env`)**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME="AI E-Commerce Growth"
VITE_DEFAULT_THEME=light
```

**Backend (`.env`)**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AI_API_KEY=your_gemini_or_openai_key
CORS_ORIGIN=http://localhost:5173
```

---

## 14. VS Code Extensions

1. **ESLint**: Real-time linting errors.
2. **Prettier - Code formatter**: Automatic formatting on save.
3. **Tailwind CSS IntelliSense**: Autocomplete for utility classes.
4. **Prisma**: Syntax highlighting, formatting, and auto-completion for `schema.prisma`.
5. **Error Lens**: Displays inline errors, reducing the need to hover.
6. **REST Client** (or Thunder Client): Testing API endpoints directly in VS Code.
7. **PostgreSQL (Chris Kolkman)**: To query the DB directly from the editor.
8. **GitLens**: Detailed git blame and history tracking.

---

## 15. Development Dependencies

### Frontend
- **Dependencies**: `react`, `react-dom`, `react-router-dom`, `@reduxjs/toolkit`, `react-redux`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge` (shadcn reqs).
- **Dev Dependencies**: `vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `prettier`, `@types/react`, `@types/node`.

### Backend
- **Dependencies**: `express`, `cors`, `helmet`, `morgan`, `dotenv`, `prisma`, `@prisma/client`, `jsonwebtoken`, `bcryptjs`, `multer`, `cloudinary`, `zod` (or express-validator), `node-cron`.
- **Dev Dependencies**: `typescript`, `ts-node`, `nodemon`, `eslint`, `prettier`, `@types/express`, `@types/node`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/multer`.

---

## 16. ESLint & Formatting

- **ESLint**: Configured to catch code-quality issues (unused vars, exhaustive deps in React hooks).
- **Prettier**: Dictates code style (quotes, spacing, line length). Integrated with ESLint via `eslint-config-prettier` to prevent conflicts.
- **EditorConfig**: Ensures consistent line endings (LF) and indentation across different OS environments.
- **Import Sorting**: `eslint-plugin-simple-import-sort` enforces absolute imports first, then relative imports.
- **Absolute Imports**: Enforced strictly to prevent relative path hell.

---

## 17. Path Aliases

Aliases improve readability and allow files to be moved without breaking import paths.
- `@/` -> `src/` (Global)
- `@components/` -> `src/components/`
- `@pages/` -> `src/pages/`
- `@hooks/` -> `src/hooks/`
- `@services/` -> `src/services/`
- `@utils/` -> `src/utils/`
- `@features/` -> `src/features/`
- `@layouts/` -> `src/layouts/`
- `@assets/` -> `src/assets/`

---

## 18. Naming Conventions

- **Folders**: `kebab-case` (`auth`, `product-management`).
- **Files**: `kebab-case` (`auth-controller.ts`).
- **Components**: `PascalCase` (`ProductCard.tsx`).
- **Hooks**: `camelCase` prefixed with `use` (`useAuth.ts`).
- **Redux Slices**: `camelCase` ending in Slice (`authSlice.ts`).
- **Services**: `PascalCase` classes (`ProductService.ts`).
- **Functions**: `camelCase` (`calculateTotal()`).
- **Constants/Env Vars**: `UPPER_SNAKE_CASE` (`MAX_RETRIES`).
- **Prisma Models**: `PascalCase` (`User`, `Product`).
- **Database Tables**: Mapped to `snake_case` plural using `@map` (e.g., `@@map("users")`).

---

## 19. Coding Standards

- **File Organization**: One component/class per file. Export at the bottom or inline, but be consistent.
- **Error Handling**: 
  - Frontend: Use Error Boundaries. 
  - Backend: Use a centralized global error handling middleware and a custom `AppError` class. Never expose raw DB errors to the client.
- **Async Patterns**: Use `async/await` exclusively. Avoid `.then().catch()`. Wrap backend route handlers in a `catchAsync` utility to eliminate `try/catch` boilerplate.
- **API Response Format**: Standardized JSON: `{ status: "success" | "error", data: any, message?: string }`.
- **SOLID Principles**: Single Responsibility (controllers only handle HTTP, services handle logic); Dependency Inversion (services rely on interfaces/repositories, not concrete database drivers).

---

## 20. Scalability

This architecture is built for the future:
- **Marketplace Integrations**: The Repository pattern on the backend allows us to create an `AmazonRepository` that conforms to our internal `IProduct` interface. The core business logic will not need to know where the product came from.
- **Multiple Stores & Teams**: PostgreSQL + Prisma makes adding a `Store` model and assigning `Users` to `Stores` via foreign keys highly relational and strict. Route Guards (`RoleGuard`) are already in place to handle permissions.
- **AI Modules**: Isolated behind the `AIService`. As AI tools evolve, we can update the service layer without rewriting controller logic or frontend components.
- **Automation & Jobs**: The `src/jobs` directory using `node-cron` allows us to easily scale automated tasks (like syncing inventory overnight) asynchronously, without blocking the main event loop.
