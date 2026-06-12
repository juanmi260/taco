import { describe, expect, it } from 'vitest';
import {
  formatHHMM,
  getPreviousWeekRange,
  getWeekRange,
  minutes,
  parseMinutes,
  todayLocalDateString,
} from './time';

describe('minutes', () => {
  it('convierte horas+minutos en minutos totales', () => {
    expect(minutes(9)).toBe(540);
    expect(minutes(9, 30)).toBe(570);
    expect(minutes(0, 45)).toBe(45);
  });
});

describe('formatHHMM', () => {
  it('rellena con ceros', () => {
    expect(formatHHMM(0)).toBe('00:00');
    expect(formatHHMM(5)).toBe('00:05');
    expect(formatHHMM(60)).toBe('01:00');
    expect(formatHHMM(125)).toBe('02:05');
  });
  it('soporta valores negativos', () => {
    expect(formatHHMM(-65)).toBe('-01:05');
  });
});

describe('parseMinutes', () => {
  it('acepta entero', () => {
    expect(parseMinutes('420')).toBe(420);
  });
  it('acepta HH:MM', () => {
    expect(parseMinutes('7:00')).toBe(420);
    expect(parseMinutes('09:30')).toBe(570);
  });
  it('rechaza valores inválidos', () => {
    expect(parseMinutes('abc')).toBeNull();
    expect(parseMinutes('-1')).toBeNull();
    expect(parseMinutes('1:60')).toBeNull();
    expect(parseMinutes('')).toBeNull();
  });
});

describe('getWeekRange', () => {
  it('semana de un miércoles empieza en lunes', () => {
    const week = getWeekRange(new Date('2026-06-10T12:00:00'));
    expect(week.startDate).toBe('2026-06-08');
    expect(week.endDate).toBe('2026-06-14');
  });
  it('semana de un domingo es la del lunes anterior', () => {
    const week = getWeekRange(new Date('2026-06-14T23:00:00'));
    expect(week.startDate).toBe('2026-06-08');
    expect(week.endDate).toBe('2026-06-14');
  });
});

describe('getPreviousWeekRange', () => {
  it('devuelve la semana anterior', () => {
    const prev = getPreviousWeekRange(new Date('2026-06-10T12:00:00'));
    expect(prev.startDate).toBe('2026-06-01');
    expect(prev.endDate).toBe('2026-06-07');
  });
});

describe('todayLocalDateString', () => {
  it('formato YYYY-MM-DD', () => {
    const s = todayLocalDateString(new Date('2026-06-09T10:00:00').getTime());
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
