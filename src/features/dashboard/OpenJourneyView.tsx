import type { DayLog } from '@/domain/dayLog';
import {
  addMins,
  diffMinutes,
  formatClock,
  formatHHMM,
  getWeekRange,
  type Instant,
} from '@/domain/time';
import {
  availableDrivingForOpenJourney,
  countExtendedDrivingsInWeek,
  countReducedDailyRestsInWeek,
  REG,
  sumBiWeeklyDriving,
  sumWeeklyDriving,
} from '@/domain/regulation';
import { DurationInput } from '@/ui/DurationInput';
import { LimitGauge } from '@/ui/LimitGauge';
import { useDayLogStore } from '@/store/useDayLogStore';
import { t } from '@/i18n/es';

interface Props {
  openLog: DayLog;
  allLogs: DayLog[];
  now: Instant;
}

export function OpenJourneyView({ openLog, allLogs, now }: Props) {
  const week = getWeekRange(now);
  const updateLog = useDayLogStore((s) => s.updateLog);

  const closedLogsInWeek = allLogs.filter(
    (l) =>
      l.id !== openLog.id &&
      l.closedAt !== null &&
      l.date >= week.startDate &&
      l.date <= week.endDate,
  );
  const closedLogsInPreviousWeek = allLogs.filter((l) => {
    if (l.closedAt === null) return false;
    const prevWeek = getWeekRange(week.startMs - 24 * 60 * 60 * 1000);
    return l.date >= prevWeek.startDate && l.date <= prevWeek.endDate;
  });

  const drivingToday = openLog.drivingMinutes ?? 0;
  const weekDriving = sumWeeklyDriving(allLogs, week);
  const biWeekDriving = sumBiWeeklyDriving(allLogs, week);
  const reducedUsed = countReducedDailyRestsInWeek(allLogs, week);
  const extendedUsed = countExtendedDrivingsInWeek(allLogs, week);

  const avail = availableDrivingForOpenJourney({
    closedLogsInWeek,
    closedLogsInPreviousWeek,
    drivingToday,
  });

  const closeDeadline = addMins(openLog.openedAt, REG.ACTIVITY_WINDOW);
  const elapsed = diffMinutes(now, openLog.openedAt);
  const minutesUntilDeadline = Math.max(0, diffMinutes(closeDeadline, now));

  function onDrivingChange(next: number) {
    updateLog(openLog.id, { drivingMinutes: next });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" aria-hidden />
          <span className="font-semibold uppercase tracking-wide text-sm">
            {t.journey.statusOpen}
          </span>
        </div>
        <p className="mt-1 text-slate-700 dark:text-slate-200">
          {t.journey.openedAt} <strong>{formatClock(openLog.openedAt)}</strong>{' '}
          <span className="text-slate-500">({t.journey.elapsed(formatHHMM(elapsed))})</span>
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.dashboard.closeDeadline}</p>
        <p className="mt-1 text-clock font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100">
          {formatClock(closeDeadline)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {t.dashboard.closeDeadlineHint(formatHHMM(minutesUntilDeadline))}
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {t.dashboard.todayDriving}
        </p>
        <DurationInput value={drivingToday} onChange={onDrivingChange} id="today-driving" />

        <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
          <LimitGauge
            label={t.dashboard.dailyRemaining}
            used={drivingToday}
            limit={REG.DAILY_STANDARD}
          />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t.dashboard.remainingToday(formatHHMM(avail.available))}
          </p>
          {avail.extensionAvailable && drivingToday >= REG.DAILY_STANDARD && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚡ {t.dashboard.extensionInUse(REG.MAX_EXTENDED_PER_WEEK - avail.extendedUsedThisWeek - 1)}
            </p>
          )}
          {avail.extensionAvailable && drivingToday < REG.DAILY_STANDARD && (
            <p className="text-xs text-slate-500">
              {t.dashboard.extensionHint(REG.MAX_EXTENDED_PER_WEEK - avail.extendedUsedThisWeek)}
            </p>
          )}
        </div>
      </section>

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
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            {t.dashboard.reduced}: {reducedUsed} / {REG.MAX_REDUCED_DAILY_PER_WEEK}
          </span>
          <span>
            {t.dashboard.extended}: {extendedUsed} / {REG.MAX_EXTENDED_PER_WEEK}
          </span>
        </div>
      </section>
    </div>
  );
}
