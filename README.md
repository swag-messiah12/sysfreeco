# sysFREEco

> Find restaurants in Toronto, Hamilton & the GTA that source independently — not from Sysco or big-box distributors.

Built on a Python CLI scanner that scrapes restaurant websites and scores them using 50+ sourcing signals. The web app visualises those scores on an interactive map with a glass-morphism dark UI.

---

## Features

- **Interactive map** — colour-coded pins show each restaurant's indie score at a glance
- **Signal detection** — 50+ regex patterns catch farm-to-table language, local supplier names, and franchise red flags
- **Indie score** — transparent scoring rubric (local supplier = +5, "franchise" = −5, etc.)
- **Submit form** — community-powered: anyone can add a restaurant for review
- **Secure** — CSP headers, HSTS, rate limiting, Zod input validation, Supabase RLS
- **SDLC docs** — full architecture diagram, data model, API spec, and wireframes in `PLAN.md`

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI components | shadcn/ui + Tailwind CSS v4 |
| Animations | Framer Motion |
| Map | Leaflet + OpenStreetMap (free, no API key) |
| Database | Supabase (Postgres + RLS) |
| Validation | Zod v4 |
| Forms | React Hook Form |
| Scanner (CLI) | Python 3 — `main.py` |

---

## Getting started

```bash
# 1. Clone
git clone https://github.com/swag-messiah12/sysfreeco.git
cd sysfreeco

# 2. Install
npm install

# 3. Environment (optional — app works without Supabase)
cp .env.example .env.local
# Fill in your Supabase URL + anon key if you have one

# 4. Run
npm run dev
```

Open http://localhost:3000

---

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only
```

No Supabase? The app falls back to `data/restaurants.json` automatically — zero config needed to run locally.

---

## Supabase schema

```sql
create table restaurants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  address       text not null,
  city          text not null,
  lat           double precision not null,
  lng           double precision not null,
  rating        numeric(3,1),
  website       text,
  indie_score   integer not null default 0,
  positive_hits text[] not null default '{}',
  negative_hits text[] not null default '{}',
  supplier_hits text[] not null default '{}',
  data_sources  text[] not null default '{}',
  verdict       text not null default '⚪ No Data',
  verified      boolean not null default false,
  created_at    timestamptz default now()
);

alter table restaurants enable row level security;
create policy "public_read" on restaurants for select using (true);

create table submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null,
  city       text not null,
  website    text,
  phone      text,
  notes      text,
  email      text,
  status     text not null default 'pending',
  created_at timestamptz default now()
);

alter table submissions enable row level security;
create policy "public_insert" on submissions for insert with check (true);
```

---

## Running the Python scanner

```bash
pip install requests beautifulsoup4 rich

# Interactive mode
python main.py

# Scan a specific city + export JSON
python main.py --city hamilton --json
```

Drop the exported `results.json` into `data/restaurants.json` to update the map.

---

## Indie score rubric

| Signal | Examples | Points |
|---|---|---|
| Strong positive | farm-to-table, locally sourced, our farmers | +3 |
| Medium positive | seasonal menu, organic, chef-driven | +2 |
| Weak positive | homemade, fresh ingredients | +1 |
| Known local supplier | 100km Foods, Monforte, VG Meats, Pfenning | +5 |
| Negative indicator | Sysco, franchise, chain restaurant, GFS | −5 |

**Verdicts:** >=10 Very Likely Independent · 5-9 Probably Independent · 1-4 Some Signals · 0 No Data · <=-3 Likely Sysco

---

## Project structure

```
sysfreeco/
├── app/
│   ├── page.tsx              # Landing page
│   ├── explore/page.tsx      # Map explorer
│   ├── submit/page.tsx       # Submit a restaurant
│   └── api/
│       ├── restaurants/      # GET - list restaurants
│       └── submit/           # POST - submit a restaurant
├── components/
│   ├── header.tsx
│   ├── map-view.tsx
│   ├── restaurant-card.tsx
│   ├── restaurant-detail-sheet.tsx
│   ├── score-badge.tsx
│   ├── skeletons.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── types.ts
│   ├── restaurant-utils.ts
│   ├── validations.ts
│   └── supabase/
├── data/
│   └── restaurants.json      # Seed data
├── main.py                   # Python CLI scanner
├── proxy.ts                  # Rate limiting + security headers
├── next.config.ts            # CSP + security headers
└── PLAN.md                   # SDLC docs
```

---

## Security

- Content-Security-Policy restricts scripts/styles/connections to known origins
- Strict-Transport-Security forces HTTPS for 2 years
- X-Frame-Options: DENY blocks clickjacking
- Rate limiting: 5 submissions/hour per IP, 120 reads/minute
- Zod validation on all API routes
- Supabase RLS: public read on restaurants, insert-only on submissions

---

## Roadmap

- [ ] Supabase persistence wired to production
- [ ] Admin dashboard (approve/reject submissions)
- [ ] Feast ON certified restaurant import
- [ ] Google Places API auto-discovery
- [ ] User accounts + verified sourcing reports
- [ ] Browser extension

---

MIT License
