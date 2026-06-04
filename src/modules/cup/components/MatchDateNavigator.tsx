import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
  dateKeys: string[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
};

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function toDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSelectedDate(dateKey: string) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(toDate(dateKey));
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const cells: Array<Date | null> = Array.from({ length: mondayOffset }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day, 12));
  }

  return cells;
}

function MatchDateNavigator({ dateKeys, selectedDate, onSelectDate }: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => toDate(selectedDate));
  const availableDates = useMemo(() => new Set(dateKeys), [dateKeys]);
  const selectedIndex = dateKeys.indexOf(selectedDate);
  const monthDays = getMonthDays(visibleMonth);

  const selectDate = (dateKey: string) => {
    onSelectDate(dateKey);
    setVisibleMonth(toDate(dateKey));
    setCalendarOpen(false);
  };

  return (
    <>
      <div className="flex w-full min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Fecha anterior"
          disabled={selectedIndex <= 0}
          onClick={() => selectDate(dateKeys[selectedIndex - 1])}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-tonner-blue shadow-[0_6px_16px_rgba(15,23,42,0.12)] disabled:opacity-35"
        >
          <ChevronLeft size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Abrir calendario"
          onClick={() => {
            setVisibleMonth(toDate(selectedDate));
            setCalendarOpen(true);
          }}
          className="flex h-10 w-0 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-black capitalize text-tonner-blue shadow-[0_6px_16px_rgba(15,23,42,0.12)]"
        >
          <CalendarDays size={17} strokeWidth={2.5} aria-hidden="true" />
          <span className="truncate">{formatSelectedDate(selectedDate)}</span>
        </button>

        <button
          type="button"
          aria-label="Fecha siguiente"
          disabled={selectedIndex < 0 || selectedIndex >= dateKeys.length - 1}
          onClick={() => selectDate(dateKeys[selectedIndex + 1])}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-tonner-blue shadow-[0_6px_16px_rgba(15,23,42,0.12)] disabled:opacity-35"
        >
          <ChevronRight size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>

      {calendarOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Calendario de partidos"
            className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_rgba(15,23,42,0.3)]"
          >
            <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem_2.25rem] items-center bg-tonner-blue px-3 py-3 text-white">
              <button
                type="button"
                aria-label="Mes anterior"
                onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1, 12))}
                className="flex h-9 w-9 items-center justify-center"
              >
                <ChevronLeft size={21} strokeWidth={2.5} aria-hidden="true" />
              </button>
              <p className="truncate text-center font-display text-base font-black capitalize">{formatMonth(visibleMonth)}</p>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1, 12))}
                className="flex h-9 w-9 items-center justify-center"
              >
                <ChevronRight size={21} strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Cerrar calendario"
                onClick={() => setCalendarOpen(false)}
                className="flex h-9 w-9 items-center justify-center"
              >
                <X size={19} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            <div className="px-4 pb-4 pt-3">
              <div className="grid grid-cols-7 text-center">
                {WEEKDAYS.map((weekday, index) => (
                  <span key={`${weekday}-${index}`} className="py-2 text-[10px] font-black text-slate-400">
                    {weekday}
                  </span>
                ))}
                {monthDays.map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} />;

                  const dateKey = toDateKey(date);
                  const hasMatches = availableDates.has(dateKey);
                  const isSelected = selectedDate === dateKey;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      disabled={!hasMatches}
                      onClick={() => selectDate(dateKey)}
                      className={`relative mx-auto my-0.5 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition ${
                        isSelected
                          ? 'bg-tonner-blue text-white'
                          : hasMatches
                            ? 'text-tonner-slate hover:bg-blue-50'
                            : 'text-slate-300'
                      }`}
                    >
                      {date.getDate()}
                      {hasMatches && !isSelected ? (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-tonner-blue" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MatchDateNavigator;
