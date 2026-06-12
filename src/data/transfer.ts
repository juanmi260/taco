import { format } from 'date-fns';
import { db, type Settings } from './db';
import type { DayLog } from '@/domain/dayLog';
import { newId } from '@/domain/dayLog';

export const SCHEMA_VERSION = 2;

export interface ExportFile {
  schemaVersion: number;
  exportedAt: number;
  driver: string | null;
  timezone: string;
  dayLogs: DayLog[];
  settings: Settings | null;
}

export async function buildExport(): Promise<ExportFile> {
  const dayLogs = await db.dayLogs.orderBy('date').toArray();
  const settings = (await db.settings.get('singleton')) ?? null;
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    driver: settings?.driverName ?? null,
    timezone: settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    dayLogs,
    settings,
  };
}

export async function exportJson(): Promise<string> {
  const file = await buildExport();
  return JSON.stringify(file, null, 2);
}

export async function exportCsv(): Promise<string> {
  const logs = await db.dayLogs.orderBy('date').toArray();
  const header = 'fecha,hora_apertura,hora_cierre,minutos_conduccion,nota';
  const rows = logs.map((l) => {
    const openedAt = format(new Date(l.openedAt), 'HH:mm');
    const closedAt = l.closedAt !== null ? format(new Date(l.closedAt), 'HH:mm') : '';
    const note = (l.note ?? '').replace(/"/g, '""').replace(/\n/g, ' ');
    return [
      l.date,
      openedAt,
      closedAt,
      l.drivingMinutes ?? '',
      `"${note}"`,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export interface ImportResult {
  added: number;
  replaced: number;
  skipped: number;
}

function isLogLike(x: unknown): x is Partial<DayLog> {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.date === 'string' &&
    typeof o.openedAt === 'number' &&
    (o.closedAt === null || typeof o.closedAt === 'number') &&
    (o.drivingMinutes === null || typeof o.drivingMinutes === 'number')
  );
}

export async function importJson(text: string): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (typeof parsed !== 'object' || parsed === null || !('dayLogs' in parsed)) {
    throw new Error('Estructura JSON no reconocida.');
  }
  const raw = (parsed as { dayLogs: unknown }).dayLogs;
  if (!Array.isArray(raw)) {
    throw new Error('El campo "dayLogs" debe ser una lista.');
  }

  let added = 0;
  let replaced = 0;
  let skipped = 0;

  await db.transaction('rw', db.dayLogs, async () => {
    for (const item of raw) {
      if (!isLogLike(item)) {
        skipped++;
        continue;
      }
      const now = Date.now();
      const log: DayLog = {
        id: typeof item.id === 'string' ? item.id : newId(),
        date: item.date as string,
        openedAt: item.openedAt as number,
        closedAt: (item.closedAt as number | null) ?? null,
        drivingMinutes: (item.drivingMinutes as number | null) ?? null,
        note: typeof item.note === 'string' ? item.note : undefined,
        source: 'imported',
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
        updatedAt: now,
      };
      const existing = await db.dayLogs.where('date').equals(log.date).first();
      if (existing) {
        await db.dayLogs.put({ ...log, id: existing.id, createdAt: existing.createdAt });
        replaced++;
      } else {
        await db.dayLogs.put(log);
        added++;
      }
    }
  });

  return { added, replaced, skipped };
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
