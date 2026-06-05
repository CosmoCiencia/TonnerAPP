const CUP_CALENDAR_TIME_ZONE = 'America/Bogota';

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CUP_CALENDAR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';

  return { year, month, day };
}

export function getCupDateKey(date: string | Date) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const { year, month, day } = getDateParts(parsedDate);

  return `${year}-${month}-${day}`;
}

export function getCupTodayKey() {
  return getCupDateKey(new Date());
}
