-- Campos y permisos administrativos para gestionar los perfiles desde Tonner Manager.

alter table public.profiles
  add column if not exists status text not null default 'active';

update public.profiles
set status = 'active'
where status is null or status = '';

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('active', 'pending', 'blocked'));

grant select on public.profiles to authenticated;
grant update (full_name, role, cup_user_type, status) on public.profiles to authenticated;

drop policy if exists "tonner managers can read profiles" on public.profiles;
create policy "tonner managers can read profiles"
on public.profiles
for select
to authenticated
using (public.is_tonner_manager());

drop policy if exists "tonner managers can update profiles" on public.profiles;
create policy "tonner managers can update profiles"
on public.profiles
for update
to authenticated
using (public.is_tonner_manager())
with check (
  public.is_tonner_manager()
  and role in ('customer', 'distributor', 'internal', 'admin')
  and cup_user_type in ('public', 'internal', 'distributor')
  and status in ('active', 'pending', 'blocked')
);
