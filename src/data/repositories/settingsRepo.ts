import { DEFAULT_SETTINGS, db, type Settings } from '../db';

export const settingsRepo = {
  async get(): Promise<Settings> {
    const existing = await db.settings.get('singleton');
    if (existing) return existing;
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const updated: Settings = { ...current, ...patch, id: 'singleton' };
    await db.settings.put(updated);
    return updated;
  },
};
