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

function sortMatchesForOverview(matches: ReturnTypeCupData['userMatches']) {
  return [...matches].sort((first, second) => {
    const statusDelta = statusOrder(first.match.status) - statusOrder(second.match.status);
    if (statusDelta !== 0) return statusDelta;

    if (first.match.status === 'finished' && second.match.status === 'finished') {
      return Date.parse(second.match.date) - Date.parse(first.match.date);
    }

    return Date.parse(first.match.date) - Date.parse(second.match.date);
  });
}

function MatchStatusSection({
  title,
  matches,
  emptyDescription,
  expanded,
  onToggle,
  visibleCount,
  onShowMore,
}: {
  title: string;
  matches: ReturnTypeCupData['userMatches'];
  emptyDescription: string;
  expanded: boolean;
  onToggle: () => void;
  visibleCount?: number;
  onShowMore?: () => void;
}) {
  const visibleMatches = visibleCount === undefined ? matches : matches.slice(0, visibleCount);
  const hasMoreMatches = visibleMatches.length < matches.length;

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
              {expanded ? '−' : '+'}
            </span>
          </div>
        </div>
      </button>

      {expanded ? (
        matches.length > 0 ? (
          <>
            {visibleMatches.map((item) => (
              <MatchCard key={item.match.id} item={item} showPredictionStatus />
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

function StatusOverview({ matches }: { matches: ReturnTypeCupData['userMatches'] }) {
  const liveMatches = sortMatchesForOverview(matches.filter((item) => item.match.status === 'live'));
  const upcomingMatches = sortMatchesForOverview(matches.filter((item) => item.match.status === 'upcoming'));
  const finishedMatches = sortMatchesForOverview(matches.filter((item) => item.match.status === 'finished'));
  const defaultSection = liveMatches.length > 0 ? 'live' : upcomingMatches.length > 0 ? 'upcoming' : 'finished';
  const [expandedSection, setExpandedSection] = useState(defaultSection);
  const [visibleUpcoming, setVisibleUpcoming] = useState(5);
  const [visibleFinished, setVisibleFinished] = useState(5);

  const toggleSection = (section: string) => {
    setExpandedSection((current) => (current === section ? '' : section));
  };

  return (
    <div className="space-y-3">
      <MatchStatusSection
        title="En vivo"
        matches={liveMatches}
        emptyDescription="No hay partidos en vivo ahora."
        expanded={expandedSection === 'live'}
        onToggle={() => toggleSection('live')}
      />
      <MatchStatusSection
        title="Próximos"
        matches={upcomingMatches}
        emptyDescription="No hay próximos partidos cargados."
        expanded={expandedSection === 'upcoming'}
        onToggle={() => toggleSection('upcoming')}
        visibleCount={visibleUpcoming}
        onShowMore={() => setVisibleUpcoming((current) => current + 5)}
      />
      <MatchStatusSection
        title="Finalizados"
        matches={finishedMatches}
        emptyDescription="Todavía no hay partidos finalizados."
        expanded={expandedSection === 'finished'}
        onToggle={() => toggleSection('finished')}
        visibleCount={visibleFinished}
        onShowMore={() => setVisibleFinished((current) => current + 5)}
      />
    </div>
  );
}

function StageMatchesPage() {
  const { stageSlug } = useParams();
  const cupData = useOutletContext<ReturnTypeCupData>();
  const stage = getCupStage(stageSlug);
  const matches = stageMatches(cupData.userMatches, stage.slug);
  const rounds = [...new Set(matches.map((item) => item.match.round))];
  const [activeRound, setActiveRound] = useState(rounds[0] || '');
  const [showFullRound, setShowFullRound] = useState(false);
  const selectedRound = rounds.includes(activeRound) ? activeRound : rounds[0];
  const roundMatches = matches.filter((item) => item.match.round === selectedRound);
  const dateKeys = [...new Set(roundMatches.map((item) => getDateKey(item.match.date)))];
  const agendaMonth = dateKeys[0] ? formatAgendaMonth(dateKeys[0]) : '';
  const nextMatches = roundMatches.slice(0, 5);
  const nextDateRange = formatMatchDateRange(nextMatches);
  const dateGroups = dateKeys.map((dateKey) => ({
    dateKey,
    matches: roundMatches.filter((item) => getDateKey(item.match.date) === dateKey),
  }));
  const showStatusOverview = stage.slug === 'todos';

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
      ) : showStatusOverview ? (
        <StatusOverview matches={matches} />
      ) : (
        <div className="space-y-5">
          <div className="flex justify-center gap-2 overflow-x-auto pb-1">
            {rounds.map((round) => (
              <button
                key={round}
                type="button"
                onClick={() => {
                  setActiveRound(round);
                  setShowFullRound(false);
                }}
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
            {!showFullRound ? (
              <section className="space-y-3">
                <div className="rounded-xl border border-white/15 bg-tonner-blue px-4 py-3 text-center text-white shadow-[0_12px_24px_rgba(8,43,104,0.2)]">
                  <p className="font-display text-lg font-black">Próximos partidos</p>
                  {nextDateRange ? (
                    <div className="mt-2 flex justify-center">
                      <span className="rounded-full bg-white px-4 py-1.5 text-sm font-black capitalize text-tonner-blue shadow-[0_8px_18px_rgba(2,8,23,0.14)]">
                        {nextDateRange}
                      </span>
                    </div>
                  ) : null}
                </div>

                {nextMatches.map((item) => (
                  <MatchCard key={item.match.id} item={item} showPredictionStatus />
                ))}

                {roundMatches.length > nextMatches.length ? (
                  <button
                    type="button"
                    className="w-full rounded-xl bg-white px-5 py-3 text-sm font-black text-tonner-blue shadow-[0_12px_24px_rgba(45,89,199,0.16)]"
                    onClick={() => setShowFullRound(true)}
                  >
                    Ver jornada completa
                  </button>
                ) : null}
              </section>
            ) : null}

            {showFullRound ? (
              <>
                <button
                  type="button"
                  className="w-full rounded-xl bg-white/15 px-5 py-3 text-sm font-black text-white"
                  onClick={() => setShowFullRound(false)}
                >
                  Ver solo próximos partidos
                </button>

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
              </>
            ) : null}
                  </div>
        </div>
      )}
    </section>
  );
}

export default StageMatchesPage;
