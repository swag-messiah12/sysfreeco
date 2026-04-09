# sysFREEco — Project Plan (SDLC)

> Living document. Update as the project evolves.

---

## 1. Problem Statement

Sysco controls ~30–35% of North American foodservice distribution. Most consumers
have no way of knowing whether a restaurant sources locally or from a centralized
distributor. There is no public database, no certification visible at a glance, and
no map-based discovery tool for the GTA/Hamilton area.

**sysFREEco** solves this with a scoring system built on observable signals: website
language, known local supplier mentions, and franchise/chain negative indicators.

---

## 2. User Stories

| ID  | As a...          | I want to...                               | So that...                                  |
|-----|------------------|--------------------------------------------|---------------------------------------------|
| U01 | Diner            | See restaurants on a map by sourcing score | I can choose where to eat based on values   |
| U02 | Diner            | Filter by city and verdict                 | I can narrow results to my area             |
| U03 | Community member | Submit a restaurant I know about           | It gets added to the database               |
| U04 | Researcher       | Export the data as JSON                    | I can analyze sourcing trends               |
| U05 | Developer        | Run the CLI scanner locally                | I can scan new restaurants without the UI   |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│                                                                  │
│   Landing Page    Explore Page (Map)    Submit Page              │
│   /               /explore              /submit                  │
│        │               │                    │                    │
│        └───────────────┴────────────────────┘                    │
│                          ↕ Next.js Router                        │
└──────────────────────────────────────────────────────────────────┘
                           ↕ HTTPS
┌──────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP (Vercel)                         │
│                                                                  │
│  middleware.ts  ← Rate limiting (5/hr submit, 120/min GET)       │
│  next.config.ts ← CSP, HSTS, X-Frame-Options, CORS headers      │
│                                                                  │
│  API Routes:                                                     │
│    GET  /api/restaurants  → reads from Supabase (or JSON)        │
│    POST /api/submit       → validates (Zod) → inserts Supabase   │
└──────────────────────────────────────────────────────────────────┘
                           ↕ Supabase JS Client
┌──────────────────────────────────────────────────────────────────┐
│                        SUPABASE (Postgres)                       │
│                                                                  │
│   restaurants table  ← populated by Python CLI scanner           │
│   submissions table  ← populated by /api/submit                  │
│                                                                  │
│   Row-Level Security: public read on restaurants,                │
│                        insert-only on submissions                 │
└──────────────────────────────────────────────────────────────────┘
                           ↕
┌──────────────────────────────────────────────────────────────────┐
│                    PYTHON CLI (local tool)                       │
│   main.py  ← scrapes websites, scores restaurants, exports JSON  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Model

### `restaurants` table

```sql
create table restaurants (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  address         text not null,
  city            text not null,
  lat             double precision not null,
  lng             double precision not null,
  rating          numeric(3,1),
  website         text,
  phone           text,
  price_level     smallint,
  indie_score     integer not null default 0,
  positive_hits   text[]  not null default '{}',
  negative_hits   text[]  not null default '{}',
  supplier_hits   text[]  not null default '{}',
  data_sources    text[]  not null default '{}',
  verdict         text    not null default '⚪ No Data',
  verified        boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Index for map bounding box queries
create index restaurants_lat_lng on restaurants (lat, lng);
-- Index for city filter
create index restaurants_city on restaurants (city);
-- Index for score sorting
create index restaurants_score on restaurants (indie_score desc);

-- RLS: Anyone can read
alter table restaurants enable row level security;
create policy "public_read" on restaurants
  for select using (true);
```

### `submissions` table

```sql
create table submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  address         text not null,
  city            text not null,
  website         text,
  phone           text,
  notes           text,
  email           text,          -- stored encrypted or hashed in prod
  status          text not null default 'pending',
                  -- values: pending | approved | rejected
  created_at      timestamptz default now()
);

-- RLS: Anyone can insert, only admins can read
alter table submissions enable row level security;
create policy "public_insert" on submissions
  for insert with check (true);
create policy "admin_read" on submissions
  for select using (auth.role() = 'service_role');
```

---

## 5. API Specification

### `GET /api/restaurants`

Returns scored restaurants, sorted by `indie_score` descending.

**Response 200:**
```json
[
  {
    "name": "Langdon Hall",
    "city": "Cambridge",
    "lat": 43.3924,
    "lng": -80.358,
    "indie_score": 15,
    "verdict": "🟢 Very Likely Independent",
    "positive_hits": ["farm-to-table", "foraged"],
    "supplier_hits": ["monforte dairy", "mariposa farm"],
    ...
  }
]
```

**Errors:**
- `500` — Database error (falls back to static JSON)

---

### `POST /api/submit`

Submit a restaurant for review.

**Request body:**
```json
{
  "name":    "Farmhouse Tavern",        // required, 2–100 chars
  "address": "1627 Dupont St, Toronto", // required, 5–200 chars
  "city":    "Toronto",                 // required, enum
  "website": "https://farmhouse.ca",    // optional, must be valid URL
  "phone":   "(416) 555-0100",          // optional
  "notes":   "They source from VG Meats", // optional, max 500 chars
  "email":   "user@example.com"         // optional, valid email
}
```

**Responses:**
- `201` — `{ success: true }`
- `400` — Invalid JSON
- `415` — Wrong Content-Type
- `422` — Validation error with field details
- `429` — Rate limited (5 per hour per IP)
- `503` — Database unavailable

---

## 6. Security Controls

| Control                  | Implementation                          | Status |
|--------------------------|-----------------------------------------|--------|
| HTTPS enforcement        | HSTS header (2 years)                   | ✅     |
| Clickjacking protection  | X-Frame-Options: DENY                   | ✅     |
| MIME sniffing prevention | X-Content-Type-Options: nosniff         | ✅     |
| Content Security Policy  | Strict CSP — allows only OSM + Supabase | ✅     |
| Input validation         | Zod schema on all API routes            | ✅     |
| Rate limiting            | 5/hr on /api/submit, 120/min on GET     | ✅     |
| SQL injection            | Supabase parameterized queries          | ✅     |
| XSS                      | React escaping + strict CSP             | ✅     |
| Secrets management       | ENV vars only, never in client bundle   | ✅     |
| RLS on DB                | Supabase Row Level Security             | ✅     |
| Referrer leaking         | Referrer-Policy: strict-origin-...      | ✅     |

---

## 7. UI Wireframes (ASCII)

### Landing page `/`
```
┌─────────────────────────────────────────────────────────┐
│  🥩 sysFREEco            [Explore Map]  [Submit]        │  ← Header
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ○ Toronto · Hamilton · GTA                            │  ← eyebrow
│                                                          │
│   Find restaurants that                                  │
│   actually know their                                    │  ← hero headline
│   farmers.                                              │
│                                                          │
│   Sysco controls 1/3 of...                              │  ← subhead
│                                                          │
│   [🗺 Explore the map →]  [Submit a restaurant]         │  ← CTAs
│                                                          │
│   🟢≥10 Independent   🟡5–9 Probably   🔴Likely Sysco  │  ← legend
├─────────────────────────────────────────────────────────┤
│   13+      7         50+       3                        │  ← stats bar
│  Scanned  Indie   Signals  Cities                       │
├─────────────────────────────────────────────────────────┤
│  [Scan icon]    [Leaf icon]    [Shield icon]             │
│  Website        Signal         Indie Score               │  ← how it works
│  scanning       detection                                │
├─────────────────────────────────────────────────────────┤
│  Top picks right now...  [View all →]                   │
│  ┌────────┐ ┌────────┐ ┌────────┐                       │  ← featured cards
│  │+15     │ │+14     │ │+12     │                        │
│  └────────┘ └────────┘ └────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### Explore page `/explore`
```
┌────────────────────────────────────────────────────────────┐
│  Header                                                     │
├───────────────────┬────────────────────────────────────────┤
│  [🔍 Search...]   │                                         │
│  [Filters ▾]      │                                         │
│  [All] [TO] [HAM] │         LEAFLET MAP                    │
│  ────────────────  │                                         │
│  13 restaurants    │    ● (green pin)                       │
│  ────────────────  │         ● (yellow)                     │
│  ┌─────────────┐  │    ● (red)                             │
│  │ Restaurant  │  │                                         │
│  │ +15 ●green  │  │                                         │
│  └─────────────┘  │                                         │
│  ┌─────────────┐  │    [Click a pin or card to view ...]   │
│  │ Restaurant  │  │                                         │
│  └─────────────┘  │                                         │
│                   │                   [Detail sheet slides] │
│  Score legend     │                   ┌──────────────────┐  │
│  ● ≥10 Indep      │                   │ Restaurant name  │  │
│  ● 5–9 Prob       │                   │ Score badge      │  │
└───────────────────┴───────────────────┴──────────────────┘  │
```

### Submit page `/submit`
```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              Submit a restaurant                         │
│     Know a spot that sources independently?              │
│                                                          │
│     ┌────────────────────────────────────────┐           │
│     │ Restaurant name *                      │           │
│     │ Address *                              │           │
│     │ City *              [Select ▾]         │           │
│     │ Website             https://...        │           │
│     │ Phone               optional           │           │
│     │ Notes               Why independent?   │           │
│     │ Email               optional           │           │
│     │                                        │           │
│     │          [✉ Submit restaurant]         │           │
│     └────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Indie Score Rubric

| Signal type          | Examples                                      | Points |
|----------------------|-----------------------------------------------|--------|
| Strong positive      | farm-to-table, locally sourced, our farmers   | +3     |
| Medium positive      | seasonal menu, organic, chef-driven           | +2     |
| Weak positive        | homemade, fresh ingredients, neighbourhood    | +1     |
| Known local supplier | 100km Foods, Monforte, VG Meats, Pfenning     | +5     |
| Negative indicator   | Sysco, franchise, chain restaurant, GFS       | −5     |

**Verdict thresholds:**
- ≥ 10 → 🟢 Very Likely Independent  
- 5–9  → 🟡 Probably Independent  
- 1–4  → 🟠 Some Signals  
- 0    → ⚪ No Data  
- ≤ −3 → 🔴 Likely Sysco / Chain

---

## 9. Deployment Checklist

- [ ] Create `.env.local` from `.env.example`
- [ ] Create Supabase project → copy URL + anon key + service role key
- [ ] Run `restaurants` and `submissions` SQL schema (Section 4)
- [ ] Seed `restaurants` table from `data/restaurants.json`
- [ ] `npm run build` — confirm zero errors
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Confirm security headers: `curl -I https://your-domain.com`
- [ ] Test rate limiting: POST `/api/submit` 6 times → expect 429

---

## 10. Roadmap

| Priority | Feature                                          | Status  |
|----------|--------------------------------------------------|---------|
| P0       | Map + scored restaurants (static JSON)           | ✅ Done |
| P0       | Submit form + API route + Zod validation         | ✅ Done |
| P0       | Security headers + rate limiting + CSP           | ✅ Done |
| P1       | Supabase persistence (restaurants + submissions) | 🔜 Next |
| P1       | Admin dashboard (approve/reject submissions)     | 🔜 Next |
| P2       | Connect Python CLI → Supabase directly           | Planned |
| P2       | Feast ON certified restaurant import             | Planned |
| P2       | Google Places API auto-discovery                 | Planned |
| P3       | User accounts + verified reports                 | Future  |
| P3       | Browser extension for on-the-go checking         | Future  |
| P3       | Slack/newsletter alerts for new additions        | Future  |
