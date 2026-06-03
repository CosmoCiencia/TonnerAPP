export type MatchStatus = 'upcoming' | 'live' | 'finished';

export type Match = {
  id: string;
  team_home: string;
  team_away: string;
  home_team_id: number | null;
  away_team_id: number | null;
  home_logo: string | null;
  away_logo: string | null;
  group: string;
  date: string;
  score_home: number | null;
  score_away: number | null;
  elapsed_minutes: number | null;
  extra_minutes: number | null;
  status: MatchStatus;
  stadium: string;
  stage: string;
  round: string;
  city: string;
  goal_events: GoalEvent[];
};

export type GoalEvent = {
  side: 'home' | 'away';
  player_name: string;
  elapsed: number | null;
  extra: number | null;
  detail: string | null;
};

export type GroupStanding = {
  team: string;
  played: number;
  goalDiff: number;
  points: number;
};

export type GroupOverview = {
  group: string;
  teams: string[];
  standings: GroupStanding[];
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  prediction_result: 'home' | 'draw' | 'away';
  predicted_home: number;
  predicted_away: number;
};

export type PointEntry = {
  id: string;
  user_id: string;
  match_id: string;
  points_awarded: number;
};

export type RankingRow = {
  position: number;
  user_id: string;
  display_name?: string;
  cup_user_type?: 'public' | 'internal' | 'distributor';
  total_points: number;
  exact_hits: number;
  prediction_count: number;
};

export type MatchWithPrediction = {
  match: Match;
  prediction?: Prediction;
  points?: PointEntry;
};

declare global {
  interface Window {
    __TONNER_CONTEXT__?: {
      user_id?: string;
    };
  }
}
