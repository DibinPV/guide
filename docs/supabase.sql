-- Feedback tables
create table if not exists public.feedback_tour (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  tour_slug text not null,
  rating int null check (rating between 1 and 5),
  is_like boolean,
  comment text null
);

create table if not exists public.feedback_place (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  place_slug text not null,
  rating int null check (rating between 1 and 5),
  is_like boolean,
  comment text null
);

create table if not exists public.feedback_day (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  tour_slug text not null,
  day_number int not null,
  rating int null check (rating between 1 and 5),
  is_like boolean,
  comment text null
);

create table if not exists public.feedback_stop (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  tour_slug text not null,
  day_number int not null,
  stop_index int not null,
  place_slug text null,
  rating int null check (rating between 1 and 5),
  is_like boolean,
  comment text null
);

create table if not exists public.feedback_travel (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  tour_slug text not null,
  day_number int not null,
  travel_index int not null,
  rating int null check (rating between 1 and 5),
  is_like boolean,
  comment text null
);

-- Enable RLS
alter table public.feedback_tour enable row level security;
alter table public.feedback_place enable row level security;
alter table public.feedback_day enable row level security;
alter table public.feedback_stop enable row level security;
alter table public.feedback_travel enable row level security;

-- Public insert policy (anonymous allowed). For future auth, replace with auth.uid() checks.
create policy "public insert tour" on public.feedback_tour
  for insert with check (true);

create policy "public insert place" on public.feedback_place
  for insert with check (true);

create policy "public insert day" on public.feedback_day
  for insert with check (true);

create policy "public insert stop" on public.feedback_stop
  for insert with check (true);

create policy "public insert travel" on public.feedback_travel
  for insert with check (true);

-- Optional: public read (if you want to show aggregates later)
create policy "public read tour" on public.feedback_tour
  for select using (true);

create policy "public read place" on public.feedback_place
  for select using (true);

create policy "public read day" on public.feedback_day
  for select using (true);

create policy "public read stop" on public.feedback_stop
  for select using (true);

create policy "public read travel" on public.feedback_travel
  for select using (true);

-- Tours data tables (admin-managed)
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  city text null,
  country text null,
  summary text null,
  cover_url text null,
  is_published boolean not null default true
);

create table if not exists public.tour_days (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  day_number int not null,
  title text not null,
  summary text null,
  unique (tour_id, day_number)
);

create table if not exists public.tour_stops (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.tour_days(id) on delete cascade,
  position int not null,
  place_slug text not null,
  title_override text null,
  description text null,
  pass_by text null,
  unique (day_id, position)
);

create table if not exists public.tour_travels (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.tour_days(id) on delete cascade,
  from_stop_position int not null,
  mode text not null,
  duration_minutes int not null,
  distance_km numeric(6,2) null,
  notes text null,
  unique (day_id, from_stop_position)
);

-- Events + articles (new timeline model)
create table if not exists public.event_articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  lead text null,
  content_md text null,
  images text[] null
);

create table if not exists public.tour_events (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.tour_days(id) on delete cascade,
  type text not null check (type in ('excursion','travel')),
  start_time time not null,
  duration_minutes int not null,
  title text not null,
  summary text null,
  place_slug text null,
  from_place_slug text null,
  to_place_slug text null,
  mode text null,
  order_index int not null default 0,
  article_id uuid null references public.event_articles(id) on delete set null
);

-- Enable RLS for tours tables
alter table public.tours enable row level security;
alter table public.tour_days enable row level security;
alter table public.tour_stops enable row level security;
alter table public.tour_travels enable row level security;
alter table public.event_articles enable row level security;
alter table public.tour_events enable row level security;

-- Public read policies (anonymous ok). Writes should go through server with service role.
create policy "public read tours" on public.tours
  for select using (true);

create policy "public read tour_days" on public.tour_days
  for select using (true);

create policy "public read tour_stops" on public.tour_stops
  for select using (true);

create policy "public read tour_travels" on public.tour_travels
  for select using (true);

create policy "public read event_articles" on public.event_articles
  for select using (true);

create policy "public read tour_events" on public.tour_events
  for select using (true);
