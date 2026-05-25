# CMA Pro Web — Architecture & Data Flow

## Overview

CMA Pro Web is a Next.js 16 application that lets real estate agents generate Comparative Market Analysis reports. It uses Supabase for auth and storage, and Rentcast for live comparable sales data.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                             │
│   React Components  ──►  Zustand Store (CMA wizard state)  │
│   (Mantine UI)            lib/store.ts                      │
└──────────────┬──────────────────────────┬───────────────────┘
               │ HTTP requests            │ Supabase JS client
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│   Next.js Server     │    │         Supabase                │
│                      │    │                                 │
│  proxy.ts            │    │  Auth (JWT cookies)             │
│  (middleware)        │    │  cma_reports table (Postgres)   │
│                      │    │  Row-Level Security             │
│  /api/zillow         │    └─────────────────────────────────┘
│  (route handler)     │
└──────────┬───────────┘
           │ Server-side fetch
           ▼
┌─────────────────────┐
│   Rentcast API      │
│   api.rentcast.io   │
│                     │
│  /v1/listings/sale  │
│  Recently sold      │
│  residential comps  │
└─────────────────────┘
```

---

## 1. Authentication Flow

Every request passes through `proxy.ts` (Next.js middleware) before reaching a page.

```
User visits any page
        │
        ▼
┌───────────────────┐
│   proxy.ts        │
│   (middleware)    │
│                   │
│  Has env vars?    │──── No ──► Pass through (build-time safety)
│                   │
│  Yes              │
│         │         │
│         ▼         │
│  Supabase         │
│  getUser()        │
│  (reads JWT       │
│   from cookie)    │
└───────┬───────────┘
        │
   ┌────┴────┐
   │         │
No user    Has user
   │         │
   ▼         ▼
Redirect  On /login    Not on
/login    or           /login or
          /register?   /register?
             │              │
             ▼              ▼
         Redirect       Allow
         /dashboard      through
```

**Login sequence:**

```
Browser                  Next.js              Supabase
   │                        │                    │
   │── POST /login ─────────►                    │
   │   (email + password)   │                    │
   │                        │── signInWithPassword►
   │                        │                    │
   │                        │◄── JWT session ────│
   │                        │                    │
   │◄── Set-Cookie ─────────│                    │
   │    (sb-* auth cookie)  │                    │
   │                        │                    │
   │── GET /dashboard ──────►                    │
   │                        │── getUser() ───────►
   │                        │◄── user object ────│
   │◄── Dashboard HTML ─────│                    │
```

---

## 2. New CMA Wizard Flow

The 4-step wizard stores all state in Zustand (`lib/store.ts`) on the client. Nothing is saved to the database until the agent clicks **Save Report**.

```
Step 1: Subject Property
┌─────────────────────────────┐
│  Agent fills in:            │
│  • Address (street/city/    │
│    state/zip)               │
│  • Beds, baths, sqft        │
│  • Year built, condition    │
│  • Client name/email        │
│                             │
│  → Saved to Zustand store   │
└──────────────┬──────────────┘
               │ onNext()
               ▼
Step 2: Comparables
┌─────────────────────────────┐
│  Browser fetches comps:     │
│                             │
│  POST /api/zillow           │
│  { zip, beds, baths, sqft } │
│           │                 │
│           ▼                 │
│  Next.js route handler      │
│  reads rentcast_key from    │
│  Supabase user_metadata     │
│           │                 │
│           ▼                 │
│  GET api.rentcast.io        │
│  /v1/listings/sale          │
│  ?zipCode=&bedrooms=        │
│  &squareFootage=&           │
│  status=Inactive            │
│           │                 │
│           ▼                 │
│  Returns up to 15 sold      │
│  comps → stored in Zustand  │
│                             │
│  Agent toggles which comps  │
│  to include                 │
└──────────────┬──────────────┘
               │ onNext()
               ▼
Step 3: Adjustments
┌─────────────────────────────┐
│  Agent reviews each comp:   │
│  • Adds dollar adjustments  │
│    (pool, condition, sqft   │
│     differences, etc.)      │
│  • Adds notes per comp      │
│                             │
│  Avg adjusted price updates │
│  live as values change      │
│                             │
│  → Updates stored in        │
│    Zustand (no API call)    │
└──────────────┬──────────────┘
               │ onNext()
               ▼
Step 4: Report + Save
┌─────────────────────────────┐
│  CMA math runs client-side  │
│  (lib/cma.ts):              │
│                             │
│  • calcMarketStats()        │
│    avg price, median,       │
│    avg $/sqft, avg DOM,     │
│    list-to-sale ratio       │
│                             │
│  • calcSuggestedRange()     │
│    base = avg adjusted      │
│    low  = base × 0.97       │
│    high = base × 1.03       │
│                             │
│  Agent clicks Save Report:  │
│                             │
│  INSERT cma_reports         │──► Supabase Postgres
│  { agent_id, subject,       │    (RLS: only this
│    comps, market_stats,     │     agent can read)
│    suggested_price,         │
│    client_name/email }      │
└─────────────────────────────┘
```

---

## 3. Comparable Fetch (API Proxy)

The Rentcast API key is never exposed to the browser. The route handler reads it server-side.

```
Browser                Next.js /api/zillow         Rentcast API
   │                           │                        │
   │── POST /api/zillow ───────►                        │
   │   { zip, beds, baths,     │                        │
   │     sqft }                │                        │
   │                           │── getUser() ──► Supabase
   │                           │◄── user.user_metadata.rentcast_key
   │                           │
   │                           │── GET /v1/listings/sale ──────────►
   │                           │   ?zipCode=90210                   │
   │                           │   &bedrooms=3                      │
   │                           │   &squareFootage=1440-2400         │
   │                           │   &status=Inactive                 │
   │                           │   &limit=15                        │
   │                           │                                    │
   │                           │◄── Array of sold listings ─────────│
   │                           │    { addressLine1, city, state,    │
   │                           │      bedrooms, bathrooms,          │
   │                           │      squareFootage, price,         │
   │                           │      daysOnMarket, removedDate }   │
   │                           │                                    │
   │                           │  Map to Comparable type            │
   │                           │  (lib/cma.ts)                      │
   │◄── { comps: [...] } ──────│
```

---

## 4. Dashboard (Server-Side Render)

```
Browser                  Next.js Server             Supabase
   │                           │                        │
   │── GET /dashboard ─────────►                        │
   │                           │  createClient()        │
   │                           │  (server, reads cookie)│
   │                           │── SELECT * FROM ───────►
   │                           │   cma_reports          │
   │                           │   WHERE agent_id =     │
   │                           │   auth.uid()           │
   │                           │   ORDER BY created_at  │
   │                           │◄── reports[] ──────────│
   │                           │                        │
   │                           │  Render HTML with      │
   │                           │  report cards          │
   │◄── HTML (SSR) ────────────│
```

---

## 5. Data Schema

```
Supabase: cma_reports table
┌──────────────────┬───────────┬──────────────────────────────┐
│ Column           │ Type      │ Description                  │
├──────────────────┼───────────┼──────────────────────────────┤
│ id               │ uuid      │ Primary key                  │
│ agent_id         │ uuid      │ FK → auth.users (RLS key)    │
│ created_at       │ timestampz│ Auto-set on insert           │
│ updated_at       │ timestampz│ Auto-updated via trigger     │
│ subject          │ jsonb     │ SubjectProperty object       │
│ comps            │ jsonb[]   │ Array of Comparable objects  │
│ market_stats     │ jsonb     │ MarketStats object           │
│ suggested_low    │ integer   │ Low end of price range ($)   │
│ suggested_high   │ integer   │ High end of price range ($)  │
│ suggested_price  │ integer   │ Recommended list price ($)   │
│ client_name      │ text      │ Optional buyer/seller name   │
│ client_email     │ text      │ Optional client email        │
│ agent_notes      │ text      │ Optional agent notes         │
└──────────────────┴───────────┴──────────────────────────────┘

RLS Policy: "Agents manage own reports"
  USING (auth.uid() = agent_id)
  → Agents can only SELECT/INSERT/UPDATE/DELETE their own rows
```

---

## 6. Environment Variables

```
Build time (Vercel):
  NEXT_PUBLIC_SUPABASE_URL      → Embedded in client JS bundle
  NEXT_PUBLIC_SUPABASE_ANON_KEY → Embedded in client JS bundle

Runtime only (never in client bundle):
  Rentcast API key              → Stored in Supabase user_metadata
                                  Read server-side in /api/zillow
```

---

## 7. File Structure

```
cma-pro-web/
├── app/
│   ├── layout.tsx              # MantineProvider, theme, fonts
│   ├── page.tsx                # Root redirect
│   ├── login/page.tsx          # Sign in form
│   ├── register/page.tsx       # Sign up form
│   ├── dashboard/
│   │   ├── layout.tsx          # Wraps with AppShell
│   │   └── page.tsx            # SSR report list
│   ├── new-cma/
│   │   ├── layout.tsx
│   │   └── page.tsx            # 4-step CMA wizard
│   ├── reports/[id]/
│   │   ├── page.tsx            # SSR report detail
│   │   └── DeleteReportButton.tsx
│   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Profile + API key form
│   └── api/zillow/
│       └── route.ts            # Rentcast proxy (server only)
├── components/
│   └── AppShell.tsx            # Nav sidebar + header
├── lib/
│   ├── cma.ts                  # CMA math (pure functions)
│   ├── store.ts                # Zustand wizard state
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client
├── types/
│   └── index.ts                # SubjectProperty, Comparable, etc.
└── proxy.ts                    # Auth middleware (Next.js 16)
```
