-- ============================================================
-- sysFREEco — Supabase schema + seed data
-- Paste this entire file into: Supabase dashboard → SQL Editor → Run
-- ============================================================

-- ─── restaurants ─────────────────────────────────────────────
create table if not exists restaurants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  address       text not null,
  city          text not null,
  lat           double precision not null,
  lng           double precision not null,
  rating        numeric(3,1),
  website       text,
  phone         text,
  price_level   smallint,
  indie_score   integer not null default 0,
  positive_hits text[] not null default '{}',
  negative_hits text[] not null default '{}',
  supplier_hits text[] not null default '{}',
  data_sources  text[] not null default '{}',
  verdict       text not null default '⚪ No Data',
  verified      boolean not null default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists restaurants_lat_lng on restaurants (lat, lng);
create index if not exists restaurants_city    on restaurants (city);
create index if not exists restaurants_score   on restaurants (indie_score desc);

alter table restaurants enable row level security;
drop policy if exists "public_read" on restaurants;
create policy "public_read" on restaurants for select using (true);

-- ─── submissions ─────────────────────────────────────────────
create table if not exists submissions (
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
drop policy if exists "public_insert" on submissions;
drop policy if exists "admin_read"    on submissions;
create policy "public_insert" on submissions for insert with check (true);
create policy "admin_read"    on submissions for select using (auth.role() = 'service_role');

-- ─── seed restaurants ─────────────────────────────────────────
truncate restaurants restart identity cascade;

insert into restaurants
  (name, address, city, lat, lng, rating, website, price_level,
   indie_score, positive_hits, negative_hits, supplier_hits, data_sources, verdict)
values
(
  'Actinolite',
  '971 Ossington Ave, Toronto, ON', 'Toronto', 43.6615, -79.4366, 4.6,
  'https://actinoliterestaurant.com', 4, 12,
  array['farm-to-table','locally sourced','foraged','heritage breed','family farm'],
  array[]::text[], array['100km foods'],
  array['website_main','website_about'], '🟢 Very Likely Independent'
),
(
  'Earth to Table: Bread Bar',
  '258 Locke St S, Hamilton, ON', 'Hamilton', 43.249, -79.887, 4.3,
  'https://earthtotable.ca', 2, 14,
  array['farm-to-table','locally sourced','organic','our farmers','small-batch','house-made'],
  array[]::text[], array['pfenning','kawartha dairy'],
  array['website_main','website_about'], '🟢 Very Likely Independent'
),
(
  'Langdon Hall',
  '1 Langdon Dr, Cambridge, ON', 'Cambridge', 43.3924, -80.358, 4.6,
  'https://langdonhall.ca', 4, 15,
  array['farm-to-table','foraged','direct from farm','heritage breed','our farmers','ontario grown'],
  array[]::text[], array['monforte dairy','mariposa farm'],
  array['website_main','website_about'], '🟢 Very Likely Independent'
),
(
  'Farmhouse Tavern',
  '1627 Dupont St, Toronto, ON', 'Toronto', 43.6639, -79.4571, 4.3,
  'https://farmhousetavern.ca', 2, 10,
  array['farm-to-table','ontario grown','local farms','seasonal menu','house-made'],
  array[]::text[], array['vg meats'],
  array['website_main','website_about'], '🟢 Very Likely Independent'
),
(
  'Richmond Station',
  '1 Richmond St W, Toronto, ON', 'Toronto', 43.6513, -79.381, 4.5,
  'https://richmondstation.ca', 3, 8,
  array['organic','locally sourced','seasonal menu','chef-driven'],
  array[]::text[], array[]::text[],
  array['website_main','website_about'], '🟡 Probably Independent'
),
(
  'Edulis',
  '169 Niagara St, Toronto, ON', 'Toronto', 43.6412, -79.4062, 4.7,
  'https://edulisrestaurant.com', 4, 7,
  array['foraged','seasonal menu','local farms'],
  array[]::text[], array['forbes wild foods'],
  array['website_main'], '🟡 Probably Independent'
),
(
  'Canoe',
  '66 Wellington St W, Toronto, ON', 'Toronto', 43.6478, -79.3815, 4.4,
  'https://canoerestaurant.com', 4, 6,
  array['seasonal ingredients','ontario grown','local farms'],
  array[]::text[], array[]::text[],
  array['website_main','website_about'], '🟡 Probably Independent'
),
(
  'Cafe Belong',
  '2 Brewery Ln, Toronto, ON', 'Toronto', 43.6597, -79.3586, 4.2,
  'https://cafebelong.ca', 2, 5,
  array['locally sourced','seasonal menu','chef-driven'],
  array[]::text[], array[]::text[],
  array['website_main'], '🟡 Probably Independent'
),
(
  'Borealis Grille & Bar',
  '140 King St E, Hamilton, ON', 'Hamilton', 43.255, -79.8595, 4.3,
  'https://borealisgrille.com', 2, 3,
  array['local brew','seasonal menu','neighbourhood spot'],
  array[]::text[], array[]::text[],
  array['website_main'], '🟠 Unclear — Some Signals'
),
(
  'The Mule',
  '64 Hess St S, Hamilton, ON', 'Hamilton', 43.2537, -79.8796, 4.4,
  'https://themulerestaurant.ca', 2, 2,
  array['family-owned','homemade'],
  array[]::text[], array[]::text[],
  array['website_main'], '🟠 Unclear — Some Signals'
),
(
  'Harbour Diner',
  '479 Harbord St, Toronto, ON', 'Toronto', 43.6601, -79.4151, 4.1,
  null, 1, 0,
  array[]::text[], array[]::text[], array[]::text[],
  array[]::text[], '⚪ No Data'
),
(
  'Tim Hortons (King & Bay)',
  '200 King St W, Toronto, ON', 'Toronto', 43.6484, -79.3837, 3.2,
  'https://timhortons.ca', 1, -8,
  array[]::text[], array['franchise','chain restaurant'], array[]::text[],
  array['website_main'], '🔴 Likely Sysco / Big Distributor'
),
(
  'East Side Marios',
  '1 Stoney Creek Rd, Hamilton, ON', 'Hamilton', 43.2355, -79.8013, 3.6,
  'https://eastsidemarios.com', 2, -10,
  array[]::text[], array['franchise','chain restaurant','centralized kitchen'], array[]::text[],
  array['website_main'], '🔴 Likely Sysco / Big Distributor'
);

-- Verify seed worked
select name, city, indie_score, verdict from restaurants order by indie_score desc;
