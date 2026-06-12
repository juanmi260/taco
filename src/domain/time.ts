import { addDays, addMinutes, format, startOfWeek } from 'date-fns';

export type Minutes = number;
export type Instant = number;

export const MIN_PER_HOUR = 60;
export const HOUR_PER_DAY = 24;
export const MIN_PER_DAY = MIN_PER_HOUR * HOUR_PER_DAY;
export const MS_PER_MIN = 60 * 1000;

export function minutes(h: number, m = 0): Minutes {
  return h * MIN_PER_HOUR + m;
}

export function formatHHMM(totalMinutes: Minutes): string {
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(abs / MIN_PER_HOUR);
  const m = abs % MIN_PER_HOUR;
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatClock(ts: Instant): string {
  return format(new Date(ts), 'HH:mm');
}

export function formatDateLong(ts: Instant): string {
  return format(new Date(ts), 'EEE d LLL yyyy');
}

export function formatDateShort(ts: Instant): string {
  return format(new Date(ts), 'd LLL');
}

export function todayLocalDateString(now: Instant = Date.now()): string {
  return format(new Date(now), 'yyyy-MM-dd');
}

export function dateStringFrom(ts: Instant): string {
  return format(new Date(ts), 'yyyy-MM-dd');
}

export interface WeekRange {
  startDate: string;
  endDate: string;
  startMs: Instant;
  endMs: Instant;
  isoLabel: string;
}

export function getWeekRange(reference: Date | Instant): WeekRange {
  const ref = typeof reference === 'number' ? new Date(reference) : reference;
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const endExclusive = addDays(start, 7);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(addDays(start, 6), 'yyyy-MM-dd'),
    startMs: start.getTime(),
    endMs: endExclusive.getTime() - 1,
    isoLabel: format(start, "RRRR-'W'II"),
  };
}

export function getPreviousWeekRange(reference: Date | Instant): WeekRange {
  const ref = typeof reference === 'number' ? new Date(reference) : reference;
  return getWeekRange(addDays(startOfWeek(ref, { weekStartsOn: 1 }), -7));
}

export function getNextWeekRange(reference: Date | Instant): WeekRange {
  const ref = typeof reference === 'number' ? new Date(reference) : reference;
  return getWeekRange(addDays(startOfWeek(ref, { weekStartsOn: 1 }), 7));
}

export function addMins(ts: Instant, m: Minutes): Instant {
  return addMinutes(new Date(ts), m).getTime();
}

export function diffMinutes(later: Instant, earlier: Instant): Minutes {
  return Math.round((later - earlier) / MS_PER_MIN);
}

export function parseMinutes(input: string): Minutes | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const hhmm = /^(\d{1,2}):(\d{1,2})$/.exec(trimmed);
  if (hhmm) {
    const h = Number(hhmm[1]);
    const m = Number(hhmm[2]);
    if (h < 0 || m < 0 || m >= 60) return null;
    return h * MIN_PER_HOUR + m;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}
