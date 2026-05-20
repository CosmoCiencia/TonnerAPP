create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
