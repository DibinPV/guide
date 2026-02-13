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
