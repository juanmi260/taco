import type { DayLog } from '@/domain/dayLog';
import { formatClock, formatDateLong, formatHHMM, getWeekRange, type Instant } from '@/domain/time';
import {
  REG,
  countReducedDailyRestsInWeek,
  earliestNextStart,
  pendingReducedWeeklyCompensations,
  sumBiWeeklyDriving,
  sumWeeklyDriving,
} from '@/domain/regulation';
import { LimitGauge } from '@/ui/LimitGauge';
import { t } from '@/i18n/es';

interface Props {
  lastClosed: DayLog | null;
  allLogs: DayLog[];
  now: Instant;
}

export function ClosedJourneyView({ lastClosed, allLogs, now }: Props) {
  const week = getWeekRange(now);
  const weekDriving = sumWeeklyDriving(allLogs, week);
  const biWeekDriving = sumBiWeeklyDriving(allLogs, week);
  const reducedUsed = countReducedDailyRestsInWeek(allLogs, week);

  const compensations = pendingReducedWeeklyCompensations(allLogs, now);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="inline-block h-3 w-3 rounded-full bg-slate-400" aria-hidden />
          <span className="font-semibold uppercase tracking-wide text-sm">
            {t.journey.statusClosed}
          </span>
        </div>
        {lastClosed ? (
          <div className="mt-2 space-y-1 text-slate-700 dark:text-slate-200">
            <p>
              {formatDateLong(lastClosed.openedAt)}:{' '}
              <strong>{formatClock(lastClosed.openedAt)}</strong>
              {' → '}
              <strong>{lastClosed.closedAt ? formatClock(lastClosed.closedAt) : '—'}</strong>
            </p>
            <p className="text-sm text-slate-500">
              {t.journey.drivingToday}:{' '}
              <span className="font-mono tabular-nums">
                {lastClosed.drivingMinutes != null
                  ? formatHHMM(lastClosed.drivingMinutes)
                  : '—'}
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Aún no hay jornadas registradas. Pulsa <strong>Abrir jornada</strong> para empezar.
          </p>
        )}
      </section>

      {lastClosed?.closedAt && (
        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.dashboard.nextStartTitle}
          </p>
          <NextStart closedAt={lastClosed.closedAt} reducedUsed={reducedUsed} />
        </section>
      )}

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <LimitGauge
          label={t.dashboard.weekly}
          used={weekDriving}
          limit={REG.WEEKLY}
          showRemaining
        />
        <LimitGauge
          label={t.dashboard.biWeekly}
          used={biWeekDriving}
          limit={REG.BIWEEKLY}
          showRemaining
        />
      </section>

      {compensations.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            {t.dashboard.pendingCompensation}
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-amber-700 dark:text-amber-300">
            {compensations.map((c) => (
              <li key={c.weekIsoLabel}>
                {c.weekIsoLabel} — antes del {new Date(c.deadlineEndMs).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function NextStart({ closedAt, reducedUsed }: { closedAt: number; reducedUsed: number }) {
  const next = earliestNextStart({ closedAt, reducedDailyRestsUsedThisWeek: reducedUsed });
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-slate-700 dark:text-slate-200">⏰ {t.dashboard.nextStartRegular}</span>
        <span className="text-clock font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100">
          {formatClock(next.regular)}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-slate-700 dark:text-slate-200">⚡ {t.dashboard.nextStartReduced}</span>
        <span
          className={`text-clock font-mono font-medium tabular-nums ${
            next.reduced
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-600'
          }`}
        >
          {next.reduced ? formatClock(next.reduced) : '—'}
        </span>
      </div>
      <p className="text-right text-sm text-slate-500">
        {t.dashboard.reducedAvailable(next.reducedUsed, REG.MAX_REDUCED_DAILY_PER_WEEK)}
      </p>
    </div>
  );
}
