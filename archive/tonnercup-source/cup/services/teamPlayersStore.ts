import { requireSupabase } from '../../../lib/supabase';
import type { CupTeamPlayer } from './types';

type CupTeamPlayerRow = CupTeamPlayer;

const TEAM_PLAYERS_PAGE_SIZE = 1000;

function toCupTeamPlayer(row: CupTeamPlayerRow): CupTeamPlayer {
  return {
    team_id: row.team_id,
    team_name: row.team_name,
    player_id: row.player_id,
    player_name: row.player_name,
    number: row.number,
    position: row.position,
    photo: row.photo,
  };
}

export async function fetchTeamPlayers(teamIds: number[]): Promise<CupTeamPlayer[]> {
  const uniqueTeamIds = [...new Set(teamIds.filter((teamId) => Number.isInteger(teamId) && teamId > 0))];

  if (uniqueTeamIds.length === 0) return [];

  const supabase = requireSupabase();
  const rows: CupTeamPlayerRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('cup_team_players')
      .select('team_id,team_name,player_id,player_name,number,position,photo')
      .in('team_id', uniqueTeamIds)
      .order('team_id', { ascending: true })
      .order('position', { ascending: true })
      .order('player_name', { ascending: true })
      .range(from, from + TEAM_PLAYERS_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`No se pudieron cargar los jugadores: ${error.message}`);
    }

    const pageRows = (data ?? []) as CupTeamPlayerRow[];
    rows.push(...pageRows);

    if (pageRows.length < TEAM_PLAYERS_PAGE_SIZE) break;
    from += TEAM_PLAYERS_PAGE_SIZE;
  }

  return rows.map(toCupTeamPlayer);
}
