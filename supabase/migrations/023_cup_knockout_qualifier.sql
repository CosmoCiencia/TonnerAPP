alter table public.cup_predictions
add column if not exists predicted_qualifier text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cup_predictions_predicted_qualifier_check'
  ) then
    alter table public.cup_predictions
    add constraint cup_predictions_predicted_qualifier_check
    check (predicted_qualifier is null or predicted_qualifier in ('home', 'away'));
  end if;
end;
$$;

update public.cup_predictions predictions
set predicted_qualifier = predictions.prediction_result
from public.cup_matches matches
where matches.id = predictions.match_id
  and lower(coalesce(matches.stage, '')) <> 'fase de grupos'
  and predictions.prediction_result in ('home', 'away')
  and predictions.predicted_qualifier is null;

create or replace function public.normalize_cup_prediction_qualifier()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  match_stage text;
begin
  select lower(coalesce(matches.stage, ''))
  into match_stage
  from public.cup_matches matches
  where matches.id = new.match_id;

  if match_stage = 'fase de grupos' then
    new.predicted_qualifier := null;
  elsif new.predicted_home > new.predicted_away then
    new.predicted_qualifier := 'home';
  elsif new.predicted_home < new.predicted_away then
    new.predicted_qualifier := 'away';
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_cup_prediction_qualifier on public.cup_predictions;
create trigger normalize_cup_prediction_qualifier
before insert or update of match_id, predicted_home, predicted_away, predicted_qualifier
on public.cup_predictions
for each row execute function public.normalize_cup_prediction_qualifier();
