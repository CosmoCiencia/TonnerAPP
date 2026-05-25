import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import SectionIntro from '../components/SectionIntro';
import TeamBadge from '../components/TeamBadge';
import { getOutcomeLabel, type PredictionOutcome } from '../services/predictionOutcome';
import type { Match } from '../services/types';

type DemoMatch = Match & {
  actualResult: PredictionOutcome;
};

type DemoUser = {
  id: string;
  name: string;
};

type DemoPrediction = {
  userId: string;
  matchId: string;
  result: PredictionOutcome;
};

const demoUsers: DemoUser[] = [
  { id: 'demo-tu', name: 'Tú Demo' },
  { id: 'demo-laura', name: 'Laura Ventas' },
  { id: 'demo-carlos', name: 'Carlos Color' },
  { id: 'demo-maria', name: 'María Tienda' },
];

const demoMatches: DemoMatch[] = [
  {
    id: 'demo-1',
    team_home: 'México',
    team_away: 'South Africa',
    home_logo: null,
    away_logo: null,
    group: 'A',
    date: '2026-06-11T14:00:00-05:00',
    score_home: null,
    score_away: null,
    status: 'upcoming',
    stadium: 'Estadio Azteca',
    stage: 'Fase de grupos',
    round: 'Jornada demo',
    city: 'Mexico City',
    actualResult: 'home',
  },
  {
    id: 'demo-2',
    team_home: 'Colombia',
    team_away: 'Japón',
    home_logo: null,
    away_logo: null,
    group: 'B',
    date: '2026-06-12T17:00:00-05:00',
    score_home: null,
    score_away: null,
    status: 'upcoming',
    stadium: 'Demo Stadium',
    stage: 'Fase de grupos',
    round: 'Jornada demo',
    city: 'Miami',
    actualResult: 'draw',
  },
  {
    id: 'demo-3',
    team_home: 'Brasil',
    team_away: 'Marruecos',
    home_logo: null,
    away_logo: null,
    group: 'C',
    date: '2026-06-13T19:00:00-05:00',
    score_home: null,
    score_away: null,
    status: 'upcoming',
    stadium: 'Demo Arena',
    stage: 'Fase de grupos',
    round: 'Jornada demo',
    city: 'Dallas',
    actualResult: 'away',
  },
  {
    id: 'demo-4',
    team_home: 'Argentina',
    team_away: 'Francia',
    home_logo: null,
    away_logo: null,
    group: 'D',
    date: '2026-06-14T15:00:00-05:00',
    score_home: null,
    score_away: null,
    status: 'upcoming',
    stadium: 'Demo Field',
    stage: 'Fase de grupos',
    round: 'Jornada demo',
    city: 'Los Angeles',
    actualResult: 'home',
  },
  {
    id: 'demo-5',
    team_home: 'España',
    team_away: 'Estados Unidos',
    home_logo: null,
    away_logo: null,
    group: 'E',
    date: '2026-06-15T20:00:00-05:00',
    score_home: null,
    score_away: null,
    status: 'upcoming',
    stadium: 'Demo Park',
    stage: 'Fase de grupos',
    round: 'Jornada demo',
    city: 'New York',
    actualResult: 'draw',
  },
];

const initialPredictions: DemoPrediction[] = [
  { userId: 'demo-laura', matchId: 'demo-1', result: 'home' },
  { userId: 'demo-laura', matchId: 'demo-2', result: 'draw' },
  { userId: 'demo-laura', matchId: 'demo-3', result: 'home' },
  { userId: 'demo-laura', matchId: 'demo-4', result: 'away' },
  { userId: 'demo-laura', matchId: 'demo-5', result: 'draw' },
  { userId: 'demo-carlos', matchId: 'demo-1', result: 'away' },
  { userId: 'demo-carlos', matchId: 'demo-2', result: 'draw' },
  { userId: 'demo-carlos', matchId: 'demo-3', result: 'away' },
  { userId: 'demo-carlos', matchId: 'demo-4', result: 'home' },
  { userId: 'demo-carlos', matchId: 'demo-5', result: 'home' },
  { userId: 'demo-maria', matchId: 'demo-1', result: 'home' },
  { userId: 'demo-maria', matchId: 'demo-2', result: 'away' },
  { userId: 'demo-maria', matchId: 'demo-3', result: 'draw' },
  { userId: 'demo-maria', matchId: 'demo-4', result: 'home' },
  { userId: 'demo-maria', matchId: 'demo-5', result: 'draw' },
];

function formatDemoDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

function buildPredictionKey(userId: string, matchId: string) {
  return `${userId}:${matchId}`;
}

function DemoPage() {
  const [activeUserId, setActiveUserId] = useState(demoUsers[0].id);
  const [predictions, setPredictions] = useState(() => {
    const entries = initialPredictions.map((prediction): [string, PredictionOutcome] => [
      buildPredictionKey(prediction.userId, prediction.matchId),
      prediction.result,
    ]);
    return new Map<string, PredictionOutcome>(entries);
  });
  const [simulated, setSimulated] = useState(false);

  const activeUser = demoUsers.find((user) => user.id === activeUserId) ?? demoUsers[0];

  const ranking = useMemo(() => {
    if (!simulated) return [];

    return demoUsers
      .map((user) => {
        const hits = demoMatches.reduce((total, match) => {
          const prediction = predictions.get(buildPredictionKey(user.id, match.id));
          return total + (prediction === match.actualResult ? 1 : 0);
        }, 0);

        return {
          ...user,
          hits,
          points: hits * 5,
        };
      })
      .sort((left, right) => right.points - left.points || right.hits - left.hits || left.name.localeCompare(right.name))
      .map((row, index) => ({ ...row, position: index + 1 }));
  }, [predictions, simulated]);

  const savePrediction = (matchId: string, result: PredictionOutcome) => {
    setPredictions((current) => {
      const next = new Map(current);
      next.set(buildPredictionKey(activeUser.id, matchId), result);
      return next;
    });
    setSimulated(false);
  };

  const resetDemo = () => {
    setPredictions(new Map(initialPredictions.map((prediction): [string, PredictionOutcome] => [
      buildPredictionKey(prediction.userId, prediction.matchId),
      prediction.result,
    ])));
    setActiveUserId(demoUsers[0].id);
    setSimulated(false);
  };

  return (
    <section className="space-y-5">
      <SectionIntro
        eyebrow="Modo demo"
        title="Demo TonnerCup"
        description="Flujo completo con datos locales. No toca Supabase ni partidos reales."
      />

      <div className="rounded-xl border border-yellow-300/40 bg-yellow-100 px-4 py-3 text-center text-sm font-black text-yellow-900">
        Modo demo seguro: predicciones, resultados y ranking viven solo en esta pantalla.
      </div>

      <div className="cup-card space-y-3 text-tonner-slate">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Usuario demo</p>
        <div className="grid grid-cols-2 gap-2">
          {demoUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setActiveUserId(user.id)}
              className={`rounded-xl border px-3 py-2 text-sm font-black transition ${
                user.id === activeUser.id
                  ? 'border-tonner-blue bg-tonner-blue text-white'
                  : 'border-slate-200 bg-white text-tonner-blue'
              }`}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {demoMatches.map((match) => {
          const prediction = predictions.get(buildPredictionKey(activeUser.id, match.id));

          return (
            <article key={match.id} className="cup-card p-4 text-tonner-slate">
              <div className="mb-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Partido demo
                </p>
                <p className="mt-1 text-xs font-black text-tonner-slate">{formatDemoDate(match.date)}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">
                  {match.city} · {match.stadium}
                </p>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_2.8rem_minmax(0,1fr)] items-start gap-2">
                <div className="min-w-0 text-center">
                  <TeamBadge name={match.team_home} logo={match.home_logo} size="lg" />
                  <p className="mx-auto mt-2 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight">
                    {match.team_home}
                  </p>
                </div>
                <div className="flex items-center justify-center pt-5">
                  <span className="rounded-full bg-tonner-blue px-2.5 py-1 text-xs font-black text-white">VS</span>
                </div>
                <div className="min-w-0 text-center">
                  <TeamBadge name={match.team_away} logo={match.away_logo} size="lg" />
                  <p className="mx-auto mt-2 line-clamp-2 max-w-[6.3rem] text-sm font-black leading-tight">
                    {match.team_away}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {(['home', 'draw', 'away'] as PredictionOutcome[]).map((result) => {
                  const selected = prediction === result;

                  return (
                    <button
                      key={result}
                      type="button"
                      onClick={() => savePrediction(match.id, result)}
                      className={`min-h-[2.6rem] rounded-xl border px-2 py-2 text-[11px] font-black leading-tight transition ${
                        selected
                          ? 'border-tonner-blue bg-tonner-blue text-white shadow-[0_10px_22px_rgba(45,89,199,0.22)]'
                          : 'border-slate-200 bg-white text-tonner-blue'
                      }`}
                    >
                      {getOutcomeLabel(match, result)}
                    </button>
                  );
                })}
              </div>

              {simulated ? (
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs font-black text-slate-600">
                  Resultado demo: {getOutcomeLabel(match, match.actualResult)} ·{' '}
                  {prediction === match.actualResult ? '+5 puntos' : '0 puntos'}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          className="rounded-xl bg-tonner-orange px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,125,0,0.18)]"
          onClick={() => setSimulated(true)}
        >
          Simular resultados
        </button>
        <button
          type="button"
          className="rounded-xl bg-white/15 px-5 py-3 text-sm font-black text-white"
          onClick={resetDemo}
        >
          Reiniciar demo
        </button>
      </div>

      {simulated ? (
        <section className="space-y-3">
          <h3 className="text-center font-display text-2xl font-black text-white">Ranking demo</h3>
          <div className="cup-card grid gap-3 text-tonner-slate">
            {ranking.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-black">#{row.position} {row.name}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {row.hits} aciertos
                  </p>
                </div>
                <strong className="text-2xl text-tonner-blue">{row.points}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title="Ranking demo pendiente"
          description="Elige predicciones y toca simular resultados para ver puntos."
        />
      )}
    </section>
  );
}

export default DemoPage;
