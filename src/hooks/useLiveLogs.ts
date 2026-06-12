import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import type { DayLog } from '@/domain/dayLog';

export function useAllLogs(): DayLog[] {
  return useLiveQuery(() => db.dayLogs.orderBy('date').reverse().toArray(), [], []) ?? [];
}

export function useOpenLog(): DayLog | null {
  const log = useLiveQuery(async () => {
    const all = await db.dayLogs.toArray();
    return all.find((l) => l.closedAt === null) ?? null;
  }, [], null);
  return log ?? null;
}

export function useLogByDate(date: string): DayLog | undefined {
  return useLiveQuery(() => db.dayLogs.where('date').equals(date).first(), [date]);
}

export function useLogsInRange(startDate: string, endDate: string): DayLog[] {
  return (
    useLiveQuery(
      () => db.dayLogs.where('date').between(startDate, endDate, true, true).sortBy('date'),
      [startDate, endDate],
      [],
    ) ?? []
  );
}
