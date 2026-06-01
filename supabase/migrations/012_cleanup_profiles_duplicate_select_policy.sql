drop policy if exists "Users can view their own profile" on public.profiles;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);
