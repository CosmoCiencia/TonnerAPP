export type MatchStatus = 'upcoming' | 'finished';

export type Match = {
  id: string;
  team_home: string;
  team_away: string;
  group: string;
  date: string;
  score_home: number | null;
  score_away: number | null;
  status: MatchStatus;
  stadium: string;
  stage: string;
  city: string;
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
  total_points: number;
  exact_hits: number;
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
