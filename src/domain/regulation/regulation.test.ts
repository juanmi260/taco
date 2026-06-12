import { describe, expect, it } from 'vitest';
import {
  availableDrivingForOpenJourney,
  countExtendedDrivingsInWeek,
  countReducedDailyRestsInWeek,
  earliestNextStart,
  findNextLog,
  isExtendedDriving,
  latestDrivingTime,
  levelOf,
  pendingReducedWeeklyCompensations,
  REG,
  restKindAfter,
  restMinutesAfter,
  sumBiWeeklyDriving,
  sumWeeklyDriving,
} from './index';
import { getWeekRange, minutes } from '../time';
import type { DayLog } from '../dayLog';

function log(
  date: string,
  openedAtIso: string,
  closedAtIso: string | null,
  drivingMin: number | null,
): DayLog {
  return {
    id: `${date}-${openedAtIso}`,
    date,
    openedAt: new Date(openedAtIso).getTime(),
    closedAt: closedAtIso ? new Date(closedAtIso).getTime() : null,
    drivingMinutes: drivingMin,
    source: 'manual',
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('levelOf', () => {
  it('clasifica el porcentaje en bandas', () => {
    expect(levelOf(0, 100)).toBe('ok');
    expect(levelOf(74, 100)).toBe('ok');
    expect(levelOf(75, 100)).toBe('warn');
    expect(levelOf(95, 100)).toBe('crit');
    expect(levelOf(100, 100)).toBe('exceeded');
    expect(levelOf(120, 100)).toBe('exceeded');
  });
});

describe('isExtendedDriving', () => {
  it('false si conducción ≤ 9 h', () => {
    expect(isExtendedDriving(log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 540))).toBe(false);
    expect(isExtendedDriving(log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 539))).toBe(false);
  });
  it('true si conducción > 9 h', () => {
    expect(isExtendedDriving(log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T17:00:00', 541))).toBe(true);
    expect(isExtendedDriving(log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T17:30:00', 570))).toBe(true);
  });
  it('false si conducción es null (jornada abierta)', () => {
    expect(isExtendedDriving(log('2026-06-08', '2026-06-08T06:00:00', null, null))).toBe(false);
  });
});

describe('findNextLog', () => {
  it('devuelve la jornada con apertura inmediatamente posterior', () => {
    const a = log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 420);
    const b = log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T16:00:00', 420);
    const c = log('2026-06-10', '2026-06-10T06:00:00', '2026-06-10T16:00:00', 420);
    expect(findNextLog([a, b, c], a)?.id).toBe(b.id);
    expect(findNextLog([a, b, c], b)?.id).toBe(c.id);
    expect(findNextLog([a, b, c], c)).toBeNull();
  });

  it('ignora jornadas con misma o anterior apertura', () => {
    const a = log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 420);
    const b = log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T16:00:00', 420);
    expect(findNextLog([a, b], b)).toBeNull();
  });
});

describe('restMinutesAfter / restKindAfter', () => {
  const baseClose = '2026-06-08T16:00:00';
  const A = log('2026-06-08', '2026-06-08T06:00:00', baseClose, 420);
  function nextWithOpen(open: string): DayLog {
    return log('2026-06-09', open, '2026-06-09T16:00:00', 420);
  }

  it('rest = openedAt_next - closedAt', () => {
    expect(restMinutesAfter(A, nextWithOpen('2026-06-09T03:00:00'))).toBe(660);
  });

  it.each([
    ['2026-06-10T18:00:00', 'weekly_regular'],
    ['2026-06-09T22:00:00', 'weekly_reduced'],
    ['2026-06-09T04:00:00', 'daily_regular'],
    ['2026-06-09T02:00:00', 'daily_reduced'],
    ['2026-06-09T00:00:00', 'insufficient'],
  ])('open en %s → %s', (openIso, expected) => {
    expect(restKindAfter(A, nextWithOpen(openIso))).toBe(expected);
  });

  it('unknown cuando no hay next', () => {
    expect(restKindAfter(A, null)).toBe('unknown');
  });

  it('unknown cuando la jornada está abierta', () => {
    const openJourney = log('2026-06-08', '2026-06-08T06:00:00', null, null);
    expect(restKindAfter(openJourney, nextWithOpen('2026-06-09T06:00:00'))).toBe('unknown');
  });
});

describe('sumWeeklyDriving', () => {
  it('suma minutos de jornadas de la misma semana ISO (lunes-domingo)', () => {
    const week = getWeekRange(new Date('2026-06-10T12:00:00'));
    const logs: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 420),
      log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T16:00:00', 480),
      log('2026-06-07', '2026-06-07T06:00:00', '2026-06-07T16:00:00', 300),
    ];
    expect(sumWeeklyDriving(logs, week)).toBe(900);
  });
});

describe('sumBiWeeklyDriving', () => {
  it('suma la semana actual y la previa', () => {
    const week = getWeekRange(new Date('2026-06-10T12:00:00'));
    const logs: DayLog[] = [
      log('2026-06-01', '2026-06-01T06:00:00', '2026-06-01T16:00:00', 480),
      log('2026-06-02', '2026-06-02T06:00:00', '2026-06-02T16:00:00', 420),
      log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T16:00:00', 480),
    ];
    expect(sumBiWeeklyDriving(logs, week)).toBe(1380);
  });
});

describe('countExtendedDrivingsInWeek', () => {
  it('cuenta jornadas con conducción > 9 h en la semana', () => {
    const week = getWeekRange(new Date('2026-06-10T12:00:00'));
    const logs: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 540),
      log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T17:30:00', 570),
      log('2026-06-10', '2026-06-10T06:00:00', '2026-06-10T18:00:00', 600),
    ];
    expect(countExtendedDrivingsInWeek(logs, week)).toBe(2);
  });
});

describe('countReducedDailyRestsInWeek', () => {
  it('cuenta los huecos en [9h, 11h) tras jornadas de la semana', () => {
    const week = getWeekRange(new Date('2026-06-10T12:00:00'));
    const logs: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T22:00:00', 540),
      log('2026-06-09', '2026-06-09T07:00:00', '2026-06-09T16:00:00', 420),
      log('2026-06-10', '2026-06-10T06:00:00', '2026-06-10T16:00:00', 420),
    ];
    expect(countReducedDailyRestsInWeek(logs, week)).toBe(1);
  });

  it('no cuenta la jornada cuyo descanso siguiente es regular diario o semanal', () => {
    const week = getWeekRange(new Date('2026-06-10T12:00:00'));
    const logs: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 480),
      log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T16:00:00', 480),
    ];
    expect(countReducedDailyRestsInWeek(logs, week)).toBe(0);
  });
});

describe('availableDrivingForOpenJourney', () => {
  it('límite diario estándar (9h) cuando la semana tiene espacio', () => {
    const res = availableDrivingForOpenJourney({
      closedLogsInWeek: [],
      closedLogsInPreviousWeek: [],
    });
    expect(res.dailyLimit).toBe(REG.DAILY_STANDARD);
    expect(res.available).toBe(REG.DAILY_STANDARD);
    expect(res.bindingLimit).toBe('daily');
    expect(res.extensionAvailable).toBe(true);
    expect(res.extendedUsedThisWeek).toBe(0);
  });

  it('el restante semanal restringe cuando queda menos de un día', () => {
    const closedLogsInWeek: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T19:00:00', minutes(10)),
      log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T19:00:00', minutes(10)),
      log('2026-06-10', '2026-06-10T06:00:00', '2026-06-10T19:00:00', minutes(10)),
      log('2026-06-11', '2026-06-11T06:00:00', '2026-06-11T19:00:00', minutes(10)),
    ];
    const res = availableDrivingForOpenJourney({
      closedLogsInWeek,
      closedLogsInPreviousWeek: [],
    });
    expect(res.weeklyRemaining).toBe(minutes(16));
    expect(res.available).toBe(minutes(9));
  });

  it('descuenta drivingToday del límite diario, semanal y bisemanal', () => {
    const closedLogsInWeek: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', minutes(8)),
    ];
    const res = availableDrivingForOpenJourney({
      closedLogsInWeek,
      closedLogsInPreviousWeek: [],
      drivingToday: minutes(3),
    });
    expect(res.drivingToday).toBe(minutes(3));
    expect(res.dailyRemaining).toBe(minutes(6));
    expect(res.weeklyRemaining).toBe(REG.WEEKLY - minutes(8) - minutes(3));
    expect(res.available).toBe(minutes(6));
  });

  it('drivingToday = 0 por defecto', () => {
    const res = availableDrivingForOpenJourney({
      closedLogsInWeek: [],
      closedLogsInPreviousWeek: [],
    });
    expect(res.drivingToday).toBe(0);
    expect(res.dailyRemaining).toBe(REG.DAILY_STANDARD);
  });

  it('extensionAvailable = false cuando ya hay 2 jornadas con >9h esta semana', () => {
    const closedLogsInWeek: DayLog[] = [
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T17:30:00', minutes(9, 30)),
      log('2026-06-09', '2026-06-09T06:00:00', '2026-06-09T17:30:00', minutes(9, 30)),
    ];
    const res = availableDrivingForOpenJourney({
      closedLogsInWeek,
      closedLogsInPreviousWeek: [],
    });
    expect(res.extendedUsedThisWeek).toBe(2);
    expect(res.extensionAvailable).toBe(false);
  });
});

describe('latestDrivingTime', () => {
  it('se acota por la ventana de actividad de 15 h desde apertura', () => {
    const openedAt = new Date('2026-06-10T06:00:00').getTime();
    const now = new Date('2026-06-10T09:00:00').getTime();
    const result = latestDrivingTime({ openedAt, now, available: minutes(20) });
    expect(new Date(result).getHours()).toBe(21);
  });

  it('si lo restante de conducción acaba antes que la ventana, ese tiempo manda', () => {
    const openedAt = new Date('2026-06-10T06:00:00').getTime();
    const now = new Date('2026-06-10T09:00:00').getTime();
    const result = latestDrivingTime({ openedAt, now, available: minutes(2) });
    expect(new Date(result).getHours()).toBe(11);
  });
});

describe('earliestNextStart', () => {
  it('regular = cierre + 11 h; reducido = cierre + 9 h si quedan reducidos', () => {
    const closedAt = new Date('2026-06-10T16:00:00').getTime();
    const r = earliestNextStart({ closedAt, reducedDailyRestsUsedThisWeek: 0 });
    expect(new Date(r.regular).getHours()).toBe(3);
    expect(r.reduced).not.toBeNull();
    expect(new Date(r.reduced!).getHours()).toBe(1);
    expect(r.reducedRemaining).toBe(3);
  });

  it('si se han usado 3 reducidos, no hay reducido disponible', () => {
    const closedAt = new Date('2026-06-10T16:00:00').getTime();
    const r = earliestNextStart({ closedAt, reducedDailyRestsUsedThisWeek: 3 });
    expect(r.reduced).toBeNull();
    expect(r.reducedRemaining).toBe(0);
  });
});

describe('pendingReducedWeeklyCompensations', () => {
  it('detecta una pareja de jornadas con descanso semanal reducido entre ellas', () => {
    const logs: DayLog[] = [
      log('2026-06-06', '2026-06-06T06:00:00', '2026-06-06T22:00:00', 540),
      log('2026-06-08', '2026-06-08T08:00:00', '2026-06-08T16:00:00', 420),
    ];
    const result = pendingReducedWeeklyCompensations(logs, new Date('2026-06-10T12:00:00').getTime());
    expect(result).toHaveLength(1);
    expect(result[0]!.weekIsoLabel).toMatch(/W\d{2}/);
  });

  it('no detecta cuando el descanso es semanal regular (≥45h)', () => {
    const logs: DayLog[] = [
      log('2026-06-05', '2026-06-05T06:00:00', '2026-06-05T18:00:00', 540),
      log('2026-06-08', '2026-06-08T06:00:00', '2026-06-08T16:00:00', 420),
    ];
    const result = pendingReducedWeeklyCompensations(logs, new Date('2026-06-10T12:00:00').getTime());
    expect(result).toHaveLength(0);
  });
});
