create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strain_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, strain_id)
);

alter table public.likes enable row level security;

create policy "Users can view their own likes"
  on public.likes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);
