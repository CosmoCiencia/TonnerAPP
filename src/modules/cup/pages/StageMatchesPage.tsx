import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import MatchCard from '../components/MatchCard';
import SectionIntro from '../components/SectionIntro';
import { formatRoundLabel, getCupStage, stageMatches } from '../services/stages';
import type { ReturnTypeCupData } from './types';

function getDateKey(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatAgendaDate(dateKey: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateKey}T12:00:00`));
}

function formatAgendaMonth(dateKey: string) {
  return new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`));
}

function StageMatchesPage() {
  const { stageSlug } = useParams();
  const cupData = useOutletContext<ReturnTypeCupData>();
  const stage = getCupStage(stageSlug);
  const matches = stageMatches(cupData.userMatches, stage.slug);
  const rounds = [...new Set(matches.map((item) => item.match.round))];
  const [activeRound, setActiveRound] = useState(rounds[0] || '');
  const selectedRound = rounds.includes(activeRound) ? activeRound : rounds[0];
  const roundMatches = matches.filter((item) => item.match.round === selectedRound);
  const dateKeys = [...new Set(roundMatches.map((item) => getDateKey(item.match.date)))];
  const agendaMonth = dateKeys[0] ? formatAgendaMonth(dateKeys[0]) : '';
  const dateGroups = dateKeys.map((dateKey) => ({
    dateKey,
    matches: roundMatches.filter((item) => getDateKey(item.match.date) === dateKey),
  }));

  return (
    <section className="space-y-5">
      <SectionIntro eyebrow={stage.title} title={stage.title} description={stage.description} />

      {cupData.loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          title={`No hay partidos de ${stage.title.toLowerCase()}`}
          description="Cuando API-Football publique fixtures para esta fase, aparecerán aquí."
        />
      ) : (
        <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {rounds.map((round) => (
              <button
                key={round}
                type="button"
                onClick={() => setActiveRound(round)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
                  selectedRound === round
                    ? 'bg-tonner-blue text-white'
                    : 'bg-white text-tonner-blue shadow-[0_10px_24px_rgba(45,89,199,0.12)]'
                }`}
              >
                {formatRoundLabel(round)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.1rem] bg-white/10 px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                Calendario
              </p>
              <p className="mt-1 font-display text-xl font-black capitalize text-white">
                {agendaMonth}
              </p>
            </div>

            {dateGroups.map(({ dateKey, matches: dayMatches }) => (
              <section key={dateKey} className="space-y-3">
                <div className="sticky top-0 z-10 rounded-xl border border-white/15 bg-tonner-blue px-4 py-3 text-white shadow-[0_12px_24px_rgba(8,43,104,0.2)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-black capitalize">
                      {formatAgendaDate(dateKey)}
                    </p>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                      {dayMatches.length} partidos
                    </span>
                  </div>
                </div>

                {dayMatches.map((item) => (
                  <MatchCard key={item.match.id} item={item} showPredictionStatus />
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default StageMatchesPage;
