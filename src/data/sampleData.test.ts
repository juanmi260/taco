import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addDays, format, startOfWeek } from 'date-fns';
import { db } from './db';
import { loadSampleData } from './sampleData';
import {
  findNextLog,
  isExtendedDriving,
  restKindAfter,
} from '@/domain/regulation';

describe('loadSampleData', () => {
  beforeEach(async () => {
    await db.dayLogs.clear();
  });

  afterEach(async () => {
    await db.dayLogs.clear();
  });

  it('genera al menos las 10 jornadas cerradas de las 2 semanas anteriores', async () => {
    const result = await loadSampleData(new Date('2026-06-10T12:00:00'));
    expect(result.added).toBeGreaterThanOrEqual(10);
    expect(result.skippedDuplicate).toBe(0);
  });

  it('no añade jornada abierta si hoy es fin de semana', async () => {
    const saturday = new Date('2026-06-13T12:00:00');
    await loadSampleData(saturday);
    const all = await db.dayLogs.toArray();
    expect(all.some((l) => l.closedAt === null)).toBe(false);
  });

  it('añade jornada abierta cuando hoy es día laborable', async () => {
    const wednesday = new Date('2026-06-10T12:00:00');
    await loadSampleData(wednesday);
    const all = await db.dayLogs.toArray();
    const open = all.find((l) => l.closedAt === null);
    expect(open).toBeDefined();
    expect(open?.drivingMinutes).toBeNull();
  });

  it('produce al menos una jornada con conducción ampliada (>9h) por las plantillas', async () => {
    await loadSampleData(new Date('2026-06-10T12:00:00'));
    const all = await db.dayLogs.toArray();
    const extended = all.filter(isExtendedDriving);
    expect(extended.length).toBeGreaterThanOrEqual(2);
  });

  it('produce un descanso diario reducido entre dos jornadas (mar→mié de la semana pasada)', async () => {
    const wednesday = new Date('2026-06-10T12:00:00');
    await loadSampleData(wednesday);
    const all = await db.dayLogs.toArray();
    const reducedDaily = all.filter(
      (l) => restKindAfter(l, findNextLog(all, l)) === 'daily_reduced',
    );
    expect(reducedDaily.length).toBeGreaterThanOrEqual(1);
  });

  it('produce un descanso semanal reducido entre la última jornada de la semana pasada y la primera de esta', async () => {
    const wednesday = new Date('2026-06-10T12:00:00');
    await loadSampleData(wednesday);
    const all = await db.dayLogs.toArray();
    const reducedWeekly = all.filter(
      (l) => restKindAfter(l, findNextLog(all, l)) === 'weekly_reduced',
    );
    expect(reducedWeekly.length).toBeGreaterThanOrEqual(1);
  });

  it('respeta las jornadas existentes y no machaca por fecha', async () => {
    const wednesday = new Date('2026-06-10T12:00:00');
    const startThis = startOfWeek(wednesday, { weekStartsOn: 1 });
    const conflictDate = addDays(startThis, -7);
    const conflictDateStr = format(conflictDate, 'yyyy-MM-dd');

    await db.dayLogs.add({
      id: 'existing',
      date: conflictDateStr,
      openedAt: conflictDate.setHours(8, 0, 0, 0),
      closedAt: conflictDate.setHours(18, 0, 0, 0),
      drivingMinutes: 100,
      source: 'manual',
      createdAt: 0,
      updatedAt: 0,
    });

    const result = await loadSampleData(wednesday);
    expect(result.skippedDuplicate).toBe(1);
    const stored = await db.dayLogs.where('date').equals(conflictDateStr).first();
    expect(stored?.id).toBe('existing');
    expect(stored?.drivingMinutes).toBe(100);
  });

  it('si ya hay una jornada abierta, salta la del día de hoy', async () => {
    await db.dayLogs.add({
      id: 'existing-open',
      date: '2026-06-09',
      openedAt: new Date('2026-06-09T05:00:00').getTime(),
      closedAt: null,
      drivingMinutes: null,
      source: 'manual',
      createdAt: 0,
      updatedAt: 0,
    });
    const result = await loadSampleData(new Date('2026-06-10T12:00:00'));
    expect(result.skippedOpenConflict).toBe(1);
    const all = await db.dayLogs.toArray();
    const opens = all.filter((l) => l.closedAt === null);
    expect(opens).toHaveLength(1);
    expect(opens[0]?.id).toBe('existing-open');
  });
});
