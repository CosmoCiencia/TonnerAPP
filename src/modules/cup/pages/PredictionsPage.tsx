import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingCard from '../components/LoadingCard';
import PredictionEditorCard from '../components/PredictionEditorCard';
import SectionIntro from '../components/SectionIntro';
import type { ReturnTypeCupData } from './types';

function getDateKey(date: string) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDateRange(dateKeys: string[]) {
  if (!dateKeys.length) return '';

  const formatDate = (dateKey: string) =>
    new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${dateKey}T12:00:00`));

  const firstDate = dateKeys[0];
  const lastDate = dateKeys[dateKeys.length - 1];

  return firstDate === lastDate ? formatDate(firstDate) : `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
}

function formatMatchDateRange(matches: ReturnTypeCupData['userMatches']) {
  return formatDateRange([...new Set(matches.map((item) => getDateKey(item.match.date)))]);
}

function statusOrder(status: ReturnTypeCupData['userMatches'][number]['match']['status']) {
  if (status === 'live') return 0;
  if (status === 'upcoming') return 1;
  return 2;
}

function sortMatchesForPredictions(matches: ReturnTypeCupData['userMatches']) {
  return [...matches].sort((first, second) => {
    const statusDelta = statusOrder(first.match.status) - statusOrder(second.match.status);
    if (statusDelta !== 0) return statusDelta;

    if (first.match.status === 'finished' && second.match.status === 'finished') {
      return Date.parse(second.match.date) - Date.parse(first.match.date);
    }

    return Date.parse(first.match.date) - Date.parse(second.match.date);
  });
}

function getDefaultSection(matches: ReturnTypeCupData['userMatches']) {
  if (matches.some((item) => item.match.status === 'live')) return 'live';
  if (matches.some((item) => item.match.status === 'upcoming')) return 'upcoming';
  if (matches.some((item) => item.match.status === 'finished')) return 'finished';
  return '';
}

function PredictionStatusSection({
  title,
  matches,
  emptyDescription,
  expanded,
  savingMatchId,
  onToggle,
  onSave,
  visibleCount,
  onShowMore,
}: {
  title: string;
  matches: ReturnTypeCupData['userMatches'];
  emptyDescription: string;
  expanded: boolean;
  savingMatchId: string | null;
  onToggle: () => void;
  onSave: ReturnTypeCupData['savePrediction'];
  visibleCount?: number;
  onShowMore?: () => void;
}) {
  const visibleMatches = visibleCount === undefined ? matches : matches.slice(0, visibleCount);
  const hasMoreMatches = visibleMatches.length < matches.length;
  const dateRange = formatMatchDateRange(visibleMatches);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-xl border border-white/15 bg-tonner-blue px-4 py-3 text-left text-white shadow-[0_12px_24px_rgba(8,43,104,0.2)]"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-black">{title}</p>
            <p className="mt-0.5 text-xs font-semibold text-white/75">
              {matches.length === 1 ? '1 partido' : `${matches.length} partidos`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
              {matches.length}
            </span>
            <span className="text-lg font-black" aria-hidden="true">
              {expanded ? '-' : '+'}
            </span>
          </div>
        </div>
        {expanded && dateRange ? (
          <div className="mt-3 flex justify-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-black capitalize text-tonner-blue shadow-[0_8px_18px_rgba(2,8,23,0.14)]">
              {dateRange}
            </span>
          </div>
        ) : null}
      </button>

      {expanded ? (
        matches.length > 0 ? (
          <>
            {visibleMatches.map((item) => (
              <PredictionEditorCard
                key={`${item.match.id}-${item.prediction?.predicted_home ?? 0}-${item.prediction?.predicted_away ?? 0}`}
                item={item}
                saving={savingMatchId === item.match.id}
                onSave={onSave}
              />
            ))}

            {hasMoreMatches && onShowMore ? (
              <button
                type="button"
                className="w-full rounded-xl bg-white px-5 py-3 text-sm font-black text-tonner-blue shadow-[0_12px_24px_rgba(45,89,199,0.16)]"
                onClick={onShowMore}
              >
                Ver más {title.toLowerCase()}
              </button>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-500 shadow-[0_10px_22px_rgba(15,23,42,0.08)]">
            {emptyDescription}
          </div>
        )
      ) : null}
    </section>
  );
}

function PredictionsPage() {
  const cupData = useOutletContext<ReturnTypeCupData>();
  const liveMatches = sortMatchesForPredictions(
    cupData.userMatches.filter((item) => item.match.status === 'live'),
  );
  const upcomingMatches = sortMatchesForPredictions(
    cupData.userMatches.filter((item) => item.match.status === 'upcoming'),
  );
  const finishedMatches = sortMatchesForPredictions(
    cupData.userMatches.filter((item) => item.match.status === 'finished'),
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [visibleUpcoming, setVisibleUpcoming] = useState(5);
  const [visibleFinished, setVisibleFinished] = useState(5);
  const activeSection = expandedSection ?? getDefaultSection(cupData.userMatches);

  const toggleSection = (section: string) => {
    setExpandedSection((current) => ((current ?? activeSection) === section ? '' : section));
  };

  return (
    <section>
      <SectionIntro
        eyebrow="Predicciones"
        title="Elige tus pronósticos"
        description="Elige el resultado y pronostica el marcador final."
      />

      <div className="grid gap-3">
        {cupData.loading ? (
          Array.from({ length: 3 }, (_, index) => <LoadingCard key={index} />)
        ) : cupData.userMatches.length === 0 ? (
          <EmptyState
            title="No hay partidos para predecir"
            description="Cuando haya partidos cargados, aparecerán organizados por estado."
          />
        ) : (
          <>
            <PredictionStatusSection
              title="En vivo"
              matches={liveMatches}
              emptyDescription="No hay partidos en vivo ahora."
              expanded={activeSection === 'live'}
              savingMatchId={cupData.savingMatchId}
              onToggle={() => toggleSection('live')}
              onSave={cupData.savePrediction}
            />
            <PredictionStatusSection
              title="Próximos"
              matches={upcomingMatches}
              emptyDescription="No hay próximos partidos cargados."
              expanded={activeSection === 'upcoming'}
              savingMatchId={cupData.savingMatchId}
              onToggle={() => toggleSection('upcoming')}
              onSave={cupData.savePrediction}
              visibleCount={visibleUpcoming}
              onShowMore={() => setVisibleUpcoming((current) => current + 5)}
            />
            <PredictionStatusSection
              title="Finalizados"
              matches={finishedMatches}
              emptyDescription="Todavía no hay partidos finalizados."
              expanded={activeSection === 'finished'}
              savingMatchId={cupData.savingMatchId}
              onToggle={() => toggleSection('finished')}
              onSave={cupData.savePrediction}
              visibleCount={visibleFinished}
              onShowMore={() => setVisibleFinished((current) => current + 5)}
            />
          </>
        )}
      </div>
    </section>
  );
}

export default PredictionsPage;
