import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import type { DayLog } from '@/domain/dayLog';
import { exportCsv, exportJson, importJson } from './transfer';

function makeLog(date: string, drivingMin: number, extra: Partial<DayLog> = {}): DayLog {
  const openedAt = new Date(`${date}T06:00:00`).getTime();
  const closedAt = new Date(`${date}T16:00:00`).getTime();
  return {
    id: `id-${date}`,
    date,
    openedAt,
    closedAt,
    drivingMinutes: drivingMin,
    source: 'manual',
    createdAt: 0,
    updatedAt: 0,
    ...extra,
  };
}

describe('transfer', () => {
  beforeEach(async () => {
    await db.dayLogs.clear();
    await db.settings.clear();
  });

  afterEach(async () => {
    await db.dayLogs.clear();
    await db.settings.clear();
  });

  describe('exportJson', () => {
    it('serializa las jornadas existentes', async () => {
      await db.dayLogs.bulkAdd([
        makeLog('2026-06-08', 420),
        makeLog('2026-06-09', 570, { note: 'Ruta larga' }),
      ]);
      const text = await exportJson();
      const parsed = JSON.parse(text);
      expect(parsed.schemaVersion).toBe(2);
      expect(parsed.dayLogs).toHaveLength(2);
      expect(parsed.dayLogs[0].date).toBe('2026-06-08');
      expect(parsed.dayLogs[1].drivingMinutes).toBe(570);
    });
  });

  describe('exportCsv', () => {
    it('genera cabecera y filas', async () => {
      await db.dayLogs.add(makeLog('2026-06-08', 420, { note: 'prueba "con" comillas' }));
      const csv = await exportCsv();
      const lines = csv.split('\n');
      expect(lines[0]).toBe('fecha,hora_apertura,hora_cierre,minutos_conduccion,nota');
      expect(lines[1]).toContain('2026-06-08');
      expect(lines[1]).toContain('420');
      expect(lines[1]).toContain('""con""');
    });

    it('deja vacía la hora de cierre y los minutos cuando la jornada está abierta', async () => {
      await db.dayLogs.add({
        ...makeLog('2026-06-08', 0),
        closedAt: null,
        drivingMinutes: null,
      });
      const csv = await exportCsv();
      const dataLine = csv.split('\n')[1]!;
      expect(dataLine).toMatch(/2026-06-08,06:00,,,/);
    });
  });

  describe('importJson', () => {
    it('añade jornadas nuevas', async () => {
      const payload = JSON.stringify({
        schemaVersion: 2,
        dayLogs: [makeLog('2026-06-08', 420), makeLog('2026-06-09', 480)],
      });
      const result = await importJson(payload);
      expect(result).toEqual({ added: 2, replaced: 0, skipped: 0 });
      const all = await db.dayLogs.toArray();
      expect(all).toHaveLength(2);
      expect(all.every((l) => l.source === 'imported')).toBe(true);
    });

    it('descarta banderas obsoletas de exports antiguos', async () => {
      const payload = JSON.stringify({
        schemaVersion: 1,
        dayLogs: [
          {
            ...makeLog('2026-06-08', 420),
            extendedDriving: true,
            reducedDailyRest: true,
            reducedWeeklyRest: true,
          },
        ],
      });
      await importJson(payload);
      const stored = (await db.dayLogs.where('date').equals('2026-06-08').first()) as
        | Record<string, unknown>
        | undefined;
      expect(stored).toBeDefined();
      expect(stored?.extendedDriving).toBeUndefined();
      expect(stored?.reducedDailyRest).toBeUndefined();
      expect(stored?.reducedWeeklyRest).toBeUndefined();
    });

    it('reemplaza jornadas existentes por fecha y preserva createdAt', async () => {
      const original = makeLog('2026-06-08', 300);
      original.createdAt = 1000;
      await db.dayLogs.add(original);

      const incoming = makeLog('2026-06-08', 480);
      const payload = JSON.stringify({ schemaVersion: 2, dayLogs: [incoming] });
      const result = await importJson(payload);
      expect(result.replaced).toBe(1);
      expect(result.added).toBe(0);
      const stored = await db.dayLogs.where('date').equals('2026-06-08').first();
      expect(stored?.drivingMinutes).toBe(480);
      expect(stored?.id).toBe(original.id);
      expect(stored?.createdAt).toBe(1000);
    });

    it('descarta entradas inválidas', async () => {
      const payload = JSON.stringify({
        schemaVersion: 2,
        dayLogs: [
          makeLog('2026-06-08', 420),
          { date: 'invalid' },
          null,
          { openedAt: 'no es número', date: '2026-06-09' },
        ],
      });
      const result = await importJson(payload);
      expect(result.added).toBe(1);
      expect(result.skipped).toBe(3);
    });

    it('lanza error si el JSON está mal formado', async () => {
      await expect(importJson('{{ broken')).rejects.toThrow(/JSON/);
    });

    it('lanza error si no hay campo dayLogs', async () => {
      await expect(importJson('{"foo":1}')).rejects.toThrow(/dayLogs|Estructura/);
    });
  });
});
