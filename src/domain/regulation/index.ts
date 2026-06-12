import type { DayLog } from '../dayLog';
import { addMins, getPreviousWeekRange, getWeekRange } from '../time';
import type { Instant, Minutes, WeekRange } from '../time';
import { REG } from './constants';

export type LimitLevel = 'ok' | 'warn' | 'crit' | 'exceeded';

export type RestKind =
  | 'weekly_regular'
  | 'weekly_reduced'
  | 'daily_regular'
  | 'daily_reduced'
  | 'insufficient'
  | 'unknown';

export function levelOf(used: Minutes, limit: Minutes): LimitLevel {
  const pct = limit > 0 ? used / limit : 0;
  if (used >= limit) return 'exceeded';
  if (pct >= 0.95) return 'crit';
  if (pct >= 0.75) return 'warn';
  return 'ok';
}

export function logsInWeek(logs: readonly DayLog[], week: WeekRange): DayLog[] {
  return logs.filter((l) => l.date >= week.startDate && l.date <= week.endDate);
}

export function sumDriving(logs: readonly DayLog[]): Minutes {
  return logs.reduce((acc, l) => acc + (l.drivingMinutes ?? 0), 0);
}

export function sumWeeklyDriving(logs: readonly DayLog[], week: WeekRange): Minutes {
  return sumDriving(logsInWeek(logs, week));
}

export function sumBiWeeklyDriving(logs: readonly DayLog[], week: WeekRange): Minutes {
  const previous = getPreviousWeekRange(week.startMs);
  return sumWeeklyDriving(logs, week) + sumWeeklyDriving(logs, previous);
}

export function isExtendedDriving(log: DayLog): boolean {
  return log.drivingMinutes !== null && log.drivingMinutes > REG.DAILY_STANDARD;
}

export function findNextLog(logs: readonly DayLog[], log: DayLog): DayLog | null {
  let best: DayLog | null = null;
  for (const l of logs) {
    if (l.openedAt > log.openedAt) {
      if (best === null || l.openedAt < best.openedAt) best = l;
    }
  }
  return best;
}

export function restMinutesAfter(log: DayLog, nextLog: DayLog | null): Minutes | null {
  if (log.closedAt === null || nextLog === null) return null;
  return Math.round((nextLog.openedAt - log.closedAt) / (60 * 1000));
}

export function restKindAfter(log: DayLog, nextLog: DayLog | null): RestKind {
  const rest = restMinutesAfter(log, nextLog);
  if (rest === null) return 'unknown';
  if (rest >= REG.WEEKLY_REST_REGULAR) return 'weekly_regular';
  if (rest >= REG.WEEKLY_REST_REDUCED) return 'weekly_reduced';
  if (rest >= REG.DAILY_REST_REGULAR) return 'daily_regular';
  if (rest >= REG.DAILY_REST_REDUCED) return 'daily_reduced';
  return 'insufficient';
}

export function countExtendedDrivingsInWeek(
  logs: readonly DayLog[],
  week: WeekRange,
): number {
  return logsInWeek(logs, week).filter(isExtendedDriving).length;
}

export function countReducedDailyRestsInWeek(
  logs: readonly DayLog[],
  week: WeekRange,
): number {
  return logsInWeek(logs, week).filter(
    (log) => restKindAfter(log, findNextLog(logs, log)) === 'daily_reduced',
  ).length;
}

export interface AvailableDrivingInput {
  closedLogsInWeek: readonly DayLog[];
  closedLogsInPreviousWeek: readonly DayLog[];
  drivingToday?: Minutes;
}

export interface AvailableDrivingResult {
  available: Minutes;
  dailyLimit: Minutes;
  dailyRemaining: Minutes;
  extendedDailyLimit: Minutes;
  weeklyRemaining: Minutes;
  biWeeklyRemaining: Minutes;
  bindingLimit: 'daily' | 'weekly' | 'biweekly';
  extensionAvailable: boolean;
  extendedUsedThisWeek: number;
  drivingToday: Minutes;
}

export function availableDrivingForOpenJourney(
  input: AvailableDrivingInput,
): AvailableDrivingResult {
  const { closedLogsInWeek, closedLogsInPreviousWeek, drivingToday = 0 } = input;
  const extendedUsedThisWeek = closedLogsInWeek.filter(isExtendedDriving).length;
  const extensionAvailable = extendedUsedThisWeek < REG.MAX_EXTENDED_PER_WEEK;

  const dailyLimit = REG.DAILY_STANDARD;
  const extendedDailyLimit = extensionAvailable ? REG.DAILY_EXTENDED : REG.DAILY_STANDARD;
  const dailyRemaining = Math.max(0, dailyLimit - drivingToday);

  const drivenThisWeek = sumDriving(closedLogsInWeek) + drivingToday;
  const drivenPrevWeek = sumDriving(closedLogsInPreviousWeek);

  const weeklyRemaining = Math.max(0, REG.WEEKLY - drivenThisWeek);
  const biWeeklyRemaining = Math.max(0, REG.BIWEEKLY - (drivenThisWeek + drivenPrevWeek));

  const available = Math.max(0, Math.min(dailyRemaining, weeklyRemaining, biWeeklyRemaining));

  let binding: AvailableDrivingResult['bindingLimit'] = 'daily';
  if (weeklyRemaining < dailyRemaining && weeklyRemaining <= biWeeklyRemaining) binding = 'weekly';
  else if (biWeeklyRemaining < dailyRemaining && biWeeklyRemaining < weeklyRemaining)
    binding = 'biweekly';

  return {
    available,
    dailyLimit,
    dailyRemaining,
    extendedDailyLimit,
    weeklyRemaining,
    biWeeklyRemaining,
    bindingLimit: binding,
    extensionAvailable,
    extendedUsedThisWeek,
    drivingToday,
  };
}

export interface LatestDrivingTimeInput {
  openedAt: Instant;
  available: Minutes;
  now: Instant;
}

export function latestDrivingTime(input: LatestDrivingTimeInput): Instant {
  const { openedAt, available, now } = input;
  const windowEnd = addMins(openedAt, REG.ACTIVITY_WINDOW);
  const drivingDeadline = addMins(now, available);
  return Math.min(windowEnd, drivingDeadline);
}

export interface NextStartInput {
  closedAt: Instant;
  reducedDailyRestsUsedThisWeek: number;
}

export interface NextStartResult {
  regular: Instant;
  reduced: Instant | null;
  reducedUsed: number;
  reducedRemaining: number;
}

export function earliestNextStart(input: NextStartInput): NextStartResult {
  const remaining = Math.max(
    0,
    REG.MAX_REDUCED_DAILY_PER_WEEK - input.reducedDailyRestsUsedThisWeek,
  );
  return {
    regular: addMins(input.closedAt, REG.DAILY_REST_REGULAR),
    reduced: remaining > 0 ? addMins(input.closedAt, REG.DAILY_REST_REDUCED) : null,
    reducedUsed: input.reducedDailyRestsUsedThisWeek,
    reducedRemaining: remaining,
  };
}

export interface CompensationDeadline {
  weekIsoLabel: string;
  deadlineEndMs: Instant;
}

export function pendingReducedWeeklyCompensations(
  logs: readonly DayLog[],
  now: Instant = Date.now(),
): CompensationDeadline[] {
  const sorted = [...logs]
    .filter((l) => l.closedAt !== null)
    .sort((a, b) => a.openedAt - b.openedAt);

  const currentWeek = getWeekRange(now);
  const seen = new Set<string>();
  const result: CompensationDeadline[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const log = sorted[i]!;
    const next = sorted[i + 1]!;
    if (restKindAfter(log, next) !== 'weekly_reduced') continue;
    const week = getWeekRange(log.openedAt);
    if (seen.has(week.isoLabel)) continue;
    seen.add(week.isoLabel);
    const deadlineWeek = getWeekRange(
      addMins(week.startMs, REG.COMPENSATION_WEEKS * 7 * 24 * 60),
    );
    if (deadlineWeek.endMs >= currentWeek.startMs) {
      result.push({ weekIsoLabel: week.isoLabel, deadlineEndMs: deadlineWeek.endMs });
    }
  }
  return result;
}

export { REG };
