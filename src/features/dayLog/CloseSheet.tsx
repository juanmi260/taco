import { useEffect, useState } from 'react';
import type { DayLog } from '@/domain/dayLog';
import { diffMinutes, formatClock, getWeekRange } from '@/domain/time';
import { REG, countExtendedDrivingsInWeek } from '@/domain/regulation';
import { Button } from '@/ui/Button';
import { DurationInput } from '@/ui/DurationInput';
import { Sheet } from '@/ui/Sheet';
import { TimeInput } from '@/ui/TimeInput';
import { useDayLogStore } from '@/store/useDayLogStore';
import { t } from '@/i18n/es';

interface Props {
  open: boolean;
  onClose: () => void;
  openLog: DayLog;
  allLogs: DayLog[];
}

export function CloseSheet({ open, onClose, openLog, allLogs }: Props) {
  const closeJourney = useDayLogStore((s) => s.closeJourney);
  const pending = useDayLogStore((s) => s.pending);

  const [closedAt, setClosedAt] = useState<number>(() => Date.now());
  const [minutes, setMinutes] = useState<number>(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setClosedAt(Date.now());
      setMinutes(0);
      setNote('');
    }
  }, [open]);

  const span = Math.max(0, diffMinutes(closedAt, openLog.openedAt));
  const willBeExtended = minutes > REG.DAILY_STANDARD;
  const week = getWeekRange(openLog.openedAt);
  const extendedUsed = countExtendedDrivingsInWeek(
    allLogs.filter((l) => l.id !== openLog.id),
    week,
  );

  const warnings: string[] = [];
  if (closedAt <= openLog.openedAt) {
    warnings.push(t.close.warnCloseBeforeOpen);
  }
  if (minutes > span) {
    warnings.push(t.close.warnMinutesExceedSpan);
  }
  if (willBeExtended && extendedUsed >= REG.MAX_EXTENDED_PER_WEEK) {
    warnings.push(t.close.warnExtendedExceeded);
  }
  if (minutes > REG.DAILY_EXTENDED) {
    warnings.push(t.close.warnDailyHardLimit);
  }

  const canConfirm = !pending && minutes > 0 && closedAt > openLog.openedAt;

  async function onConfirm() {
    const ok = await closeJourney(openLog.id, {
      closedAt,
      drivingMinutes: minutes,
      note: note.trim() || undefined,
    });
    if (ok) onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.close.title}>
      <p className="mb-3 text-sm text-slate-500">
        Apertura: <span className="font-mono tabular-nums">{formatClock(openLog.openedAt)}</span>
      </p>

      <p className="mb-2 text-sm font-medium">{t.close.timeLabel}</p>
      <TimeInput value={closedAt} onChange={setClosedAt} id="close-time" />

      <p id="driving-label" className="mt-5 mb-2 text-sm font-medium">
        {t.close.minutesLabel}
      </p>
      <DurationInput id="driving-hours" value={minutes} onChange={setMinutes} />

      {willBeExtended && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          ⚡ {t.close.willMarkExtended(extendedUsed + 1, REG.MAX_EXTENDED_PER_WEEK)}
        </p>
      )}

      <label htmlFor="note" className="mt-4 mb-1 block text-sm font-medium">
        {t.close.noteLabel}
      </label>
      <textarea
        id="note"
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
          {t.close.cancel}
        </Button>
        <Button variant="primary" block onClick={onConfirm} disabled={!canConfirm}>
          {t.close.confirm}
        </Button>
      </div>
    </Sheet>
  );
}
