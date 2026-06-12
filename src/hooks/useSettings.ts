import { useLiveQuery } from 'dexie-react-hooks';
import { DEFAULT_SETTINGS, db, type Settings } from '@/data/db';

let cachedInitial: Settings = DEFAULT_SETTINGS;

export function primeSettingsCache(s: Settings): void {
  cachedInitial = s;
}

export function useSettings(): Settings {
  return useLiveQuery(() => db.settings.get('singleton'), [], cachedInitial) ?? cachedInitial;
}
