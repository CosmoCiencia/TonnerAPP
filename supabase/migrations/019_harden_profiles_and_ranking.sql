insert into public.profiles as profile (
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
on conflict (id) do update
set
  email = coalesce(nullif(profile.email, ''), excluded.email),
  full_name = coalesce(nullif(btrim(profile.full_name), ''), excluded.full_name),
  role = coalesce(nullif(profile.role, ''), 'customer'),
  cup_user_type = coalesce(profile.cup_user_type, 'public');

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles as profile (
    id,
    email,
    full_name,
    role,
    cup_user_type
  )
  values (
    new.id,
    new.email,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'customer',
    'public'
  )
  on conflict (id) do update
  set
    email = coalesce(nullif(profile.email, ''), excluded.email),
    full_name = coalesce(nullif(btrim(profile.full_name), ''), excluded.full_name),
    role = coalesce(nullif(profile.role, ''), 'customer'),
    cup_user_type = coalesce(profile.cup_user_type, 'public');

  return new;
end;
$$;

drop trigger if exists create_profile_for_new_auth_user on auth.users;
create trigger create_profile_for_new_auth_user
after insert on auth.users
for each row execute function public.create_profile_for_new_auth_user();

create or replace view public.cup_ranking_view
with (security_invoker = false)
as
with participants as (
  select
    users.id as user_id,
    count(predictions.id)::integer as prediction_count
  from auth.users users
  left join public.cup_predictions predictions on predictions.user_id = users.id
  where exists (
    select 1
    from public.profiles profiles
    where profiles.id = users.id
  )
  or exists (
    select 1
    from public.cup_predictions user_predictions
    where user_predictions.user_id = users.id
  )
  group by users.id
),
point_totals as (
  select
    points.user_id,
    coalesce(sum(points.points_awarded), 0)::integer as total_points,
    coalesce(sum(case when points.result_hit then 1 else 0 end), 0)::integer as exact_hits
  from public.cup_points points
  group by points.user_id
),
ranked as (
  select
    participants.user_id,
    coalesce(profiles.cup_user_type, 'public') as cup_user_type,
    coalesce(
      case
        when btrim(coalesce(profiles.full_name, '')) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then null
        else nullif(btrim(coalesce(profiles.full_name, '')), '')
      end,
      nullif(btrim(coalesce(auth_users.raw_user_meta_data ->> 'full_name', '')), ''),
      nullif(split_part(coalesce(profiles.email, auth_users.email, ''), '@', 1), ''),
      'Participante'
    ) as display_name,
    coalesce(point_totals.total_points, 0)::integer as total_points,
    coalesce(point_totals.exact_hits, 0)::integer as exact_hits,
    participants.prediction_count
  from participants
  left join point_totals on point_totals.user_id = participants.user_id
  left join public.profiles profiles on profiles.id = participants.user_id
  left join auth.users auth_users on auth_users.id = participants.user_id
)
select
  row_number() over (
    order by
      ranked.total_points desc,
      ranked.exact_hits desc,
      ranked.prediction_count desc,
      ranked.display_name asc
  )::integer as position,
  ranked.user_id,
  ranked.display_name,
  ranked.cup_user_type,
  ranked.total_points,
  ranked.exact_hits,
  ranked.prediction_count
from ranked;

revoke all on public.cup_ranking_view from anon, authenticated;
grant select on public.cup_ranking_view to authenticated;
grant select on public.cup_ranking_view to service_role;
