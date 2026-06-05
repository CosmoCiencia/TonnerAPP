alter table public.cup_predictions
add column if not exists predicted_scorer_player_id bigint,
add column if not exists predicted_scorer_name text;

alter table public.cup_points
add column if not exists scorer_hit boolean not null default false;

create index if not exists cup_predictions_scorer_idx
on public.cup_predictions (predicted_scorer_player_id)
where predicted_scorer_player_id is not null;

create index if not exists cup_points_scorer_hit_idx
on public.cup_points (user_id, scorer_hit);
