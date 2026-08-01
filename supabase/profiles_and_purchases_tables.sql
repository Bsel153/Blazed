-- Persists each user's last-known location so it's remembered across devices/sessions.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state_code text,
  city text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Real per-user purchase history, logged by scanning a deal's QR code.
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dispensary_id text not null,
  strain_id text not null,
  category text not null,
  title text not null,
  price numeric not null,
  quantity_grams numeric,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users can insert their own purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id);
