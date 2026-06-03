import { requireSupabase } from '../../../lib/supabase';
import type { GoalEvent, Match } from './types';

type CupMatchRow = {
  id: string;
  round: string | null;
  group_name: string | null;
  date: string;
  status_short: string | null;
  home_team_id: number | null;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_id: number | null;
  away_team_name: string;
  away_team_logo: string | null;
  venue_name: string | null;
  venue_city: string | null;
  stage: string | null;
  score_home: number | null;
  score_away: number | null;
  elapsed_minutes: number | null;
  extra_minutes: number | null;
  raw: unknown;
};

type RawGoalEvent = {
  time?: {
    elapsed?: number | null;
    extra?: number | null;
  };
  team?: {
    id?: number | null;
    name?: string | null;
  };
  player?: {
    name?: string | null;
  };
  type?: string | null;
  detail?: string | null;
};

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT']);
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

function getMatchStatus(statusShort: string | null): Match['status'] {
  if (LIVE_STATUSES.has(statusShort ?? '')) return 'live';
  if (FINISHED_STATUSES.has(statusShort ?? '')) return 'finished';
  return 'upcoming';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRawGoalEvents(raw: unknown): RawGoalEvent[] {
  if (!isRecord(raw) || !Array.isArray(raw.events)) return [];

  return raw.events.filter((event): event is RawGoalEvent => {
    if (!isRecord(event)) return false;
    return event.type === 'Goal' && event.detail !== 'Missed Penalty';
  });
}

function getGoalEvents(row: CupMatchRow): GoalEvent[] {
  return getRawGoalEvents(row.raw).flatMap((event) => {
    const teamId = event.team?.id ?? null;
    const teamName = event.team?.name?.toLowerCase() ?? null;
    const homeName = row.home_team_name.toLowerCase();
    const awayName = row.away_team_name.toLowerCase();
    const side =
      teamId === row.home_team_id || teamName === homeName
        ? 'home'
        : teamId === row.away_team_id || teamName === awayName
          ? 'away'
          : null;

    if (!side) return [];

    return [{
      side,
      player_name: event.player?.name?.trim() || 'Gol',
      elapsed: event.time?.elapsed ?? null,
      extra: event.time?.extra ?? null,
      detail: event.detail ?? null,
    }];
  });
}

function toMatch(row: CupMatchRow): Match {
  return {
    id: row.id,
    group: row.group_name ?? 'General',
    date: row.date,
    team_home: row.home_team_name,
    team_away: row.away_team_name,
    home_team_id: row.home_team_id,
    away_team_id: row.away_team_id,
    home_logo: row.home_team_logo,
    away_logo: row.away_team_logo,
    stadium: row.venue_name ?? 'Por definir',
    city: row.venue_city ?? 'Por definir',
    stage: row.stage ?? 'Fase de grupos',
    round: row.round ?? row.stage ?? 'Fase de grupos',
    status: getMatchStatus(row.status_short),
    score_home: row.score_home,
    score_away: row.score_away,
    elapsed_minutes: row.elapsed_minutes,
    extra_minutes: row.extra_minutes,
    goal_events: getGoalEvents(row),
  };
}

export async function fetchMatches(): Promise<Match[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('cup_matches')
    .select(
      'id,round,group_name,date,status_short,home_team_id,home_team_name,home_team_logo,away_team_id,away_team_name,away_team_logo,venue_name,venue_city,stage,score_home,score_away,elapsed_minutes,extra_minutes,raw',
    )
    .order('date', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los partidos: ${error.message}`);
  }

  return ((data ?? []) as CupMatchRow[]).map(toMatch);
}
