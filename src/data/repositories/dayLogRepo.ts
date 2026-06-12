import { db } from '../db';
import type { CloseDayLogInput, DayLog, NewDayLogInput } from '@/domain/dayLog';
import { newId } from '@/domain/dayLog';
import { t } from '@/i18n/es';

export const dayLogRepo = {
  async findOpen(): Promise<DayLog | undefined> {
    const all = await db.dayLogs.toArray();
    return all.find((l) => l.closedAt === null);
  },

  async findById(id: string): Promise<DayLog | undefined> {
    return db.dayLogs.get(id);
  },

  async findByDate(date: string): Promise<DayLog | undefined> {
    return db.dayLogs.where('date').equals(date).first();
  },

  async findInDateRange(startDate: string, endDate: string): Promise<DayLog[]> {
    return db.dayLogs
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async all(): Promise<DayLog[]> {
    return db.dayLogs.orderBy('date').reverse().toArray();
  },

  async open(input: NewDayLogInput): Promise<DayLog> {
    return db.transaction('rw', db.dayLogs, async () => {
      const existingOpen = (await db.dayLogs.toArray()).find((l) => l.closedAt === null);
      if (existingOpen) {
        throw new Error(t.errors.alreadyOpen);
      }
      const dupe = await db.dayLogs.where('date').equals(input.date).first();
      if (dupe) {
        throw new Error(t.errors.duplicateDate);
      }
      const now = Date.now();
      const log: DayLog = {
        id: newId(),
        date: input.date,
        openedAt: input.openedAt,
        closedAt: null,
        drivingMinutes: null,
        note: input.note,
        source: input.source ?? 'manual',
        createdAt: now,
        updatedAt: now,
      };
      await db.dayLogs.add(log);
      return log;
    });
  },

  async close(id: string, input: CloseDayLogInput): Promise<DayLog> {
    return db.transaction('rw', db.dayLogs, async () => {
      const log = await db.dayLogs.get(id);
      if (!log) throw new Error(`DayLog ${id} no encontrada`);
      const updated: DayLog = {
        ...log,
        closedAt: input.closedAt,
        drivingMinutes: input.drivingMinutes,
        note: input.note ?? log.note,
        updatedAt: Date.now(),
      };
      await db.dayLogs.put(updated);
      return updated;
    });
  },

  async update(id: string, patch: Partial<Omit<DayLog, 'id' | 'createdAt'>>): Promise<DayLog> {
    return db.transaction('rw', db.dayLogs, async () => {
      const log = await db.dayLogs.get(id);
      if (!log) throw new Error(`DayLog ${id} no encontrada`);
      const updated: DayLog = { ...log, ...patch, updatedAt: Date.now() };
      await db.dayLogs.put(updated);
      return updated;
    });
  },

  async remove(id: string): Promise<void> {
    await db.dayLogs.delete(id);
  },

  async clearAll(): Promise<void> {
    await db.dayLogs.clear();
  },
};
