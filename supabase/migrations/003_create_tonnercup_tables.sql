create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cup_matches (
  id text primary key,
  api_fixture_id bigint unique,
  league_id integer not null default 1,
  season integer not null default 2026,
  round text,
  stage text,
  group_name text,
  date timestamptz not null,
  status_short text not null default 'NS',
  status_long text not null default 'Not Started',
  home_team_id bigint,
  home_team_name text not null,
  home_team_logo text,
  away_team_id bigint,
  away_team_name text not null,
  away_team_logo text,
  venue_name text,
  venue_city text,
  score_home integer,
  score_away integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cup_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null references public.cup_matches(id) on delete cascade,
  predicted_home integer not null check (predicted_home >= 0),
  predicted_away integer not null check (predicted_away >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table if not exists public.cup_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null references public.cup_matches(id) on delete cascade,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  exact_hit boolean not null default false,
  result_hit boolean not null default false,
  calculated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table if not exists public.cup_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cup_matches_date_idx on public.cup_matches (date);
create index if not exists cup_matches_group_idx on public.cup_matches (group_name);
create index if not exists cup_predictions_user_idx on public.cup_predictions (user_id);
create index if not exists cup_predictions_match_idx on public.cup_predictions (match_id);
create index if not exists cup_points_user_idx on public.cup_points (user_id);
create index if not exists cup_points_match_idx on public.cup_points (match_id);

drop trigger if exists set_cup_matches_updated_at on public.cup_matches;
create trigger set_cup_matches_updated_at
before update on public.cup_matches
for each row execute function public.set_updated_at();

drop trigger if exists set_cup_predictions_updated_at on public.cup_predictions;
create trigger set_cup_predictions_updated_at
before update on public.cup_predictions
for each row execute function public.set_updated_at();

alter table public.cup_matches enable row level security;
alter table public.cup_predictions enable row level security;
alter table public.cup_points enable row level security;
alter table public.cup_sync_logs enable row level security;

drop policy if exists "authenticated users can read cup matches" on public.cup_matches;
create policy "authenticated users can read cup matches"
on public.cup_matches
for select
to authenticated
using (true);

drop policy if exists "users can read own cup predictions" on public.cup_predictions;
create policy "users can read own cup predictions"
on public.cup_predictions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "users can create own predictions before kickoff" on public.cup_predictions;
create policy "users can create own predictions before kickoff"
on public.cup_predictions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.cup_matches cup_match
    where cup_match.id = cup_predictions.match_id
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
      and cup_match.date > now()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.cup_matches cup_match
    where cup_match.id = cup_predictions.match_id
      and cup_match.date > now()
  )
);

drop policy if exists "authenticated users can read cup points" on public.cup_points;
create policy "authenticated users can read cup points"
on public.cup_points
for select
to authenticated
using (true);

create or replace view public.cup_ranking_view
with (security_invoker = true)
as
select
  row_number() over (
    order by
      coalesce(sum(points.points_awarded), 0) desc,
      coalesce(sum(case when points.exact_hit then 1 else 0 end), 0) desc,
      profiles.email asc
  )::integer as position,
  points.user_id,
  coalesce(profiles.email, points.user_id::text) as display_name,
  coalesce(sum(points.points_awarded), 0)::integer as total_points,
  coalesce(sum(case when points.exact_hit then 1 else 0 end), 0)::integer as exact_hits
from public.cup_points points
left join public.profiles profiles on profiles.id = points.user_id
group by points.user_id, profiles.email;

revoke all on public.cup_matches from anon, authenticated;
revoke all on public.cup_predictions from anon, authenticated;
revoke all on public.cup_points from anon, authenticated;
revoke all on public.cup_sync_logs from anon, authenticated;
revoke all on public.cup_ranking_view from anon, authenticated;

grant usage on schema public to authenticated;
grant select on public.cup_matches to authenticated;
grant select, insert, update on public.cup_predictions to authenticated;
grant select on public.cup_points to authenticated;
grant select on public.cup_ranking_view to authenticated;
