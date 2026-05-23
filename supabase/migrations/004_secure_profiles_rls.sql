alter table public.profiles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users can create own customer profile" on public.profiles;
create policy "users can create own customer profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'customer'
);

drop policy if exists "users can update own customer profile" on public.profiles;
create policy "users can update own customer profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = 'customer'
);
