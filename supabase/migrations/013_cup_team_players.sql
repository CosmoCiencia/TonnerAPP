create table if not exists public.cup_team_players (
  id uuid primary key default gen_random_uuid(),
  team_id bigint not null,
  team_name text,
  player_id bigint not null,
  player_name text not null,
  age integer,
  number integer,
  position text,
  photo text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, player_id)
);

create index if not exists cup_team_players_team_idx
on public.cup_team_players (team_id, position, player_name);

create index if not exists cup_team_players_player_idx
on public.cup_team_players (player_id);

drop trigger if exists set_cup_team_players_updated_at on public.cup_team_players;
create trigger set_cup_team_players_updated_at
before update on public.cup_team_players
for each row execute function public.set_updated_at();

alter table public.cup_team_players enable row level security;

drop policy if exists "authenticated users can read cup team players" on public.cup_team_players;
create policy "authenticated users can read cup team players"
on public.cup_team_players
for select
to authenticated
using (true);

revoke all on public.cup_team_players from anon, authenticated;

grant select on public.cup_team_players to authenticated;

grant select, insert, update, delete
on public.cup_team_players
to service_role;
