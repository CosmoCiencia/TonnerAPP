drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "users can create own public customer profile" on public.profiles;
drop policy if exists "users can create own customer profile" on public.profiles;

revoke insert on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;
revoke truncate, references, trigger on public.profiles from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "users can update own customer profile" on public.profiles;
drop policy if exists "users can update own customer profile data" on public.profiles;
create policy "users can update own safe profile fields"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
  and role = 'customer'
);

grant execute on function public.resolve_cup_user_type(text) to authenticated;
grant execute on function public.upsert_own_customer_profile(text, text) to authenticated;
