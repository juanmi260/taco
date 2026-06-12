import { useEffect, useState } from 'react';
import type { DayLog } from '@/domain/dayLog';
import { diffMinutes, formatDateLong } from '@/domain/time';
import { Button } from '@/ui/Button';
import { DurationInput } from '@/ui/DurationInput';
import { Sheet } from '@/ui/Sheet';
import { TimeInput } from '@/ui/TimeInput';
import { useDayLogStore } from '@/store/useDayLogStore';
import { t } from '@/i18n/es';

interface Props {
  log: DayLog;
  onClose: () => void;
}

export function EditSheet({ log, onClose }: Props) {
  const updateLog = useDayLogStore((s) => s.updateLog);
  const removeLog = useDayLogStore((s) => s.removeLog);
  const pending = useDayLogStore((s) => s.pending);

  const [openedAt, setOpenedAt] = useState(log.openedAt);
  const [closedAt, setClosedAt] = useState<number | null>(log.closedAt);
  const [minutes, setMinutes] = useState(log.drivingMinutes ?? 0);
  const [note, setNote] = useState(log.note ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setOpenedAt(log.openedAt);
    setClosedAt(log.closedAt);
    setMinutes(log.drivingMinutes ?? 0);
    setNote(log.note ?? '');
    setConfirmingDelete(false);
  }, [log]);

  const isOpenLog = closedAt === null;
  const span = closedAt !== null ? Math.max(0, diffMinutes(closedAt, openedAt)) : 0;

  const warnings: string[] = [];
  if (closedAt !== null && closedAt <= openedAt) {
    warnings.push(t.close.warnCloseBeforeOpen);
  }
  if (closedAt !== null && minutes > span) {
    warnings.push(t.close.warnMinutesExceedSpan);
  }

  const canSave =
    !pending && (isOpenLog ? openedAt > 0 : closedAt !== null && closedAt > openedAt);

  async function onSave() {
    const patch: Partial<DayLog> = {
      openedAt,
      closedAt,
      drivingMinutes: closedAt !== null ? minutes : null,
      note: note.trim() || undefined,
    };
    const result = await updateLog(log.id, patch);
    if (result) onClose();
  }

  async function onDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    await removeLog(log.id);
    onClose();
  }

  return (
    <Sheet open onClose={onClose} title={t.history.edit}>
      <p className="mb-3 text-sm text-slate-500">{formatDateLong(log.openedAt)}</p>

      <p className="mb-2 text-sm font-medium">{t.edit.openLabel}</p>
      <TimeInput value={openedAt} onChange={setOpenedAt} id="edit-open" />

      {closedAt !== null && (
        <>
          <p className="mt-5 mb-2 text-sm font-medium">{t.edit.closeLabel}</p>
          <TimeInput value={closedAt} onChange={(v) => setClosedAt(v)} id="edit-close" />

          <p className="mt-5 mb-2 text-sm font-medium">{t.close.minutesLabel}</p>
          <DurationInput id="edit-driving" value={minutes} onChange={setMinutes} />
        </>
      )}

      {isOpenLog && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
          {t.edit.openNotice}
        </p>
      )}

      <label htmlFor="edit-note" className="mt-4 mb-1 block text-sm font-medium">
        {t.close.noteLabel}
      </label>
      <textarea
        id="edit-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={280}
        rows={2}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      />

      {warnings.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-700 dark:text-amber-400">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex gap-3">
        <Button variant="secondary" block onClick={onClose} disabled={pending}>
          {t.common.cancel}
        </Button>
        <Button variant="primary" block onClick={onSave} disabled={!canSave}>
          {t.common.save}
        </Button>
      </div>

      <div className="mt-3">
        <Button variant="danger" block onClick={onDelete} disabled={pending}>
          {confirmingDelete ? t.edit.confirmDelete : t.common.delete}
        </Button>
      </div>
    </Sheet>
  );
}
