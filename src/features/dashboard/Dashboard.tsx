import { useState } from 'react';
import { useAllLogs, useOpenLog } from '@/hooks/useLiveLogs';
import { useNow } from '@/hooks/useNow';
import { useDayLogStore } from '@/store/useDayLogStore';
import { BigActionButton } from '@/components/BigActionButton';
import { formatClock, formatDateLong } from '@/domain/time';
import { OpenJourneyView } from './OpenJourneyView';
import { ClosedJourneyView } from './ClosedJourneyView';
import { CloseSheet } from '@/features/dayLog/CloseSheet';
import { OpenSheet } from '@/features/dayLog/OpenSheet';

export function Dashboard() {
  const now = useNow(30_000);
  const openLog = useOpenLog();
  const allLogs = useAllLogs();
  const error = useDayLogStore((s) => s.error);
  const clearError = useDayLogStore((s) => s.clearError);

  const [closeSheetOpen, setCloseSheetOpen] = useState(false);
  const [openSheetOpen, setOpenSheetOpen] = useState(false);

  const lastClosed = allLogs.find((l) => l.closedAt !== null) ?? null;

  function onAction() {
    if (openLog) {
      setCloseSheetOpen(true);
    } else {
      setOpenSheetOpen(true);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col gap-5 px-4 pb-20 pt-4">
      <header className="flex items-baseline justify-between text-sm text-slate-500">
        <span className="font-mono tabular-nums">{formatClock(now)}</span>
        <span>{formatDateLong(now)}</span>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200"
        >
          <span>{error}</span>
          <button onClick={clearError} className="font-semibold underline">
            Cerrar
          </button>
        </div>
      )}

      <main className="flex-1">
        {openLog ? (
          <OpenJourneyView openLog={openLog} allLogs={allLogs} now={now} />
        ) : (
          <ClosedJourneyView lastClosed={lastClosed} allLogs={allLogs} now={now} />
        )}
      </main>

      <BigActionButton state={openLog ? 'open' : 'closed'} onClick={onAction} />

      {openLog && (
        <CloseSheet
          open={closeSheetOpen}
          onClose={() => setCloseSheetOpen(false)}
          openLog={openLog}
          allLogs={allLogs}
        />
      )}

      <OpenSheet open={openSheetOpen} onClose={() => setOpenSheetOpen(false)} />
    </div>
  );
}
