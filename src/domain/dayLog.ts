import type { Instant, Minutes } from './time';

export type DayLogId = string;

export interface DayLog {
  id: DayLogId;
  date: string;
  openedAt: Instant;
  closedAt: Instant | null;
  drivingMinutes: Minutes | null;
  note?: string;
  source: 'manual' | 'imported';
  createdAt: Instant;
  updatedAt: Instant;
}

export type NewDayLogInput = Pick<DayLog, 'date' | 'openedAt'> &
  Partial<Pick<DayLog, 'source' | 'note'>>;

export interface CloseDayLogInput {
  closedAt: Instant;
  drivingMinutes: Minutes;
  note?: string;
}

export function newId(): DayLogId {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isOpen(log: DayLog): boolean {
  return log.closedAt === null;
}

export function isClosed(
  log: DayLog,
): log is DayLog & { closedAt: Instant; drivingMinutes: Minutes } {
  return log.closedAt !== null && log.drivingMinutes !== null;
}
