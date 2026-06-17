update public.cup_predictions
set prediction_result = case
  when predicted_home > predicted_away then 'home'
  when predicted_home < predicted_away then 'away'
  else 'draw'
end
where prediction_result is distinct from case
  when predicted_home > predicted_away then 'home'
  when predicted_home < predicted_away then 'away'
  else 'draw'
end;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cup_predictions_result_matches_score_check'
  ) then
    alter table public.cup_predictions
    add constraint cup_predictions_result_matches_score_check
    check (
      (prediction_result = 'home' and predicted_home > predicted_away)
      or (prediction_result = 'away' and predicted_home < predicted_away)
      or (prediction_result = 'draw' and predicted_home = predicted_away)
    );
  end if;
end;
$$;

create or replace view public.cup_ranking_view
with (security_invoker = false)
as
with participants as (
  select
    predictions.user_id,
    count(*)::integer as prediction_count
  from public.cup_predictions predictions
  group by predictions.user_id
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
