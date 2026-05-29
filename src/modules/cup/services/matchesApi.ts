import { requireSupabase } from '../../../lib/supabase';
import type { Match } from './types';

type CupMatchRow = {
  id: string;
  round: string | null;
  group_name: string | null;
  date: string;
  status_short: string | null;
  home_team_name: string;
  home_team_logo: string | null;
  away_team_name: string;
  away_team_logo: string | null;
  venue_name: string | null;
  venue_city: string | null;
  stage: string | null;
  score_home: number | null;
  score_away: number | null;
  elapsed_minutes: number | null;
  extra_minutes: number | null;
};

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT']);
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

function getMatchStatus(statusShort: string | null): Match['status'] {
  if (LIVE_STATUSES.has(statusShort ?? '')) return 'live';
  if (FINISHED_STATUSES.has(statusShort ?? '')) return 'finished';
  return 'upcoming';
}

function toMatch(row: CupMatchRow): Match {
  return {
    id: row.id,
    group: row.group_name ?? 'General',
    date: row.date,
    team_home: row.home_team_name,
    team_away: row.away_team_name,
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
  };
}

export async function fetchMatches(): Promise<Match[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('cup_matches')
    .select(
      'id,round,group_name,date,status_short,home_team_name,home_team_logo,away_team_name,away_team_logo,venue_name,venue_city,stage,score_home,score_away,elapsed_minutes,extra_minutes',
    )
    .order('date', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar los partidos: ${error.message}`);
  }

  return ((data ?? []) as CupMatchRow[]).map(toMatch);
}
