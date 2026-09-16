import { DateFormat } from '../types';

export function formatTimeParts(date: Date, is24Hour: boolean) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  
  let period = '';
  if (!is24Hour) {
    period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }

  const hoursStr = String(hours).padStart(is24Hour ? 2 : 1, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  const msStr = String(Math.floor(milliseconds / 10)).padStart(2, '0');

  return {
    hours: hoursStr,
    minutes: minutesStr,
    seconds: secondsStr,
    milliseconds: msStr,
    period,
    rawHours: date.getHours(),
    rawMinutes: minutes,
    rawSeconds: seconds,
    rawMs: milliseconds,
  };
}

export function formatDateString(date: Date, format: DateFormat): {
  weekday: string;
  formattedDate: string;
  dayNumber: number;
  monthName: string;
  year: number;
  weekNumber: number;
  dayOfYear: number;
} {
  const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
  const monthName = date.toLocaleDateString(undefined, { month: 'long' });
  const dayNumber = date.getDate();
  const year = date.getFullYear();

  // Calculate day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Calculate week of year (ISO 8601)
  const tempDate = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayNr + 3);
  const firstThursday = tempDate.valueOf();
  tempDate.setMonth(0, 1);
  if (tempDate.getDay() !== 4) {
    tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000);

  let formattedDate = '';
  switch (format) {
    case 'full':
      formattedDate = date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      break;
    case 'standard':
      formattedDate = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      break;
    case 'compact':
      formattedDate = date.toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });
      break;
    case 'iso':
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      formattedDate = `${y}-${m}-${d}`;
      break;
  }

  return {
    weekday,
    formattedDate,
    dayNumber,
    monthName,
    year,
    weekNumber,
    dayOfYear,
  };
}

export function getTimezoneDetails(): { name: string; offset: string } {
  try {
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const offsetMin = new Date().getTimezoneOffset();
    const sign = offsetMin <= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMin);
    const hrs = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const mins = String(absOffset % 60).padStart(2, '0');
    return {
      name: tzName.replace(/_/g, ' '),
      offset: `UTC${sign}${hrs}:${mins}`,
    };
  } catch {
    return { name: 'Local Time', offset: '' };
  }
}
