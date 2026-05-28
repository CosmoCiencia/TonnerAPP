alter table public.profiles
add column if not exists full_name text;

update public.profiles
set full_name = split_part(email, '@', 1)
where full_name is null
  and email is not null;

create or replace view public.cup_ranking_view
with (security_invoker = true)
as
select
  row_number() over (
    order by
      coalesce(sum(points.points_awarded), 0) desc,
      coalesce(sum(case when points.result_hit then 1 else 0 end), 0) desc,
      coalesce(nullif(profiles.full_name, ''), split_part(profiles.email, '@', 1), points.user_id::text) asc
  )::integer as position,
  points.user_id,
  coalesce(nullif(profiles.full_name, ''), split_part(profiles.email, '@', 1), points.user_id::text) as display_name,
  coalesce(sum(points.points_awarded), 0)::integer as total_points,
  coalesce(sum(case when points.result_hit then 1 else 0 end), 0)::integer as exact_hits
from public.cup_points points
left join public.profiles profiles on profiles.id = points.user_id
group by points.user_id, profiles.email, profiles.full_name;

revoke all on public.cup_ranking_view from anon, authenticated;
grant select on public.cup_ranking_view to authenticated;
