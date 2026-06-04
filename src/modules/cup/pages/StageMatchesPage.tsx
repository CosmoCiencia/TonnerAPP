import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import MatchCard from '../components/MatchCard';
import MatchDateNavigator from '../components/MatchDateNavigator';
import MatchStatusFilter, { type MatchStatusFilterValue } from '../components/MatchStatusFilter';
import SectionIntro from '../components/SectionIntro';
import { formatRoundLabel, getCupStage, stageMatches } from '../services/stages';
import type { MatchWithPrediction } from '../services/types';
import type { ReturnTypeCupData } from './types';

function getDateKey(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sortMatches(matches: MatchWithPrediction[]) {
  return [...matches].sort((first, second) => Date.parse(first.match.date) - Date.parse(second.match.date));
}

function getDefaultDate(dateKeys: string[]) {
  const today = getTodayKey();
  return dateKeys.find((dateKey) => dateKey >= today) ?? dateKeys[dateKeys.length - 1] ?? '';
}

function getStatusCounts(matches: MatchWithPrediction[]) {
  return {
    all: matches.length,
    live: matches.filter((item) => item.match.status === 'live').length,
    upcoming: matches.filter((item) => item.match.status === 'upcoming').length,
    finished: matches.filter((item) => item.match.status === 'finished').length,
  };
}

function StageMatchesPage() {
  const { stageSlug } = useParams();
  const cupData = useOutletContext<ReturnTypeCupData>();
  const stage = getCupStage(stageSlug);
  const matches = sortMatches(stageMatches(cupData.userMatches, stage.slug));
  const rounds = [...new Set(matches.map((item) => item.match.round))];
  const [activeRound, setActiveRound] = useState('');
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilterValue>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const selectedRound = rounds.includes(activeRound) ? activeRound : rounds[0] ?? '';
  const roundMatches = stage.slug === 'todos'
    ? matches
    : matches.filter((item) => item.match.round === selectedRound);
  const statusCounts = getStatusCounts(roundMatches);
  const filteredMatches = statusFilter === 'all'
    ? roundMatches
    : roundMatches.filter((item) => item.match.status === statusFilter);
  const dateKeys = [...new Set(filteredMatches.map((item) => getDateKey(item.match.date)))];
  const activeDate = dateKeys.includes(selectedDate) ? selectedDate : getDefaultDate(dateKeys);
  const dayMatches = filteredMatches.filter((item) => getDateKey(item.match.date) === activeDate);

  return (
    <section className="min-w-0 space-y-4">
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
        <>
          {stage.slug !== 'todos' && rounds.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {rounds.map((round) => (
                <button
                  key={round}
                  type="button"
                  onClick={() => {
                    setActiveRound(round);
                    setSelectedDate('');
                  }}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-black transition ${
                    selectedRound === round
                      ? 'bg-white text-tonner-blue'
                      : 'bg-white/10 text-white/75'
                  }`}
                >
                  {formatRoundLabel(round)}
                </button>
              ))}
            </div>
          ) : null}

          <MatchStatusFilter value={statusFilter} counts={statusCounts} onChange={(value) => {
            setStatusFilter(value);
            setSelectedDate('');
          }} />

          {dateKeys.length > 0 ? (
            <MatchDateNavigator
              dateKeys={dateKeys}
              selectedDate={activeDate}
              onSelectDate={setSelectedDate}
            />
          ) : null}

          {dayMatches.length > 0 ? (
            <div className="overflow-hidden rounded-lg bg-white shadow-[0_12px_28px_rgba(15,23,42,0.14)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {stage.slug === 'todos' ? 'Mundial 2026' : formatRoundLabel(selectedRound)}
                </p>
                <span className="text-[10px] font-bold text-slate-400">
                  {dayMatches.length} {dayMatches.length === 1 ? 'partido' : 'partidos'}
                </span>
              </div>
              {dayMatches.map((item) => (
                <MatchCard key={item.match.id} item={item} showPredictionStatus />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white px-4 py-4 text-center text-sm font-semibold text-slate-500">
              No hay partidos con este filtro.
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default StageMatchesPage;
