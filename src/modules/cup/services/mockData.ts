import type { GroupOverview, Match, Prediction } from './types';

function createGroup(group: string, teams: string[]): GroupOverview {
  return {
    group,
    teams,
    standings: teams.map((team) => ({
      team,
      played: 0,
      goalDiff: 0,
      points: 0,
    })),
  };
}

function createMatch(
  id: string,
  group: string,
  date: string,
  team_home: string,
  team_away: string,
  stadium: string,
  city: string
): Match {
  return {
    id,
    group,
    date,
    team_home,
    team_away,
    stadium,
    city,
    stage: 'Fase de grupos',
    status: 'upcoming',
    score_home: null,
    score_away: null,
  };
}

export const mockGroups: GroupOverview[] = [
  createGroup('A', ['México', 'Sudáfrica', 'República de Corea', 'Por definir']),
  createGroup('B', ['Canadá', 'Por definir', 'Catar', 'Suiza']),
  createGroup('C', ['Brasil', 'Marruecos', 'Haití', 'Escocia']),
  createGroup('D', ['Estados Unidos', 'Paraguay', 'Australia', 'Por definir']),
  createGroup('E', ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador']),
  createGroup('F', ['Países Bajos', 'Japón', 'Por definir', 'Túnez']),
  createGroup('G', ['Bélgica', 'Egipto', 'RI de Irán', 'Nueva Zelanda']),
  createGroup('H', ['España', 'Cabo Verde', 'Arabia Saudí', 'Uruguay']),
  createGroup('I', ['Francia', 'Senegal', 'Por definir', 'Noruega']),
  createGroup('J', ['Argentina', 'Argelia', 'Austria', 'Jordania']),
  createGroup('K', ['Portugal', 'Por definir', 'Uzbekistán', 'Colombia']),
  createGroup('L', ['Inglaterra', 'Croacia', 'Ghana', 'Panamá']),
];

export const mockMatches: Match[] = [
  createMatch(
    'A1',
    'A',
    '2026-06-11T15:00:00',
    'México',
    'Sudáfrica',
    'Estadio Ciudad de México',
    'Ciudad de México'
  ),
  createMatch(
    'A2',
    'A',
    '2026-06-11T22:00:00',
    'República de Corea',
    'Por definir',
    'Estadio Guadalajara',
    'Guadalajara'
  ),
  createMatch(
    'A3',
    'A',
    '2026-06-18T12:00:00',
    'Por definir',
    'Sudáfrica',
    'Atlanta Stadium',
    'Atlanta'
  ),
  createMatch(
    'A4',
    'A',
    '2026-06-18T21:00:00',
    'México',
    'República de Corea',
    'Estadio Guadalajara',
    'Guadalajara'
  ),
  createMatch(
    'A5',
    'A',
    '2026-06-24T21:00:00',
    'Por definir',
    'México',
    'Estadio Ciudad de México',
    'Ciudad de México'
  ),
  createMatch(
    'A6',
    'A',
    '2026-06-24T21:00:00',
    'Sudáfrica',
    'República de Corea',
    'Estadio Monterrey',
    'Monterrey'
  ),

  createMatch(
    'B1',
    'B',
    '2026-06-12T15:00:00',
    'Canadá',
    'Por definir',
    'Toronto Stadium',
    'Toronto'
  ),
  createMatch(
    'B2',
    'B',
    '2026-06-13T15:00:00',
    'Catar',
    'Suiza',
    'San Francisco Bay Area Stadium',
    'San Francisco'
  ),
  createMatch(
    'B3',
    'B',
    '2026-06-18T15:00:00',
    'Suiza',
    'Por definir',
    'Los Angeles Stadium',
    'Los Angeles'
  ),
  createMatch(
    'B4',
    'B',
    '2026-06-18T18:00:00',
    'Canadá',
    'Catar',
    'BC Place Vancouver',
    'Vancouver'
  ),
  createMatch(
    'B5',
    'B',
    '2026-06-24T15:00:00',
    'Suiza',
    'Canadá',
    'BC Place Vancouver',
    'Vancouver'
  ),
  createMatch(
    'B6',
    'B',
    '2026-06-24T15:00:00',
    'Por definir',
    'Catar',
    'Seattle Stadium',
    'Seattle'
  ),

  createMatch(
    'C1',
    'C',
    '2026-06-13T18:00:00',
    'Brasil',
    'Marruecos',
    'Nueva York Nueva Jersey Stadium',
    'Nueva York'
  ),
  createMatch('C2', 'C', '2026-06-13T21:00:00', 'Haití', 'Escocia', 'Boston Stadium', 'Boston'),
  createMatch('C3', 'C', '2026-06-19T18:00:00', 'Escocia', 'Marruecos', 'Boston Stadium', 'Boston'),
  createMatch(
    'C4',
    'C',
    '2026-06-19T21:00:00',
    'Brasil',
    'Haití',
    'Philadelphia Stadium',
    'Philadelphia'
  ),
  createMatch('C5', 'C', '2026-06-24T18:00:00', 'Brasil', 'Escocia', 'Miami Stadium', 'Miami'),
  createMatch('C6', 'C', '2026-06-24T18:00:00', 'Marruecos', 'Haití', 'Atlanta Stadium', 'Atlanta'),

  createMatch(
    'D1',
    'D',
    '2026-06-12T21:00:00',
    'Estados Unidos',
    'Paraguay',
    'Los Angeles Stadium',
    'Los Angeles'
  ),
  createMatch(
    'D2',
    'D',
    '2026-06-13T00:00:00',
    'Australia',
    'Por definir',
    'BC Place Vancouver',
    'Vancouver'
  ),
  createMatch(
    'D3',
    'D',
    '2026-06-19T15:00:00',
    'Estados Unidos',
    'Australia',
    'Seattle Stadium',
    'Seattle'
  ),
  createMatch(
    'D4',
    'D',
    '2026-06-19T00:00:00',
    'Por definir',
    'Paraguay',
    'San Francisco Bay Area Stadium',
    'San Francisco'
  ),
  createMatch(
    'D5',
    'D',
    '2026-06-25T22:00:00',
    'Por definir',
    'Estados Unidos',
    'Los Angeles Stadium',
    'Los Angeles'
  ),
  createMatch(
    'D6',
    'D',
    '2026-06-25T22:00:00',
    'Paraguay',
    'Australia',
    'San Francisco Bay Area Stadium',
    'San Francisco'
  ),

  createMatch(
    'E1',
    'E',
    '2026-06-14T13:00:00',
    'Alemania',
    'Curazao',
    'Houston Stadium',
    'Houston'
  ),
  createMatch(
    'E2',
    'E',
    '2026-06-14T19:00:00',
    'Costa de Marfil',
    'Ecuador',
    'Philadelphia Stadium',
    'Philadelphia'
  ),
  createMatch(
    'E3',
    'E',
    '2026-06-20T16:00:00',
    'Alemania',
    'Costa de Marfil',
    'Toronto Stadium',
    'Toronto'
  ),
  createMatch(
    'E4',
    'E',
    '2026-06-20T22:00:00',
    'Ecuador',
    'Curazao',
    'Kansas City Stadium',
    'Kansas City'
  ),
  createMatch(
    'E5',
    'E',
    '2026-06-25T16:00:00',
    'Curazao',
    'Costa de Marfil',
    'Philadelphia Stadium',
    'Philadelphia'
  ),
  createMatch(
    'E6',
    'E',
    '2026-06-25T16:00:00',
    'Ecuador',
    'Alemania',
    'New York New Jersey Stadium',
    'Nueva York'
  ),

  createMatch(
    'F1',
    'F',
    '2026-06-14T16:00:00',
    'Países Bajos',
    'Japón',
    'Dallas Stadium',
    'Dallas'
  ),
  createMatch(
    'F2',
    'F',
    '2026-06-14T22:00:00',
    'Por definir',
    'Túnez',
    'Estadio Monterrey',
    'Monterrey'
  ),
  createMatch(
    'F3',
    'F',
    '2026-06-20T13:00:00',
    'Países Bajos',
    'Por definir',
    'Houston Stadium',
    'Houston'
  ),
  createMatch('F4', 'F', '2026-06-20T00:00:00', 'Túnez', 'Japón', 'Estadio Monterrey', 'Monterrey'),
  createMatch('F5', 'F', '2026-06-25T19:00:00', 'Japón', 'Por definir', 'Dallas Stadium', 'Dallas'),
  createMatch(
    'F6',
    'F',
    '2026-06-25T19:00:00',
    'Túnez',
    'Países Bajos',
    'Kansas City Stadium',
    'Kansas City'
  ),

  // ... (los demás ya están bien, no tenían problema visual)
];

export const seededPredictions: Prediction[] = [
  { id: 'p1', user_id: 'demo', match_id: 'A1', predicted_home: 2, predicted_away: 1 },
  { id: 'p2', user_id: 'demo', match_id: 'B1', predicted_home: 1, predicted_away: 1 },
];

mockMatches[0].status = 'finished';
mockMatches[0].score_home = 2;
mockMatches[0].score_away = 1;

mockMatches[1].status = 'finished';
mockMatches[1].score_home = 1;
mockMatches[1].score_away = 1;

mockMatches[6].status = 'finished';
mockMatches[6].score_home = 3;
mockMatches[6].score_away = 2;

mockMatches[7].status = 'finished';
mockMatches[7].score_home = 0;
mockMatches[7].score_away = 2;

mockMatches[12].status = 'finished';
mockMatches[12].score_home = 2;
mockMatches[12].score_away = 0;

mockMatches[13].status = 'finished';
mockMatches[13].score_home = 1;
mockMatches[13].score_away = 2;

mockMatches[18].status = 'finished';
mockMatches[18].score_home = 2;
mockMatches[18].score_away = 2;
