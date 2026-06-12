import { addDays, format, startOfWeek } from 'date-fns';
import { db } from './db';
import type { DayLog } from '@/domain/dayLog';
import { newId } from '@/domain/dayLog';

interface DaySpec {
  open: [number, number];
  close: [number, number];
  driving: number;
  note?: string;
}

const TWO_WEEKS_AGO: DaySpec[] = [
  { open: [6, 0], close: [15, 30], driving: 420 },
  { open: [5, 30], close: [16, 0], driving: 450 },
  { open: [6, 0], close: [16, 0], driving: 480 },
  { open: [5, 30], close: [17, 30], driving: 570, note: 'Ruta larga' },
  { open: [7, 0], close: [16, 45], driving: 405 },
];

const LAST_WEEK: DaySpec[] = [
  { open: [6, 0], close: [15, 0], driving: 450 },
  { open: [6, 0], close: [22, 0], driving: 540, note: 'Cierre tarde' },
  { open: [7, 0], close: [16, 0], driving: 420 },
  { open: [5, 30], close: [17, 30], driving: 570 },
  { open: [6, 0], close: [16, 30], driving: 480 },
  { open: [6, 0], close: [14, 0], driving: 380, note: 'Sábado corto' },
];

const THIS_WEEK: DaySpec[] = [
  { open: [6, 0], close: [15, 30], driving: 420 },
  { open: [5, 30], close: [16, 30], driving: 450 },
  { open: [6, 0], close: [16, 0], driving: 420 },
  { open: [6, 0], close: [16, 0], driving: 450 },
  { open: [6, 0], close: [16, 0], driving: 420 },
];

function setTime(base: Date, h: number, m: number): number {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function makeLog(day: Date, spec: DaySpec): Omit<DayLog, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    date: format(day, 'yyyy-MM-dd'),
    openedAt: setTime(day, spec.open[0], spec.open[1]),
    closedAt: setTime(day, spec.close[0], spec.close[1]),
    drivingMinutes: spec.driving,
    note: spec.note,
    source: 'manual',
  };
}

function makeOpen(now: Date): Omit<DayLog, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    date: format(now, 'yyyy-MM-dd'),
    openedAt: setTime(now, 6, 12),
    closedAt: null,
    drivingMinutes: null,
    source: 'manual',
  };
}

function generateSamples(now: Date): Array<Omit<DayLog, 'id' | 'createdAt' | 'updatedAt'>> {
  const startThis = startOfWeek(now, { weekStartsOn: 1 });
  const todayIdx = Math.floor((now.getTime() - startThis.getTime()) / (24 * 60 * 60 * 1000));
  const samples: Array<Omit<DayLog, 'id' | 'createdAt' | 'updatedAt'>> = [];

  for (let i = 0; i < TWO_WEEKS_AGO.length; i++) {
    samples.push(makeLog(addDays(startThis, -14 + i), TWO_WEEKS_AGO[i]!));
  }
  for (let i = 0; i < LAST_WEEK.length; i++) {
    samples.push(makeLog(addDays(startThis, -7 + i), LAST_WEEK[i]!));
  }
  const closedThisWeekCount = Math.min(todayIdx, THIS_WEEK.length);
  for (let i = 0; i < closedThisWeekCount; i++) {
    samples.push(makeLog(addDays(startThis, i), THIS_WEEK[i]!));
  }
  if (todayIdx >= 0 && todayIdx <= 4) {
    samples.push(makeOpen(now));
  }

  return samples;
}

export interface SampleLoadResult {
  added: number;
  skippedDuplicate: number;
  skippedOpenConflict: number;
}

export async function loadSampleData(now: Date = new Date()): Promise<SampleLoadResult> {
  const samples = generateSamples(now);
  let added = 0;
  let skippedDuplicate = 0;
  let skippedOpenConflict = 0;

  await db.transaction('rw', db.dayLogs, async () => {
    const all = await db.dayLogs.toArray();
    const existingDates = new Set(all.map((l) => l.date));
    let hasOpen = all.some((l) => l.closedAt === null);

    for (const sample of samples) {
      if (existingDates.has(sample.date)) {
        skippedDuplicate++;
        continue;
      }
      if (sample.closedAt === null && hasOpen) {
        skippedOpenConflict++;
        continue;
      }
      const ts = Date.now();
      await db.dayLogs.add({
        ...sample,
        id: newId(),
        createdAt: ts,
        updatedAt: ts,
      });
      existingDates.add(sample.date);
      if (sample.closedAt === null) hasOpen = true;
      added++;
    }
  });

  return { added, skippedDuplicate, skippedOpenConflict };
}
