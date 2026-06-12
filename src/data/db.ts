import Dexie, { type Table } from 'dexie';
import type { DayLog } from '@/domain/dayLog';

export interface Settings {
  id: 'singleton';
  driverName?: string;
  timezone: string;
  weekStartsOn: 1;
  alerts: {
    nearDailyLimit: boolean;
    dailyLimitReached: boolean;
    weeklyLimitNear: boolean;
    weeklyLimitReached: boolean;
    biWeeklyLimitNear: boolean;
    weeklyRestCompensationDue: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  onboardingCompleted: boolean;
  storagePersistGranted: boolean;
  schemaVersion: number;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekStartsOn: 1,
  alerts: {
    nearDailyLimit: true,
    dailyLimitReached: true,
    weeklyLimitNear: true,
    weeklyLimitReached: true,
    biWeeklyLimitNear: true,
    weeklyRestCompensationDue: true,
  },
  theme: 'auto',
  onboardingCompleted: false,
  storagePersistGranted: false,
  schemaVersion: 1,
};

export class TacoDB extends Dexie {
  dayLogs!: Table<DayLog, string>;
  settings!: Table<Settings, 'singleton'>;

  constructor(name = 'taco') {
    super(name);
    this.version(1).stores({
      dayLogs: 'id, &date, openedAt, closedAt',
      settings: 'id',
    });
    this.version(2)
      .stores({
        dayLogs: 'id, &date, openedAt, closedAt',
        settings: 'id',
      })
      .upgrade((tx) =>
        tx
          .table('dayLogs')
          .toCollection()
          .modify((log: Record<string, unknown>) => {
            delete log.extendedDriving;
            delete log.reducedDailyRest;
            delete log.reducedWeeklyRest;
          }),
      );
  }
}

export const db = new TacoDB();
