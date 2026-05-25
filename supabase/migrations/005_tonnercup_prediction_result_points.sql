alter table public.cup_predictions
add column if not exists prediction_result text;

update public.cup_predictions
set prediction_result = case
  when predicted_home > predicted_away then 'home'
  when predicted_home < predicted_away then 'away'
  else 'draw'
end
where prediction_result is null;

alter table public.cup_predictions
alter column prediction_result set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cup_predictions_prediction_result_check'
  ) then
    alter table public.cup_predictions
    add constraint cup_predictions_prediction_result_check
    check (prediction_result in ('home', 'draw', 'away'));
  end if;
end;
$$;

create index if not exists cup_predictions_result_idx
on public.cup_predictions (prediction_result);

drop policy if exists "users can create own predictions before kickoff" on public.cup_predictions;
create policy "users can create own predictions before kickoff"
on public.cup_predictions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and prediction_result in ('home', 'draw', 'away')
  and exists (
    select 1
    from public.cup_matches cup_match
    where cup_match.id = cup_predictions.match_id
      and cup_match.stage = 'Fase de grupos'
      and cup_match.date > now()
  )
);

drop policy if exists "users can update own predictions before kickoff" on public.cup_predictions;
create policy "users can update own predictions before kickoff"
on public.cup_predictions
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.cup_matches cup_match
    where cup_match.id = cup_predictions.match_id
      and cup_match.stage = 'Fase de grupos'
      and cup_match.date > now()
  )
)
with check (
  user_id = auth.uid()
  and prediction_result in ('home', 'draw', 'away')
  and exists (
    select 1
    from public.cup_matches cup_match
    where cup_match.id = cup_predictions.match_id
      and cup_match.stage = 'Fase de grupos'
      and cup_match.date > now()
  )
);

create or replace view public.cup_ranking_view
with (security_invoker = true)
as
select
  row_number() over (
    order by
      coalesce(sum(points.points_awarded), 0) desc,
      coalesce(sum(case when points.result_hit then 1 else 0 end), 0) desc,
      profiles.email asc
  )::integer as position,
  points.user_id,
  coalesce(profiles.email, points.user_id::text) as display_name,
  coalesce(sum(points.points_awarded), 0)::integer as total_points,
  coalesce(sum(case when points.result_hit then 1 else 0 end), 0)::integer as exact_hits
from public.cup_points points
left join public.profiles profiles on profiles.id = points.user_id
group by points.user_id, profiles.email;

revoke all on public.cup_ranking_view from anon, authenticated;
grant select on public.cup_ranking_view to authenticated;
