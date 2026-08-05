# Next Boiler Plate — Complete Reference & AI Integration Guide

> **Purpose of this file:** A complete A-to-Z reference for the `next-boiler-plate` project.
> Send it to an AI agent to recreate or integrate the dashboard into any existing Next.js project
> without modifying the host project's existing code.

---

## Table of Contents

1. [What this project is](#1-what-this-project-is)
2. [Quick start](#2-quick-start)
3. [Scripts reference](#3-scripts-reference)
4. [Environment variables](#4-environment-variables)
5. [Technology stack](#5-technology-stack)
6. [Project structure (annotated)](#6-project-structure-annotated)
7. [Configuration files](#7-configuration-files)
8. [Routing & layouts](#8-routing--layouts)
9. [Authentication system](#9-authentication-system)
10. [API routes](#10-api-routes)
11. [Pages — detailed behaviour](#11-pages--detailed-behaviour)
12. [Component catalogue](#12-component-catalogue)
13. [Data fetching & state management](#13-data-fetching--state-management)
14. [Design system & CSS tokens](#14-design-system--css-tokens)
15. [RBAC & permission model](#15-rbac--permission-model)
16. [Types reference](#16-types-reference)
17. [Demo & mock data](#17-demo--mock-data)
18. [Additive integration guide](#18-additive-integration-guide)
19. [Verification checklist](#19-verification-checklist)
20. [Key files for agents](#20-key-files-for-agents)
21. [AI Integration Prompt](#21-ai-integration-prompt)

---

## 1. What this project is

**Next Boiler Plate** (`next-boiler-plate`) is a production-oriented **Next.js 16 App Router** admin dashboard starter designed to sit beside an existing public website as the authenticated admin / operations area.

| Area | Route | Purpose |
|------|-------|---------|
| Auth | `/login` | JWT session login — demo accounts or real backend |
| Dashboard | `/` | KPIs, revenue charts, inventory highlights |
| Analytics | `/analytics` | Sales velocity & traffic telemetry (Recharts) |
| Products | `/products` | Catalog browse + CRUD UI (FakeStore or your API) |
| Users | `/users` | Team table, invite / edit / delete, RBAC gates |
| Settings | `/settings` | General / profile / notifications / security tabs |

**Demo mode** — when `NEXT_PUBLIC_API_BASE_URL` is empty, the app signs its own JWTs locally and uses built-in demo accounts. No external backend is required.

---

## 2. Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local   # or create manually — see §4

# 3. Generate a session secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
# Paste the output as SESSION_SECRET in .env.local

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — unauthenticated visitors are redirected to `/login`.

**Demo credentials (development only):**

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `Admin@1234` | admin |
| `manager@example.com` | `Manager@1234` | manager |
| `viewer@example.com` | `Viewer@1234` | viewer |

---

## 3. Scripts reference

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Starts Next.js in development mode with HMR |
| Production build | `npm run build` | Compiles and optimises for production |
| Start production | `npm run start` | Runs the compiled production build |
| Lint | `npm run lint` | Runs ESLint across the project |

---

## 4. Environment variables

Create `.env.local` in the project root:

```bash
# ── Required ───────────────────────────────────────────────────────────────
# Minimum 32 characters — used to sign session JWTs (HS256).
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
# NEVER expose this in client-side code or commit it to version control.
SESSION_SECRET=your-32-char-or-longer-secret-here

# ── Optional — leave empty for Demo Mode ───────────────────────────────────
# Build-time constant inlined by the Next.js compiler.
# Changing this value requires a full rebuild (npm run build).
# When empty: the app validates credentials locally and mints its own JWTs.
NEXT_PUBLIC_API_BASE_URL=

# ── Optional — defaults to https://fakestoreapi.com ────────────────────────
# Override to point at your own products / catalog API.
# Server-only: never exposed to the browser.
PRODUCTS_API_BASE_URL=
```

### Variable details

| Variable | Visibility | Required | Default | Notes |
|----------|-----------|----------|---------|-------|
| `SESSION_SECRET` | Server only | Yes | — | Min 32 chars; HS256 signing key |
| `NEXT_PUBLIC_API_BASE_URL` | Public (build-time) | No | `""` | Empty = Demo Mode |
| `PRODUCTS_API_BASE_URL` | Server only | No | `https://fakestoreapi.com` | Products catalog API base |

**Validation:** `src/server/env.ts` validates these at startup using Zod. A missing or too-short `SESSION_SECRET` throws a descriptive error before the first request is served.

---

## 5. Technology stack

### Framework & runtime

| Package | Version | Usage |
|---------|---------|-------|
| `next` | `16.2.10` | App Router framework. **`proxy.ts` replaces `middleware.ts`** in this version. |
| `react` | `19.2.4` | UI library with React Compiler enabled |
| `react-dom` | `19.2.4` | DOM renderer |
| `typescript` | `^5` | Type safety across the codebase |

### UI & styling

| Package | Version | Usage |
|---------|---------|-------|
| `tailwindcss` | `^4` | Utility-first CSS — v4 uses `@import` directives, no config file needed |
| `tw-animate-css` | `^1.4.0` | Tailwind-compatible animation utilities |
| `shadcn` | `^4.13.0` | Component CLI — style `base-nova`, icon library `lucide` |
| `@base-ui/react` | `^1.6.0` | Headless UI primitives used by some shadcn components |
| `lucide-react` | `^1.24.0` | Icon set used throughout the dashboard |
| `next-themes` | `^0.4.6` | Dark/light mode via `"class"` attribute on `<html>` |
| `class-variance-authority` | `^0.7.1` | Variant-based component styling |
| `clsx` | `^2.1.1` | Conditional class names |
| `tailwind-merge` | `^3.6.0` | Merge Tailwind classes without conflicts |

### Data fetching

| Package | Version | Usage |
|---------|---------|-------|
| `@tanstack/react-query` | `^5.101.2` | Server-state cache for all client-side data fetching |
| `@tanstack/react-query-devtools` | `^5.101.2` | Dev-only query inspector (auto-included in development) |
| `@tanstack/react-table` | `^8.21.3` | Headless table primitives for the Users table |

### State management

| Package | Version | Usage |
|---------|---------|-------|
| `zustand` | `^5.0.14` | Client-state stores: `AuthStore` (user mirror) and `UIStore` (sidebar state) |

### Forms & validation

| Package | Version | Usage |
|---------|---------|-------|
| `react-hook-form` | `^7.81.0` | Form state and validation orchestration |
| `@hookform/resolvers` | `5.4.0` | Adapter connecting Zod schemas to RHF |
| `zod` | `^4.4.3` | Schema validation — shared between client and server |

### Charts

| Package | Version | Usage |
|---------|---------|-------|
| `recharts` | `^3.8.0` | AreaChart, PieChart, BarChart, LineChart on dashboard and analytics pages |

### Authentication (server-only)

| Package | Version | Usage | Note |
|---------|---------|-------|------|
| `jose` | `6.2.3` | HS256 JWT signing / verification for session and identity tokens | **Server-only** — never import in Client Components |

### Dates

| Package | Version | Usage |
|---------|---------|-------|
| `date-fns` | `^4.4.0` | Date formatting (`format()`) on the analytics page |
| `react-day-picker` | `^10.0.1` | Calendar component used in date pickers |

### Toasts

| Package | Version | Usage |
|---------|---------|-------|
| `sonner` | `^2.0.7` | Toast notifications — `<Toaster>` in Providers, `toast()` anywhere client-side |

### Dev tools

| Package | Version | Usage |
|---------|---------|-------|
| `babel-plugin-react-compiler` | `1.0.0` | React Compiler (auto-memoisation) — enabled via `next.config.ts` |
| `@tailwindcss/postcss` | `^4` | PostCSS plugin for Tailwind v4 |
| `eslint` | `^9` | Linter |
| `eslint-config-next` | `16.2.10` | Next.js ESLint rules |
| `@tanstack/eslint-plugin-query` | `^5.101.2` | TanStack Query lint rules |
| `@types/node` | `^20` | Node.js types |
| `@types/react` | `^19` | React types |
| `@types/react-dom` | `^19` | ReactDOM types |

**Path alias:** `@/*` resolves to `./src/*` (configured in `tsconfig.json`).

---

## 6. Project structure (annotated)

```
next-boiler-plate/
├── .env.local                    # Environment secrets (git-ignored)
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs             # ESLint flat config (Next.js + TanStack Query)
├── next.config.ts                # Next.js config: reactCompiler, remotePatterns
├── next-env.d.ts                 # Auto-generated Next.js type declarations
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS: @tailwindcss/postcss plugin
├── tsconfig.json                 # TypeScript: strict, bundler resolution, @/* alias
├── public/                       # Static assets served at root URL
└── src/
    ├── proxy.ts                  # ← Next.js 16 replacement for middleware.ts
    ├── app/
    │   ├── layout.tsx            # Root layout: fonts, Providers, metadata
    │   ├── globals.css           # Tailwind v4 imports + CSS design tokens
    │   ├── error.tsx             # Global error boundary (Client Component)
    │   ├── not-found.tsx         # 404 page
    │   ├── favicon.ico           # Browser favicon
    │   ├── (auth)/               # Route group — no sidebar/header shell
    │   │   ├── layout.tsx        # Auth layout (renders children only)
    │   │   └── login/
    │   │       └── page.tsx      # /login — split-panel sign-in page
    │   ├── (dashboard)/          # Route group — sidebar + header shell
    │   │   ├── layout.tsx        # Dashboard shell: SidebarProvider + AppSidebar + AppHeader
    │   │   ├── page.tsx          # / — overview: KPIs, charts, product grid
    │   │   ├── analytics/
    │   │   │   ├── page.tsx      # /analytics — charts, KPIs, date picker
    │   │   │   ├── loading.tsx   # Skeleton while page loads
    │   │   │   └── error.tsx     # RouteError boundary
    │   │   ├── products/
    │   │   │   ├── page.tsx      # /products — catalog with search + filters
    │   │   │   ├── loading.tsx
    │   │   │   └── error.tsx
    │   │   ├── users/
    │   │   │   ├── page.tsx      # /users — team table + RBAC dialogs
    │   │   │   ├── loading.tsx
    │   │   │   └── error.tsx
    │   │   └── settings/
    │   │       ├── page.tsx      # /settings — 4-tab settings forms
    │   │       └── loading.tsx
    │   ├── api/
    │   │   └── auth/
    │   │       ├── login/route.ts   # POST /api/auth/login
    │   │       ├── logout/route.ts  # POST /api/auth/logout
    │   │       ├── me/route.ts      # GET  /api/auth/me
    │   │       └── token/route.ts   # GET  /api/auth/token
    │   ├── analytics/            # Empty stub (routing placeholder)
    │   ├── login/                # Empty stub (routing placeholder)
    │   ├── products/             # Empty stub (routing placeholder)
    │   ├── settings/             # Empty stub (routing placeholder)
    │   └── users/                # Empty stub (routing placeholder)
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives (24 components)
    │   ├── layout/
    │   │   ├── app-sidebar.tsx   # Collapsible icon sidebar (Client Component)
    │   │   ├── app-header.tsx    # Sticky header: breadcrumb, theme, notifications, user
    │   │   └── page-header.tsx   # Reusable page title + badge + action slot
    │   ├── common/
    │   │   ├── theme-toggle.tsx  # Dark/light mode button (mounted-guard)
    │   │   └── route-error.tsx   # Shared error boundary UI
    │   ├── dashboard/
    │   │   └── dashboard-charts.tsx  # AreaChart + PieChart (Client Component)
    │   └── providers/
    │       └── index.tsx         # ThemeProvider + QueryProvider + Toaster
    ├── features/                 # Feature-first modules (barrels at index.ts)
    │   ├── auth/
    │   │   ├── actions.ts        # login() and logout() Server Actions
    │   │   ├── store.ts          # Zustand AuthStore
    │   │   ├── validations.ts    # LoginSchema (Zod)
    │   │   ├── index.ts          # Barrel export
    │   │   ├── components/
    │   │   │   ├── login-form.tsx    # RHF + Zod login form
    │   │   │   └── logout-button.tsx # Calls logout Server Action
    │   │   └── hooks/
    │   │       ├── use-current-user.ts  # Fetches /api/auth/me, syncs Zustand
    │   │       └── use-role.ts          # useRole() + isMutationRole()
    │   ├── products/
    │   │   ├── services.ts       # getProducts(), getProduct(), getCategories() — server-side
    │   │   ├── index.ts          # Barrel export
    │   │   ├── components/
    │   │   │   ├── product-card.tsx           # Server Component, next/image
    │   │   │   ├── product-grid.tsx           # Server Component, calls getProducts()
    │   │   │   ├── product-grid-skeleton.tsx  # 8-card skeleton grid
    │   │   │   ├── products-client-section.tsx # Search + filter + RBAC Add button
    │   │   │   └── add-product-dialog.tsx     # RHF + Zod dialog, simulated submit
    │   │   └── utils/
    │   │       └── filter-products.ts  # Client-side search/category filter helper
    │   ├── users/
    │   │   ├── index.ts          # Barrel export
    │   │   ├── components/
    │   │   │   ├── user-table.tsx        # TanStack Query table + RBAC
    │   │   │   ├── user-table-skeleton.tsx
    │   │   │   ├── invite-user-dialog.tsx  # RHF + Zod, Select role
    │   │   │   ├── invite-user-gate.tsx    # Renders children for mutation roles only
    │   │   │   ├── edit-user-dialog.tsx    # useUpdateUser, optimistic cache
    │   │   │   └── delete-user-dialog.tsx  # AlertDialog, useDeleteUser
    │   │   └── hooks/
    │   │       └── use-users.ts  # useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser
    │   ├── analytics/
    │   │   ├── components/
    │   │   │   └── analytics-skeleton.tsx
    │   │   └── hooks/
    │   │       └── use-analytics.ts  # Demo or real API, staleTime 5 min
    │   └── settings/
    │       └── components/
    │           └── settings-skeleton.tsx
    ├── server/                   # server-only — import "server-only" in each file
    │   ├── env.ts                # Zod-validated env vars, fails fast at startup
    │   ├── session.ts            # Node.js session: createSession, getSession, deleteSession
    │   ├── session-edge.ts       # Edge-safe session: encryptSession, decryptSession, refreshSession
    │   ├── api-client.ts         # Browser API client with 4-min token cache
    │   ├── api-server.ts         # Server-only API client reads session cookie
    │   ├── demo-accounts.ts      # DEMO_ACCOUNTS array, timing-safe findDemoAccount()
    │   └── rate-limit.ts         # In-memory RateLimiter class + loginRateLimiter instance
    ├── lib/
    │   ├── query-client.tsx      # QueryProvider + singleton QueryClient
    │   └── query-keys.ts         # Typed query key factory
    ├── store/
    │   └── ui.store.ts           # Zustand UIStore: sidebarOpen, toggleSidebar
    ├── types/
    │   ├── index.ts              # Re-exports all types
    │   ├── user.types.ts         # User, UserRole
    │   ├── product.types.ts      # Product, ProductRating
    │   └── api.types.ts          # ApiError
    ├── constants/
    │   └── index.ts              # SESSION_COOKIE, SESSION_DURATION_MS, APP_NAME, etc.
    ├── mocks/
    │   ├── notifications.ts      # getNotifications() — 3 static Notification objects
    │   └── analytics.ts          # getWeeklyMetrics(), getKpiMetrics() — static demo data
    ├── hooks/
    │   └── use-mobile.ts         # useIsMobile() — matchMedia at 768px
    └── utils/
        └── cn.ts                 # cn() — clsx + tailwind-merge
```

**Empty stub folders** — `src/app/login/`, `src/app/analytics/`, `src/app/products/`, `src/app/settings/`, `src/app/users/` exist as routing placeholders consumed by the route groups. They contain no files.

---

## 7. Configuration files

### `next.config.ts`

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,            // Enables React Compiler (auto-memoisation)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fakestoreapi.com", pathname: "/img/**" }
    ],
  },
}
```

When integrating into another project, these are **additive** changes — add them to, don't replace, the host's existing config.

### `components.json` (shadcn/ui)

```json
{
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/utils/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### `tsconfig.json` — key settings

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### `postcss.config.mjs`

```js
export default { plugins: { "@tailwindcss/postcss": {} } }
```

### `eslint.config.mjs`

Uses `eslint-config-next` (flat config) plus `@tanstack/eslint-plugin-query` for TanStack Query lint rules.

---

## 8. Routing & layouts

### URL routes

| URL | Route file | Layout | Type |
|-----|-----------|--------|------|
| `/login` | `src/app/(auth)/login/page.tsx` | Auth (no sidebar) | Server Component |
| `/` | `src/app/(dashboard)/page.tsx` | Dashboard shell | Server Component |
| `/analytics` | `src/app/(dashboard)/analytics/page.tsx` | Dashboard shell | **Client Component** |
| `/products` | `src/app/(dashboard)/products/page.tsx` | Dashboard shell | Server Component (async) |
| `/users` | `src/app/(dashboard)/users/page.tsx` | Dashboard shell | Server Component |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | Dashboard shell | **Client Component** |

### Layout hierarchy

```
src/app/layout.tsx           ← Root: loads Geist fonts, wraps in <Providers>
├── src/app/(auth)/layout.tsx        ← Renders children only (no shell)
│   └── login/page.tsx
└── src/app/(dashboard)/layout.tsx   ← SidebarProvider + AppSidebar + SidebarInset + AppHeader
    ├── page.tsx
    ├── analytics/page.tsx
    ├── products/page.tsx
    ├── users/page.tsx
    └── settings/page.tsx
```

### Root layout (`src/app/layout.tsx`)

- Loads `Geist` (`--font-geist-sans`) and `Geist_Mono` (`--font-geist-mono`) via `next/font/google`.
- Applies both CSS variables to `<html className>`.
- Sets `suppressHydrationWarning` on both `<html>` and `<body>` to suppress theme-related mismatches.
- Wraps `<body>` children in `<Providers>`.
- Exports `metadata` using `APP_NAME` and `APP_DESCRIPTION` from constants.

### Dashboard layout (`src/app/(dashboard)/layout.tsx`)

Server Component (no `"use client"`). Renders:
```tsx
<SidebarProvider defaultOpen>
  <AppSidebar />
  <SidebarInset className="flex min-h-screen flex-col bg-muted/30 transition-colors">
    <AppHeader />
    <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

### Route special files

Each dashboard route has these special Next.js files:

| File | Purpose | Notes |
|------|---------|-------|
| `loading.tsx` | Shown while the page suspends | Renders a feature-specific Skeleton component |
| `error.tsx` | Error boundary for the route segment | Must be `"use client"`; re-exports `RouteError` |

**Important Next.js 16 change:** `error.tsx` receives `unstable_retry` (not `reset`) as the retry prop. `RouteError` accepts `{ error: Error, unstable_retry: () => void }`.

The `export const dynamic = "force-dynamic"` directive on `/api/auth/me` and `/api/auth/token` prevents Next.js from statically caching those responses.

### `src/proxy.ts` — auth gate

Next.js 16 replaces `middleware.ts` with `proxy.ts`. The exported function must be named `proxy`.

**Responsibilities:**
1. Verifies the session JWT via `refreshSession()` (not just cookie existence).
2. Redirects unauthenticated requests to `/login` (with `callbackUrl` query param).
3. Redirects authenticated requests away from `/login` → `/`.
4. Slides the session cookie expiry on every authenticated request.

```ts
export async function proxy(request: NextRequest) { … }
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|…)…)"]
}
```

---

## 9. Authentication system

### Dual-mode architecture

```
NEXT_PUBLIC_API_BASE_URL = ""   →  Demo Mode  (local JWT, demo accounts)
NEXT_PUBLIC_API_BASE_URL = URL  →  Production (proxies to your backend)
```

`IS_DEMO_MODE` (`src/constants/index.ts`) is evaluated at build time and inlined. Changing it requires a rebuild.

### Login flow (Server Action path)

```
LoginForm (Client)
  └─ useActionState + useTransition → login() Server Action
       └─ Zod validation (LoginSchema)
            └─ findDemoAccount() — timing-safe password comparison
                 └─ mintIdentityToken() — HS256 JWT signed with SESSION_SECRET
                      └─ createSession() — seals JWT into httpOnly cookie
                           └─ redirect("/")
```

### Login flow (BFF API path)

`POST /api/auth/login`:
1. Rate limit check — 10 attempts per IP per 60 seconds (`loginRateLimiter`).
2. Zod validation of request body.
3. **Demo mode:** `findDemoAccount()` → `mintIdentityToken()` → `createSession()`.
4. **Production:** `fetch(${API_BASE_URL}/auth/login)` → seal returned `accessToken` → `createSession()`.
5. Reset rate limiter on success.

### Session cookie spec

| Property | Value |
|----------|-------|
| Name | `session` |
| Algorithm | HS256 |
| Signing key | `SESSION_SECRET` |
| Expiry | 7 days |
| `httpOnly` | `true` |
| `secure` | `true` in production |
| `sameSite` | `"strict"` |
| `path` | `"/"` |

The cookie stores a **sealed JWT** containing `{ accessToken, expiresAt }` — not the raw token directly.

### Session refresh (sliding window)

`proxy.ts` calls `refreshSession(rawToken)` on every authenticated request. This re-signs the JWT with a new `expiresAt` = now + 7 days, so active users never get logged out.

### Logout flow

```
LogoutButton (Client) → logout() Server Action → deleteSession() → redirect("/login")
```
(Also available via `POST /api/auth/logout` BFF route.)

### Session modules split

| Module | Runtime | Used by |
|--------|---------|---------|
| `src/server/session-edge.ts` | Edge + Node | `proxy.ts` — contains only `encryptSession`, `decryptSession`, `refreshSession` |
| `src/server/session.ts` | Node only | API routes, Server Actions — adds `createSession`, `getSession`, `deleteSession`, `mintIdentityToken`, `verifyIdentityToken` |

This split exists because `proxy.ts` previously ran on the Edge runtime. Both modules now target Node.js in Next.js 16.

### Demo accounts (server-only)

Defined in `src/server/demo-accounts.ts`. Uses `crypto.timingSafeEqual` for timing-safe password comparison.

```ts
{ email: "admin@example.com",   password: "Admin@1234",   role: "admin"   }
{ email: "manager@example.com", password: "Manager@1234", role: "manager" }
{ email: "viewer@example.com",  password: "Viewer@1234",  role: "viewer"  }
```

### Token cache (`apiClient`)

Client-side code needs the access token to call the backend. `apiClient` fetches it from `/api/auth/token` and caches it in memory with a 4-minute TTL. Call `invalidateBrowserTokenCache()` after logout.

---

## 10. API routes

### `POST /api/auth/login`

**File:** `src/app/api/auth/login/route.ts`

| Step | Detail |
|------|--------|
| Rate limit | 10 requests / IP / 60s — returns 429 with `Retry-After` header |
| Validation | Zod `LoginSchema` — returns 422 on failure |
| Demo mode | `findDemoAccount()` → `mintIdentityToken()` → `createSession()` → `{ ok: true }` |
| Production | `fetch(${API_BASE_URL}/auth/login)` → seal `accessToken` → `createSession()` → `{ ok: true }` |
| Error | Returns status from backend, or 503 if unreachable |

### `POST /api/auth/logout`

**File:** `src/app/api/auth/logout/route.ts`

1. Reads current session.
2. Best-effort `POST ${API_BASE_URL}/auth/logout` with Bearer token (ignored if it fails).
3. `deleteSession()` — always clears the cookie.
4. Returns `{ ok: true }` regardless.

### `GET /api/auth/me`

**File:** `src/app/api/auth/me/route.ts` — `export const dynamic = "force-dynamic"`

| Mode | Behaviour |
|------|-----------|
| No session | Returns 401 |
| Demo mode | `verifyIdentityToken()` → returns `User` shape |
| Production | Proxies `GET ${API_BASE_URL}/auth/me` with Bearer token |

### `GET /api/auth/token`

**File:** `src/app/api/auth/token/route.ts` — `export const dynamic = "force-dynamic"`

| Step | Detail |
|------|--------|
| Same-origin check | Compares `Origin` host vs `Host` header — returns 403 if mismatch |
| No session | Returns 401 |
| Success | Returns `{ accessToken: string }` |

**Security note:** XSS on the same origin can still call this endpoint. Mitigate with a strict Content-Security-Policy. Long-term: proxy all backend calls through Next.js route handlers.

---

## 11. Pages — detailed behaviour

### Login page (`/login`)

**Type:** Server Component | **File:** `src/app/(auth)/login/page.tsx`

- Split-panel layout: left branding panel (hidden on mobile, gradient background) + right form panel.
- Left panel: logo, headline, feature bullets (BarChart3, Package, Users, Shield icons), footer quote.
- Right panel: `<LoginForm>` wrapped in `<Suspense fallback={<LoginFormSkeleton />}>`.
- Below the card: demo credentials hint in `<code>` elements.
- Mobile: logo shown above the form card.
- Metadata: `title: "Sign In — Next Boiler Plate"`.

### Dashboard Overview (`/`)

**Type:** Server Component | **File:** `src/app/(dashboard)/page.tsx`

- Hero welcome banner — gradient `from-indigo-900 via-purple-900 to-zinc-950`, "Download Report" outline button + "Add New Item" gradient button (opens `AddProductDialog`).
- 4 KPI cards in a responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` grid:
  - Total Gross Revenue: `$48,290.00`, +14.2%
  - Active Users: `2,840`, +8.1%
  - Catalog Products: `240`, Active
  - Conversion Rate: `3.42%`, +0.5%
- `<DashboardCharts />` — AreaChart (revenue) + PieChart (category share).
- `<Suspense fallback={<ProductGridSkeleton />}><ProductGrid /></Suspense>` — live products from FakeStore API.

### Analytics page (`/analytics`)

**Type:** Client Component | **File:** `src/app/(dashboard)/analytics/page.tsx`

- Uses `useAnalytics()` hook — Demo mode returns mock data from `src/mocks/analytics.ts`.
- Date picker: `<Calendar>` in a `<Popover>` — fires a `sonner` info toast on selection.
- "Download Report" button fires a `sonner` success toast.
- 3 KPI cards with `<Skeleton>` loading states: Average Order Value, Customer Retention, Cart Checkout Rate.
- `BarChart` (Weekly Sales by day) and `LineChart` (Visitor Volume by day) — both guarded by `isMounted` to prevent SSR mismatch.

### Products page (`/products`)

**Type:** Server Component (async) | **File:** `src/app/(dashboard)/products/page.tsx`

- Parallel fetch: `const [products, categories] = await Promise.all([getProducts(), getCategories()])`.
- Pre-fetched data passed as props to `<ProductsClientSection>` — no client-side loading state needed.
- `ProductsClientSection` handles: search input, category filter pills, RBAC-gated "Add Product" button.
- `getProducts()` uses `next: { revalidate: 60 }` — ISR, refreshes every 60s.
- `getCategories()` uses `next: { revalidate: 3600 }` — refreshes every hour.

### Users page (`/users`)

**Type:** Server Component | **File:** `src/app/(dashboard)/users/page.tsx`

- `<UserTable>` — Client Component, fetches from TanStack Query `useUsers()`.
- Falls back to `fallbackUsers` (5 static users) when API returns empty.
- Search filter across name, email, role.
- Role badges: admin = purple, manager = indigo, user = emerald, viewer = outline.
- RBAC-gated edit/delete buttons: `data-mutation-control="edit"` / `"delete"`.
- `<InviteUserGate>` wraps the Invite button — renders `null` for non-mutation roles.
- `<EditUserDialog>` and `<DeleteUserDialog>` rendered outside the table to avoid DOM nesting issues.

### Settings page (`/settings`)

**Type:** Client Component | **File:** `src/app/(dashboard)/settings/page.tsx`

4-tab layout using shadcn `<Tabs>`:

| Tab | Icon | Form fields | Submit action |
|-----|------|-------------|---------------|
| General | Sliders | App Name, Support Email, 2 Switch toggles | `sonner` success toast |
| Profile | User | Full Name, Email | `sonner` success toast |
| Notifications | Bell | 3 Switch toggles | No submit (live switches) |
| Security | Shield | Current Password, New Password | `sonner` success toast + form reset |

All forms use `react-hook-form` + `zod` with inline `<FieldError>` components.

---

## 12. Component catalogue

### Layout components (`src/components/layout/`)

#### `AppSidebar` — Client Component

**File:** `src/components/layout/app-sidebar.tsx`

Collapsible icon sidebar (`collapsible="icon"`). When collapsed, labels and badges hide via `group-data-[collapsible=icon]:hidden`.

**Nav groups:**

| Group | Items |
|-------|-------|
| Overview | Dashboard (`/`, badge: "Live"), Analytics (`/analytics`) |
| Management | Products (`/products`, badge: "20+"), Users (`/users`) |
| System | Settings (`/settings`) |

Active item: `bg-primary text-primary-foreground shadow-md shadow-primary/25`.

**Footer:** Avatar with gradient initials + display name + email + `<LogoutButton>`.

Reads `useAuthStore` for the current user's name/email. Uses `usePathname()` for active state detection.

#### `AppHeader` — Client Component

**File:** `src/components/layout/app-header.tsx`

Sticky header (`sticky top-0 z-30`), `backdrop-blur-md`.

| Section | Contents |
|---------|---------|
| Left | `SidebarTrigger` (tooltip) + separator + breadcrumb (Panel › PageTitle) |
| Right | `ThemeToggle` + Notifications popover + separator + user avatar pill |

**Notifications popover:**
- Initialised from `getNotifications()` in `React.useState`.
- Unread count shown as animated `pulse` badge on bell icon.
- "Mark read" button sets all `unread: false`.
- Each notification: icon + title + timestamp + description.

**User pill:** Avatar with gradient initials + name + role (hidden below `xl` breakpoint).

Calls `useCurrentUser()` on mount to hydrate the Zustand auth store.

#### `PageHeader` — Client Component

**File:** `src/components/layout/page-header.tsx`

**Props:**
```ts
{ title: string; description?: string; badge?: string; children?: React.ReactNode }
```

Renders: `h1` + optional badge pill + optional description + optional action slot (right side).

---

### Common components (`src/components/common/`)

#### `ThemeToggle` — Client Component

**File:** `src/components/common/theme-toggle.tsx`

Uses `useTheme()` from `next-themes`. Renders a skeleton pulse while not mounted (avoids hydration mismatch). Toggles Sun/Moon icons with a smooth transition.

#### `RouteError` — Client Component

**File:** `src/components/common/route-error.tsx`

**Props:**
```ts
{ error: Error & { digest?: string }; unstable_retry: () => void }
```

Shows an `AlertCircle` icon, error message, optional error digest (for support), and a "Try again" button that calls `unstable_retry`.

All `error.tsx` files in the dashboard routes re-export this as the default export.

---

### Providers (`src/components/providers/index.tsx`)

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <QueryProvider>                         // TanStack Query
    {children}
    <Toaster position="bottom-right" richColors closeButton />   // sonner
  </QueryProvider>
</ThemeProvider>
```

Mounted once in the root layout. All three wrappers are Client Components.

---

### Dashboard charts (`src/components/dashboard/dashboard-charts.tsx`)

**Type:** Client Component — mount-guarded with `isMounted` state.

**AreaChart** — Revenue Growth (6 months static data):
- Months: Jan–Jun with `revenue` and `target` series.
- Colours: primary purple (`#8b5cf6`) for revenue, indigo for target.

**PieChart** — Category Share (5 slices: Electronics, Clothing, Jewelry, Men's, Women's).

Both charts use `<ResponsiveContainer width="100%" height="100%">`.

---

### shadcn/ui components (`src/components/ui/`)

| Component file | Used in |
|----------------|---------|
| `alert-dialog.tsx` | `DeleteUserDialog` — confirm destructive action |
| `attachment.tsx` | `AddProductDialog` — file/image attachment preview |
| `avatar.tsx` | Sidebar footer, AppHeader user pill, UserTable rows |
| `badge.tsx` | KPI cards, nav badges, role badges, page header pills |
| `button.tsx` | Throughout — all interactive buttons |
| `calendar.tsx` | `AddProductDialog` and `InviteUserDialog` date pickers; Analytics date filter |
| `card.tsx` | KPI cards, chart cards, settings tab cards |
| `chart.tsx` | Recharts wrapper utilities |
| `combobox.tsx` | `AddProductDialog` — category selector |
| `dialog.tsx` | `AddProductDialog`, `InviteUserDialog`, `EditUserDialog` |
| `input-group.tsx` | Form fields with icon prefixes |
| `input.tsx` | All text inputs |
| `popover.tsx` | Notifications popover, Analytics date picker |
| `select.tsx` | `InviteUserDialog` role selector |
| `separator.tsx` | AppHeader divider, Settings form sections |
| `sheet.tsx` | Available for mobile drawers |
| `sidebar.tsx` | Full sidebar primitive (from shadcn) |
| `skeleton.tsx` | Loading states throughout |
| `sonner.tsx` | Toaster wrapper (re-export from sonner) |
| `spinner.tsx` | Loading spinner utility |
| `switch.tsx` | Settings toggles |
| `table.tsx` | `UserTable` |
| `tabs.tsx` | Settings page 4-tab layout |
| `textarea.tsx` | Available for form text areas |
| `tooltip.tsx` | Sidebar item tooltips (icon mode), ThemeToggle tooltip, SidebarTrigger tooltip |

---

## 13. Data fetching & state management

### Dual API client pattern

| Client | File | Runtime | Token source | Used by |
|--------|------|---------|-------------|---------|
| `apiClient` | `src/server/api-client.ts` | Browser | `/api/auth/token` (4-min TTL cache) | Client Components via TanStack Query hooks |
| `apiServer` | `src/server/api-server.ts` | Node.js (server-only) | `getSession()` cookie | Server Components, Route Handlers |

**`apiClient` token caching:**
```ts
// 4-minute in-memory token cache (module-level variable)
let _tokenCache: { value: string; expiresAt: number } | null = null
```
On every request, `getBrowserToken()` checks the cache before hitting `/api/auth/token`. Call `invalidateBrowserTokenCache()` after logout.

`apiClient` exposes: `.get<T>()`, `.post<T, B>()`, `.put<T, B>()`, `.patch<T, B>()`, `.delete<T>()`.

### QueryProvider (`src/lib/query-client.tsx`)

- **Browser:** module-level singleton — one `QueryClient` for the full session.
- **SSR:** fresh instance per request — prevents cross-request data leakage.
- Default options: `staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false`.
- Includes `<ReactQueryDevtools>` in development.

### Query key factory (`src/lib/query-keys.ts`)

```ts
queryKeys.auth.me                            // ["auth", "me"]
queryKeys.users.all                          // ["users"]
queryKeys.users.list(filters?)               // ["users", "list", filters?]
queryKeys.users.detail(id)                   // ["users", "detail", id]
queryKeys.products.all                       // ["products"]
queryKeys.products.list()                    // ["products", "list"]
queryKeys.products.detail(id)               // ["products", "detail", id]
queryKeys.products.byCategory(category)     // ["products", "category", category]
queryKeys.products.categories               // ["products", "categories"]
```

### Hooks

#### `useCurrentUser` (`src/features/auth/hooks/use-current-user.ts`)

- `queryKey: queryKeys.auth.me`
- Fetches `GET /api/auth/me` with `credentials: "include"`.
- `staleTime: 5 * 60 * 1000`, `retry: false`, `refetchOnWindowFocus: true`.
- On success: `setUser(data)` in Zustand.
- On error: `clearUser()` in Zustand.
- Called inside `AppHeader` on mount.

#### `useUsers` / `useUser` / `useCreateUser` / `useUpdateUser` / `useDeleteUser`

**File:** `src/features/users/hooks/use-users.ts`

| Hook | Query/Mutation | Demo mode behaviour |
|------|---------------|---------------------|
| `useUsers()` | Query `users.list()` | Calls `apiClient.get("/users")` — falls back to `fallbackUsers` in `UserTable` |
| `useUser(id)` | Query `users.detail(id)` | Real API call |
| `useCreateUser()` | Mutation | Real API call → `invalidateQueries(users.all)` |
| `useUpdateUser(id)` | Mutation | **Demo:** optimistic `setQueryData` — no network call |
| `useDeleteUser()` | Mutation | **Demo:** optimistic filter from cache — no network call |

#### `useAnalytics` (`src/features/analytics/hooks/use-analytics.ts`)

- `queryKey: ["analytics", "dashboard"]`
- `staleTime: 5 * 60 * 1000`
- Demo mode: `Promise.resolve({ weekly: getWeeklyMetrics(), kpi: getKpiMetrics() })`
- Production: `apiClient.get<AnalyticsData>("/analytics")`

#### `useRole` / `isMutationRole` (`src/features/auth/hooks/use-role.ts`)

```ts
export function useRole(): UserRole          // reads from useAuthStore, defaults "viewer"
export function isMutationRole(role): boolean // true for "admin" | "manager"
```

### Zustand stores

#### `useAuthStore` (`src/features/auth/store.ts`)

```ts
interface AuthState  { user: User | null }
interface AuthActions { setUser(user: User): void; clearUser(): void }
```
- DevTools name: `"AuthStore"`.
- NOT persisted to `localStorage`.
- Server session is the source of truth.

#### `useUIStore` (`src/store/ui.store.ts`)

```ts
interface UIState   { sidebarOpen: boolean }
interface UIActions { toggleSidebar(): void; setSidebarOpen(open: boolean): void }
```
- DevTools name: `"UIStore"`.

### Product services (`src/features/products/services.ts`)

```ts
getProducts()                         // GET /products,             revalidate: 60s
getProduct(id: number)                // GET /products/:id,          revalidate: 60s
getProductsByCategory(category)       // GET /products/category/:c,  revalidate: 60s
getCategories()                       // GET /products/categories,   revalidate: 3600s
```

All hit `PRODUCTS_BASE_URL` (default: `https://fakestoreapi.com`). Used in Server Components only.

### Rate limiter (`src/server/rate-limit.ts`)

In-memory sliding-window `RateLimiter` class. Suitable for single-instance deployments. For multi-instance/edge, replace with Upstash Redis or Vercel KV.

```ts
export const loginRateLimiter = new RateLimiter({ windowMs: 60_000, max: 10 })
```

---

## 14. Design system & CSS tokens

### Tailwind v4 setup (`src/app/globals.css`)

```css
@import "tailwindcss";          /* Core Tailwind v4 — no config file needed */
@import "tw-animate-css";       /* Animation utilities */
@import "shadcn/tailwind.css";  /* shadcn base styles */

@custom-variant dark (&:is(.dark *));  /* Dark mode via next-themes "class" on <html> */
```

The `@custom-variant dark` directive means any Tailwind `dark:` utility applies when an ancestor has class `.dark`. `next-themes` adds this class to `<html>` when dark mode is active.

### `@theme inline` block — Tailwind v4 CSS variable bridge

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);          /* Resolves to Geist via --font-geist-sans */
  --font-mono: var(--font-geist-mono);
  /* … all shadcn token names mapped here … */
}
```

This bridges the shadcn CSS custom property names to Tailwind v4's `--color-*` convention.

### Light mode tokens (`:root`)

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0.99 0 0)` | Near-white page background |
| `--foreground` | `oklch(0.13 0 0)` | Near-black text |
| `--card` | `oklch(1 0 0)` | Pure white card surface |
| `--popover` | `oklch(1 0 0)` | Pure white popover surface |
| `--primary` | `oklch(0.558 0.228 296.98)` | **Purple-600** — brand colour |
| `--primary-foreground` | `oklch(1 0 0)` | White text on primary |
| `--secondary` | `oklch(0.96 0.008 296.98)` | Light purple tint |
| `--secondary-foreground` | `oklch(0.42 0.15 296.98)` | Medium purple |
| `--muted` | `oklch(0.965 0 0)` | Light grey muted surface |
| `--muted-foreground` | `oklch(0.52 0.01 0)` | Subdued text |
| `--accent` | `oklch(0.96 0.008 296.98)` | Same as secondary |
| `--accent-foreground` | `oklch(0.558 0.228 296.98)` | Primary purple on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red-500 equivalent |
| `--border` | `oklch(0.91 0.005 296.98)` | Light purple-tinted border |
| `--input` | `oklch(0.91 0.005 296.98)` | Input border |
| `--ring` | `oklch(0.558 0.228 296.98)` | Focus ring — primary purple |
| `--chart-1` | `oklch(0.558 0.228 296.98)` | Purple |
| `--chart-2` | `oklch(0.55 0.224 264.376)` | Indigo |
| `--chart-3` | `oklch(0.65 0.218 340)` | Pink |
| `--chart-4` | `oklch(0.6 0.213 230)` | Blue |
| `--chart-5` | `oklch(0.64 0.182 150)` | Emerald |
| `--radius` | `0.625rem` | Base border radius (10px) |
| `--sidebar` | `oklch(0.985 0.003 296.98)` | Very light purple sidebar |
| `--sidebar-primary` | `oklch(0.558 0.228 296.98)` | Active nav item — purple |

### Dark mode tokens (`.dark`)

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0.1 0.005 296.98)` | Very dark purple-black |
| `--card` | `oklch(0.14 0.007 296.98)` | Dark card surface |
| `--primary` | `oklch(0.72 0.195 296.98)` | Lighter purple in dark mode |
| `--border` | `oklch(1 0 0 / 10%)` | White at 10% opacity |
| `--input` | `oklch(1 0 0 / 12%)` | White at 12% opacity |
| `--sidebar` | `oklch(0.13 0.008 296.98)` | Dark sidebar |

### Radius scale

| Token | Value | Approx |
|-------|-------|--------|
| `--radius-sm` | `calc(var(--radius) * 0.6)` | ~6px |
| `--radius-md` | `calc(var(--radius) * 0.8)` | ~8px |
| `--radius-lg` | `var(--radius)` | 10px |
| `--radius-xl` | `calc(var(--radius) * 1.4)` | ~14px |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` | ~18px |

### Base layer styles

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  html { @apply font-sans scroll-smooth; }
  body { @apply bg-background text-foreground; }
  :focus-visible { @apply outline-2 outline-offset-2 outline-ring rounded-sm; }
}
```

### Custom scrollbar

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { @apply bg-transparent; }
::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
::-webkit-scrollbar-thumb:hover { @apply bg-muted-foreground/40; }
```

### Utility animations

```css
@layer utilities {
  .animate-in { animation: fade-in 0.3s ease-out both; }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}
```

Used on the dashboard `<main>` wrapper for a subtle page-enter animation.

### Typography

Fonts loaded in `src/app/layout.tsx`:
- `Geist` — variable `--font-geist-sans`, subset `latin` → maps to `--font-sans` → Tailwind `font-sans`
- `Geist_Mono` — variable `--font-geist-mono`, subset `latin` → maps to `--font-mono`

### `cn` utility (`src/utils/cn.ts`)

```ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

Safely merges Tailwind class strings. Use wherever conditional classes are needed.

### `useIsMobile` (`src/hooks/use-mobile.ts`)

```ts
const MOBILE_BREAKPOINT = 768   // matches Tailwind's md: breakpoint
export function useIsMobile(): boolean
```

Listens to `window.matchMedia` for changes. Returns `true` below 768px.

---

## 15. RBAC & permission model

### Roles

| Role | Mutations | Description |
|------|-----------|-------------|
| `admin` | Yes | Full access, all create/update/delete operations |
| `manager` | Yes | Full access, all create/update/delete operations |
| `user` | No | Read-only |
| `viewer` | No | Read-only (default when unauthenticated) |

### `isMutationRole(role)`

```ts
// src/features/auth/hooks/use-role.ts
export function isMutationRole(role: UserRole): boolean {
  return role === "admin" || role === "manager"
}
```

### Gates

| Gate | Location | Behaviour |
|------|----------|-----------|
| `InviteUserGate` | `src/features/users/components/invite-user-gate.tsx` | Returns `null` for non-mutation roles — removes element from DOM entirely |
| `canMutate` check | `UserTable` | Conditionally renders edit/delete buttons |
| `canMutate` check | `ProductsClientSection` | Conditionally renders "Add Product" button |

### `data-mutation-control` attribute

RBAC-gated buttons carry a `data-mutation-control` attribute for testing and auditing:

```tsx
<Button data-mutation-control="add-product" …>Add Product</Button>
<Button data-mutation-control="edit" …>Edit</Button>
<Button data-mutation-control="delete" …>Delete</Button>
```

### Demo mode caveat

In Demo Mode, RBAC is enforced client-side only. In production, the backend is the authoritative gate — the client-side gates are purely UX improvements.

---

## 16. Types reference

### `User` (`src/types/user.types.ts`)

```ts
type UserRole = "admin" | "manager" | "user" | "viewer"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string   // ISO date string
}
```

### `Product` (`src/types/product.types.ts`)

```ts
interface ProductRating {
  rate: number    // 0–5
  count: number   // number of ratings
}

interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string       // absolute URL — must be in next.config.ts remotePatterns
  rating: ProductRating
}
```

### `ApiError` (`src/types/api.types.ts`)

```ts
interface ApiError {
  status: number
  message?: string
  errors?: Record<string, string[]>
}
```

### `Notification` (`src/mocks/notifications.ts`)

```ts
interface Notification {
  id: string
  title: string
  desc: string
  time: string          // human-readable e.g. "5m ago"
  icon: LucideIcon      // Lucide icon component reference
  unread: boolean
  color: string         // Tailwind class string e.g. "text-purple-500 bg-purple-100"
}
```

### `SessionPayload` (`src/server/session-edge.ts`)

```ts
interface SessionPayload {
  accessToken: string
  expiresAt: number   // Unix timestamp ms
}
```

### `IdentityPayload` (`src/server/session.ts`)

```ts
interface IdentityPayload {
  sub: string       // user ID
  email: string
  name: string
  role: string
  demo?: boolean    // true for demo-mode tokens
}
```

### `WeeklyMetric` / `KpiMetrics` (`src/mocks/analytics.ts`)

```ts
interface WeeklyMetric {
  day: string       // "Mon" | "Tue" | … | "Sun"
  sales: number     // dollars
  visitors: number
}

interface KpiMetrics {
  averageOrderValue: number    // dollars
  customerRetention: number    // 0–100 percentage
  cartCheckoutRate: number     // 0–100 percentage
}
```

---

## 17. Demo & mock data

### Notifications (`src/mocks/notifications.ts`)

| ID | Title | Icon | Unread | Color classes |
|----|-------|------|--------|--------------|
| 1 | New Inventory Restock | Package | true | `text-purple-500 bg-purple-100` |
| 2 | User Role Elevated | UserPlus | true | `text-indigo-500 bg-indigo-100` |
| 3 | Security Telemetry Alert | ShieldAlert | false | `text-emerald-500 bg-emerald-100` |

### Analytics mock data (`src/mocks/analytics.ts`)

**Weekly metrics:**

| Day | Sales ($) | Visitors |
|-----|-----------|---------|
| Mon | 4,200 | 1,200 |
| Tue | 5,800 | 1,600 |
| Wed | 7,100 | 2,100 |
| Thu | 6,400 | 1,850 |
| Fri | 9,200 | 2,800 |
| Sat | 11,400 | 3,400 |
| Sun | 8,900 | 2,600 |

**KPI metrics:** AOV: $142.50 | Retention: 68.4% | Checkout Rate: 82.1%

### Fallback users (`UserTable`)

5 static users seeded in the table when the API returns no results. Names: Alex Morgan (admin), Sarah Chen (manager), Michael Scott (user), Elena Rostova (manager), David Kim (viewer).

---

## 18. Additive integration guide

Follow these steps to integrate the dashboard into an existing Next.js project **without modifying the host project's existing code**.

### Step 1 — Copy source files

Copy the following into the target project (maintaining the same relative paths under `src/`):

```
src/proxy.ts
src/app/(auth)/
src/app/(dashboard)/
src/app/api/auth/
src/app/globals.css        ← merge into existing, do NOT replace
src/components/ui/
src/components/layout/
src/components/common/
src/components/dashboard/
src/components/providers/
src/features/
src/server/
src/lib/
src/store/
src/types/
src/constants/
src/mocks/
src/hooks/
src/utils/cn.ts
```

### Step 2 — Install dependencies

```bash
npm install next-themes sonner @tanstack/react-query @tanstack/react-query-devtools \
  @tanstack/react-table zustand react-hook-form @hookform/resolvers zod \
  recharts date-fns react-day-picker jose lucide-react \
  clsx tailwind-merge class-variance-authority @base-ui/react shadcn \
  tw-animate-css

npm install -D @tailwindcss/postcss babel-plugin-react-compiler \
  @tanstack/eslint-plugin-query
```

### Step 3 — Update `next.config.ts`

Add these to the existing config object (additive — do not remove existing settings):

```ts
const nextConfig: NextConfig = {
  // … existing config …
  reactCompiler: true,
  images: {
    remotePatterns: [
      // … existing patterns …
      { protocol: "https", hostname: "fakestoreapi.com", pathname: "/img/**" },
    ],
  },
}
```

### Step 4 — Update `globals.css`

**At the top**, add the Tailwind v4 import chain (replace any existing `@tailwind` directives):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
```

Then add the full `@theme inline` block and `:root` / `.dark` token definitions from `src/app/globals.css`. If the host project already has CSS variables, use a scoped approach: wrap panel tokens in a `[data-panel]` attribute selector and apply it to the admin layout's root element.

### Step 5 — Update `postcss.config.mjs`

```js
export default { plugins: { "@tailwindcss/postcss": {} } }
```

### Step 6 — Update root layout

In the host project's root `src/app/layout.tsx`, wrap `<body>` children with the `<Providers>` component:

```tsx
import { Providers } from "@/components/providers"   // or @panel/components/providers

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}    {/* existing children remain unchanged */}
        </Providers>
      </body>
    </html>
  )
}
```

If the host already uses `ThemeProvider` or `QueryClientProvider`, nest them carefully to avoid duplicates. The panel's `<Providers>` can be moved to the `(dashboard)` layout instead, if the host layout cannot be changed.

### Step 7 — Handle `proxy.ts`

Place `src/proxy.ts` at the `src/` level of the target project. If a `proxy.ts` already exists, merge the two:
- Combine the `config.matcher` patterns.
- The panel's auth logic (session check, redirect) must run for `/admin/**` paths (or wherever you mount the dashboard).
- Leave existing middleware logic for other paths unchanged.

### Step 8 — Configure `.env.local`

```bash
SESSION_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))">
NEXT_PUBLIC_API_BASE_URL=          # leave empty for Demo Mode
PRODUCTS_API_BASE_URL=             # optional
```

Regenerate `SESSION_SECRET` for each deployment environment.

### Step 9 — Route prefix adjustment (if mounting at `/admin`)

If mounting the dashboard under `/admin` instead of the root:
1. Move `src/app/(auth)/` and `src/app/(dashboard)/` inside `src/app/admin/`.
2. Update `PUBLIC_PATHS` in `src/constants/index.ts`: `["/admin/login"]`.
3. Update sidebar `url`s in `AppSidebar` to include the `/admin` prefix.
4. Update `redirect("/")` calls in `login()` action and `proxy.ts` to `redirect("/admin")`.
5. Update `proxy.ts` matcher and redirect targets to use `/admin/login`.
6. Update the `callbackUrl` logic in `proxy.ts`.

### Step 10 — (Optional) TanStack Query merge

If the host project already uses TanStack Query, avoid a duplicate `<QueryClientProvider>`:
- Remove `<QueryProvider>` from the panel's `<Providers>`.
- Use the host's existing provider, but verify the default options match (`staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false`).

---

## 19. Verification checklist

After integration, verify these items:

- [ ] `/login` (or `/admin/login`) loads the split-panel sign-in page
- [ ] Login with `admin@example.com` / `Admin@1234` redirects to the dashboard
- [ ] The sidebar renders with all 5 nav items and the collapsible toggle works
- [ ] The AppHeader shows breadcrumb, theme toggle, notifications bell, and user avatar
- [ ] Dashboard overview (`/`) shows KPI cards, charts, and product grid
- [ ] Analytics page (`/analytics`) shows bar chart + line chart + KPI cards
- [ ] Products page (`/products`) shows the catalog grid with search and filters
- [ ] Users page (`/users`) shows the team table with role badges
- [ ] Settings page (`/settings`) shows all 4 tabs and saves fire `sonner` toasts
- [ ] Dark mode toggle switches between light and dark themes
- [ ] Sidebar collapses to icon mode on toggle
- [ ] Logging in as `viewer@example.com` hides Add/Edit/Delete buttons
- [ ] Logout clears session and redirects to `/login`
- [ ] Unauthenticated access to `/` (or `/admin`) redirects to login
- [ ] Host project's existing pages/routes are unchanged
- [ ] No browser console errors on any page

---

## 20. Key files for agents

| Concern | File |
|---------|------|
| Auth gate (Next.js 16) | `src/proxy.ts` |
| Session JWT (Node.js) | `src/server/session.ts` |
| Session JWT (Edge-safe) | `src/server/session-edge.ts` |
| Env validation | `src/server/env.ts` |
| Demo accounts | `src/server/demo-accounts.ts` |
| Rate limiter | `src/server/rate-limit.ts` |
| Login Server Action | `src/features/auth/actions.ts` |
| Auth validation schema | `src/features/auth/validations.ts` |
| Auth Zustand store | `src/features/auth/store.ts` |
| RBAC hook | `src/features/auth/hooks/use-role.ts` |
| Dashboard shell layout | `src/app/(dashboard)/layout.tsx` |
| Sidebar | `src/components/layout/app-sidebar.tsx` |
| Header | `src/components/layout/app-header.tsx` |
| Providers wrapper | `src/components/providers/index.tsx` |
| Query client | `src/lib/query-client.tsx` |
| Query key factory | `src/lib/query-keys.ts` |
| Browser API client | `src/server/api-client.ts` |
| Product services | `src/features/products/services.ts` |
| User hooks | `src/features/users/hooks/use-users.ts` |
| Theme tokens | `src/app/globals.css` |
| Constants | `src/constants/index.ts` |
| shadcn config | `components.json` |
| Next.js config | `next.config.ts` |

---

## 21. AI Integration Prompt

Paste the section below to an AI agent working in the **existing website** repository.

---

### Mission

Integrate the **Next Boiler Plate** admin dashboard into this monorepo / website as a separate admin area. The public marketing website must keep working completely unchanged. The panel becomes the authenticated admin section, recommended under `/admin`.

You have the full source of `next-boiler-plate` (this README is the complete reference). Treat it as the **source of truth** for dashboard architecture, components, and packages.

### Absolute non-negotiables

1. **Do not modify, delete, or rename any existing website code** unless required for a mechanical mount (adding one import in root layout for providers scoped to admin only). Prefer **zero edits** to public pages, public components, and public styles.
2. **Never overwrite shared names.** If the website has `Button`, `Input`, `Card`, `cn`, or `Providers`, the panel must live in an **isolated namespace** so both coexist.
3. **Do not merge shadcn UI trees.** Keep website UI and panel UI in separate folders.
4. Prefer **additive** changes: new folders, new route groups, new deps, new env keys.
5. Read **Next.js 16** docs in `node_modules/next/dist/docs/` before using any API. Use `proxy.ts` (not `middleware.ts`).
6. Ship **production-grade SEO** for both surfaces.

### Isolation strategy

```text
src/
  app/
    (marketing)/…          # EXISTING — do not touch
    admin/
      (auth)/login/…
      (dashboard)/…
      api/auth/…
  panel/                   # ALL panel code (copied from next-boiler-plate/src)
    components/ui/
    components/layout/
    features/
    server/
    lib/
    store/
    types/
    constants/
    mocks/
    hooks/
    utils/
    styles/panel.css       # panel tokens scoped to [data-panel]
```

Path aliases:
```json
{ "paths": { "@/*": ["./src/*"], "@panel/*": ["./src/panel/*"] } }
```

Rewrite every panel import from `@/…` → `@panel/…`.

### Route mapping

| Panel standalone | Host app |
|-----------------|---------|
| `/login` | `/admin/login` |
| `/` | `/admin` |
| `/analytics` | `/admin/analytics` |
| `/products` | `/admin/products` |
| `/users` | `/admin/users` |
| `/settings` | `/admin/settings` |
| `/api/auth/*` | `/api/admin/auth/*` |

Update `PUBLIC_PATHS`, sidebar URLs, redirects in `proxy.ts`, `login()` action, and `callbackUrl` to match the prefix.

### CSS isolation

Do not dump panel `:root` variables over the website theme. Instead:
1. Wrap the admin layout root in `<div data-panel>`.
2. Scope all panel tokens under `[data-panel] { … }` and `.dark [data-panel] { … }`.
3. Load `panel.css` only from the admin layout — not from the root layout.

### SEO

**Marketing pages:** unique `metadata`, `metadataBase`, OG/Twitter cards, `sitemap.ts` including only public URLs, JSON-LD structured data, `robots.ts` allowing public pages.

**Admin pages:**
```ts
export const metadata = {
  robots: { index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false } },
  title: { default: "Admin", template: "%s · Admin" },
}
```

Exclude `/admin` and `/api/admin` from `sitemap.ts`. Add `Disallow: /admin` to `robots.ts`.

### Implementation checklist

- [ ] Copy panel `src` into isolated `src/panel` with updated `@panel/*` imports
- [ ] Mount routes under `/admin` with auth + dashboard layouts
- [ ] Wire `proxy.ts`: protect `/admin/*`, allow `/admin/login`, leave marketing public
- [ ] Scope panel CSS/theme to `[data-panel]`
- [ ] Scope `<Providers>` to admin layout only
- [ ] Update constants, nav links, redirects, API paths for `/admin` prefix
- [ ] Add `.env.local` keys: `SESSION_SECRET`, optional API URLs
- [ ] Marketing SEO: metadata, sitemap, robots, structured data
- [ ] Admin SEO: `noindex`, absent from sitemap, absent from robots.txt public allow list
- [ ] Smoke test: marketing home unchanged; `/admin/login` works; `/admin` shows sidebar; logout clears session
- [ ] Do not commit secrets; do not touch unrelated website files

### Definition of done

1. Public website looks and behaves exactly as before.
2. Admin is reachable at `/admin`, authenticated, with sidebar + header + all panel pages.
3. No UI import collisions; website and panel each use their own component trees.
4. Marketing is SEO-optimised; admin has `noindex` and is absent from sitemap.
5. Short summary: files added, files touched (minimal), env vars required, how to run.

---

## License / status

`"private": true`. Demo auth and FakeStore catalog are placeholders — replace with a production backend before handling real user data. `SESSION_SECRET` must be regenerated for every deployment environment.
