insert into public.profiles (
  id,
  email,
  full_name,
  role,
  cup_user_type
)
select
  users.id,
  users.email,
  nullif(btrim(coalesce(users.raw_user_meta_data ->> 'full_name', '')), ''),
  'customer',
  'public'
from auth.users users
where not exists (
  select 1
  from public.profiles profiles
  where profiles.id = users.id
);

grant select on public.profiles to service_role;
grant select on public.cup_ranking_view to service_role;
