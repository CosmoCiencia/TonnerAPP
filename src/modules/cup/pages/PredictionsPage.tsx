import { Info } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import MatchDateNavigator from '../components/MatchDateNavigator';
import MatchStatusFilter, { type MatchStatusFilterValue } from '../components/MatchStatusFilter';
import PredictionEditorCard from '../components/PredictionEditorCard';
import SectionIntro from '../components/SectionIntro';
import { getCupDateKey, getCupTodayKey } from '../services/cupDateKeys';
import { isKnockoutMatch } from '../services/predictionOutcome';
import type { MatchWithPrediction } from '../services/types';
import type { ReturnTypeCupData } from './types';

function sortMatches(matches: MatchWithPrediction[]) {
  return [...matches].sort((first, second) => Date.parse(first.match.date) - Date.parse(second.match.date));
}

function getDefaultDate(dateKeys: string[]) {
  const today = getCupTodayKey();
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

function PredictionsPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();
  const matches = sortMatches(cupData.userMatches);
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilterValue>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const statusCounts = getStatusCounts(matches);
  const filteredMatches = statusFilter === 'all'
    ? matches
    : matches.filter((item) => item.match.status === statusFilter);
  const dateKeys = [...new Set(filteredMatches.map((item) => getCupDateKey(item.match.date)))];
  const activeDate = dateKeys.includes(selectedDate) ? selectedDate : getDefaultDate(dateKeys);
  const dayMatches = filteredMatches.filter((item) => getCupDateKey(item.match.date) === activeDate);
  const hasKnockoutMatches = matches.some((item) => isKnockoutMatch(item.match));

  return (
    <section className="min-w-0 space-y-4">
      <SectionIntro
        eyebrow="Predicciones"
        title="Elige tus pronósticos"
        description="Elige el resultado y pronostica el marcador final."
      />

      {hasKnockoutMatches ? (
        <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-tonner-slate">
          <Info className="mt-0.5 shrink-0 text-tonner-blue" size={18} aria-hidden="true" />
          <div>
            <p className="text-xs font-black">Nueva fase</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              En eliminatorias siempre debe haber un clasificado. Si pronosticas un marcador empatado, elige quién gana por penales.
            </p>
          </div>
        </div>
      ) : null}

      {cupData.loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, index) => <LoadingCard key={index} />)}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          title="No hay partidos para predecir"
          description="Cuando haya partidos cargados, aparecerán organizados por fecha."
        />
      ) : (
        <>
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
                  Predicciones
                </p>
                <span className="text-[10px] font-bold text-slate-400">
                  {dayMatches.length} {dayMatches.length === 1 ? 'partido' : 'partidos'}
                </span>
              </div>
              {dayMatches.map((item) => (
                <PredictionEditorCard
                  key={`${item.match.id}-${item.prediction?.predicted_home ?? 'none'}-${item.prediction?.predicted_away ?? 'none'}-${item.prediction?.predicted_qualifier ?? 'none'}`}
                  item={item}
                  saving={cupData.savingMatchId === item.match.id}
                  onSave={cupData.savePrediction}
                />
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

export default PredictionsPage;
