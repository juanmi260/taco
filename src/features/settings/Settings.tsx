import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Download, Upload, Trash2, FlaskConical } from 'lucide-react';
import { settingsRepo } from '@/data/repositories/settingsRepo';
import { dayLogRepo } from '@/data/repositories/dayLogRepo';
import { downloadFile, exportCsv, exportJson, importJson, type ImportResult } from '@/data/transfer';
import { loadSampleData } from '@/data/sampleData';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/ui/Button';
import { t } from '@/i18n/es';

const APP_VERSION = '0.1.0';

export function Settings() {
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [driverDraft, setDriverDraft] = useState(settings.driverName ?? '');
  const [status, setStatus] = useState<string | null>(null);
  const [statusKind, setStatusKind] = useState<'info' | 'error'>('info');
  const [confirmingClear, setConfirmingClear] = useState(false);

  function showStatus(msg: string, kind: 'info' | 'error' = 'info') {
    setStatus(msg);
    setStatusKind(kind);
    window.setTimeout(() => setStatus(null), 4000);
  }

  async function onDriverBlur() {
    if (driverDraft.trim() === (settings.driverName ?? '')) return;
    await settingsRepo.update({ driverName: driverDraft.trim() || undefined });
  }

  async function onThemeChange(theme: 'auto' | 'light' | 'dark') {
    await settingsRepo.update({ theme });
  }

  async function onRequestPersist() {
    if (!navigator.storage?.persist) {
      showStatus('El navegador no soporta almacenamiento persistente.', 'error');
      return;
    }
    const granted = await navigator.storage.persist();
    await settingsRepo.update({ storagePersistGranted: granted });
    showStatus(granted ? 'Almacenamiento persistente concedido.' : 'No se ha concedido.', granted ? 'info' : 'error');
  }

  async function onExportJson() {
    const text = await exportJson();
    const filename = `taco-${format(new Date(), 'yyyyMMdd-HHmm')}.json`;
    downloadFile(text, filename, 'application/json');
  }

  async function onExportCsv() {
    const text = await exportCsv();
    const filename = `taco-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    downloadFile(text, filename, 'text/csv');
  }

  async function onImportFile(file: File) {
    try {
      const text = await file.text();
      const result: ImportResult = await importJson(text);
      showStatus(t.settings.importPicked(result.added, result.replaced, result.skipped));
    } catch (e) {
      showStatus((e as Error).message, 'error');
    }
  }

  async function onClearAll() {
    if (!confirmingClear) {
      setConfirmingClear(true);
      window.setTimeout(() => setConfirmingClear(false), 5000);
      return;
    }
    await dayLogRepo.clearAll();
    setConfirmingClear(false);
    showStatus('Datos borrados.');
  }

  async function onLoadSample() {
    try {
      const result = await loadSampleData();
      showStatus(
        t.settings.devSampleResult(result.added, result.skippedDuplicate, result.skippedOpenConflict),
      );
    } catch (e) {
      showStatus((e as Error).message, 'error');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-4">
      <h1 className="mb-4 text-2xl font-semibold">{t.settings.title}</h1>

      {status && (
        <p
          role="status"
          className={`mb-4 rounded-xl p-3 text-sm ${
            statusKind === 'error'
              ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
          }`}
        >
          {status}
        </p>
      )}

      <Section title={t.settings.driver}>
        <label htmlFor="driver-name" className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
          {t.settings.driverName}
        </label>
        <input
          id="driver-name"
          type="text"
          value={driverDraft}
          onChange={(e) => setDriverDraft(e.target.value)}
          onBlur={onDriverBlur}
          placeholder={t.settings.driverPlaceholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
        <p className="mt-2 text-sm text-slate-500">
          {t.settings.timezone}:{' '}
          <span className="font-mono">{settings.timezone}</span>
        </p>
      </Section>

      <Section title={t.settings.theme}>
        <div className="grid grid-cols-3 gap-2">
          {(['auto', 'light', 'dark'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onThemeChange(value)}
              aria-pressed={settings.theme === value}
              className={`min-h-touch rounded-xl px-3 py-2 text-sm font-medium ${
                settings.theme === value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {value === 'auto' && t.settings.themeAuto}
              {value === 'light' && t.settings.themeLight}
              {value === 'dark' && t.settings.themeDark}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t.settings.storage}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-300">{t.settings.storagePersistent}</span>
          <span
            className={`font-medium ${
              settings.storagePersistGranted
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {settings.storagePersistGranted ? t.settings.storageGranted : t.settings.storageNotGranted}
          </span>
        </div>
        {!settings.storagePersistGranted && (
          <>
            <p className="mt-2 text-sm text-slate-500">{t.settings.storageWarn}</p>
            <Button variant="secondary" block className="mt-3" onClick={onRequestPersist}>
              {t.settings.storageRequest}
            </Button>
          </>
        )}
      </Section>

      <Section title={t.settings.data}>
        <div className="space-y-2">
          <Button variant="secondary" block onClick={onExportJson}>
            <Download className="h-4 w-4" aria-hidden /> {t.settings.exportJson}
          </Button>
          <Button variant="secondary" block onClick={onExportCsv}>
            <Download className="h-4 w-4" aria-hidden /> {t.settings.exportCsv}
          </Button>
          <Button variant="secondary" block onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden /> {t.settings.importJson}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = '';
            }}
          />
        </div>
      </Section>

      <Section>
        <p className="mb-2 text-sm text-slate-500">{t.settings.clearAllNotice}</p>
        <Button variant="danger" block onClick={onClearAll}>
          <Trash2 className="h-4 w-4" aria-hidden />
          {confirmingClear ? t.settings.clearAllConfirm : t.settings.clearAll}
        </Button>
      </Section>

      <Section title={t.settings.devTitle}>
        <p className="mb-3 text-sm text-slate-500">{t.settings.devSampleDescription}</p>
        <Button variant="secondary" block onClick={onLoadSample}>
          <FlaskConical className="h-4 w-4" aria-hidden /> {t.settings.devSampleButton}
        </Button>
      </Section>

      <Section title={t.settings.about}>
        <p className="text-sm text-slate-500">
          Taco · {t.settings.version} {APP_VERSION}
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
      {title && (
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h2>
      )}
      {children}
    </section>
  );
}
