import { useState } from 'react';
import { addDays, addMonths, addWeeks, endOfMonth, format, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAllLogs } from '@/hooks/useLiveLogs';
import type { DayLog } from '@/domain/dayLog';
import {
  dateStringFrom,
  formatClock,
  formatDateLong,
  formatHHMM,
  getPreviousWeekRange,
  getWeekRange,
  todayLocalDateString,
} from '@/domain/time';
import {
  REG,
  findNextLog,
  isExtendedDriving,
  restKindAfter,
  restMinutesAfter,
  sumDriving,
  type RestKind,
} from '@/domain/regulation';
import { EditSheet } from '@/features/dayLog/EditSheet';
import { t } from '@/i18n/es';

type Tab = 'day' | 'week' | 'biweek' | 'month';

export function History() {
  const logs = useAllLogs();
  const [tab, setTab] = useState<Tab>('day');
  const [reference, setReference] = useState<Date>(() => new Date());
  const [editing, setEditing] = useState<DayLog | null>(null);

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-4">
      <h1 className="mb-4 text-2xl font-semibold">{t.history.title}</h1>

      <TabSwitch value={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'day' && (
          <DayView
            date={reference}
            logs={logs}
            onPrev={() => setReference((d) => addDays(d, -1))}
            onNext={() => setReference((d) => addDays(d, 1))}
            onEdit={setEditing}
          />
        )}
        {tab === 'week' && (
          <WeekView
            reference={reference}
            logs={logs}
            onPrev={() => setReference((d) => addWeeks(d, -1))}
            onNext={() => setReference((d) => addWeeks(d, 1))}
            onPickDay={(date) => {
              setReference(date);
              setTab('day');
            }}
            onEdit={setEditing}
          />
        )}
        {tab === 'biweek' && (
          <BiWeekView
            reference={reference}
            logs={logs}
            onPrev={() => setReference((d) => addWeeks(d, -1))}
            onNext={() => setReference((d) => addWeeks(d, 1))}
          />
        )}
        {tab === 'month' && (
          <MonthView
            reference={reference}
            logs={logs}
            onPrev={() => setReference((d) => addMonths(d, -1))}
            onNext={() => setReference((d) => addMonths(d, 1))}
            onPickDay={(date) => {
              setReference(date);
              setTab('day');
            }}
          />
        )}
      </div>

      {editing && <EditSheet log={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function TabSwitch({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const items: { id: Tab; label: string }[] = [
    { id: 'day', label: t.history.tabDay },
    { id: 'week', label: t.history.tabWeek },
    { id: 'biweek', label: t.history.tabBiWeek },
    { id: 'month', label: t.history.tabMonth },
  ];
  return (
    <div
      role="tablist"
      aria-label="Periodo"
      className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-200 p-1 dark:bg-slate-800"
    >
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={`min-h-touch rounded-xl py-2 text-sm font-medium transition ${
              active
                ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

interface NavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

function PeriodNav({ label, onPrev, onNext }: NavProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Anterior"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 active:scale-[0.96] dark:bg-slate-700 dark:text-slate-200"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <span className="flex-1 text-center font-medium capitalize">{label}</span>
      <button
        type="button"
        onClick={onNext}
        aria-label="Siguiente"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 active:scale-[0.96] dark:bg-slate-700 dark:text-slate-200"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}

interface DayViewProps {
  date: Date;
  logs: DayLog[];
  onPrev: () => void;
  onNext: () => void;
  onEdit: (log: DayLog) => void;
}

function DayView({ date, logs, onPrev, onNext, onEdit }: DayViewProps) {
  const dateStr = dateStringFrom(date.getTime());
  const log = logs.find((l) => l.date === dateStr);
  const todayStr = todayLocalDateString();

  return (
    <div>
      <PeriodNav label={formatDateLong(date.getTime())} onPrev={onPrev} onNext={onNext} />

      {!log ? (
        <div className="rounded-2xl bg-white p-6 text-center text-slate-500 dark:bg-slate-800">
          {t.history.noJourneyOnDay}
        </div>
      ) : (
        <DayDetail log={log} logs={logs} onEdit={onEdit} isToday={dateStr === todayStr} />
      )}
    </div>
  );
}

function DayDetail({
  log,
  logs,
  onEdit,
  isToday,
}: {
  log: DayLog;
  logs: DayLog[];
  onEdit: (log: DayLog) => void;
  isToday: boolean;
}) {
  const extended = isExtendedDriving(log);
  const next = findNextLog(logs, log);
  const restMinutes = restMinutesAfter(log, next);
  const restKind = restKindAfter(log, next);

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <Row label={t.history.open} value={formatClock(log.openedAt)} />
      <Row
        label={t.history.close}
        value={log.closedAt !== null ? formatClock(log.closedAt) : t.history.openTag}
        highlight={log.closedAt === null}
      />
      <Row
        label={t.history.driving}
        value={log.drivingMinutes != null ? formatHHMM(log.drivingMinutes) : '—'}
      />
      <Row
        label={t.history.dayType}
        value={extended ? `⚡ ${t.history.extended}` : t.history.normalDay}
      />
      <Row
        label={t.history.restAfter}
        value={
          restMinutes !== null
            ? `${formatHHMM(restMinutes)} · ${restKindLabel(restKind)}`
            : t.history.restAfterPending
        }
      />
      {log.note && <Row label={t.history.note} value={log.note} />}

      <button
        type="button"
        onClick={() => onEdit(log)}
        className="mt-3 w-full rounded-xl bg-slate-100 px-4 py-3 text-base font-medium text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
      >
        {t.history.edit}
      </button>
      {isToday && log.closedAt === null && (
        <p className="text-center text-xs text-slate-500">{t.edit.openNotice}</p>
      )}
    </div>
  );
}

function restKindLabel(kind: RestKind): string {
  switch (kind) {
    case 'weekly_regular':
      return t.history.restWeeklyRegular;
    case 'weekly_reduced':
      return `🛌 ${t.history.restWeeklyReduced}`;
    case 'daily_regular':
      return t.history.restDailyRegular;
    case 'daily_reduced':
      return `🌙 ${t.history.restDailyReduced}`;
    case 'insufficient':
      return `⚠ ${t.history.restInsufficient}`;
    case 'unknown':
      return t.history.restAfterPending;
  }
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span
        className={`font-mono tabular-nums ${
          highlight
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

interface WeekViewProps {
  reference: Date;
  logs: DayLog[];
  onPrev: () => void;
  onNext: () => void;
  onPickDay: (d: Date) => void;
  onEdit: (log: DayLog) => void;
}

function WeekView({ reference, logs, onPrev, onNext, onPickDay, onEdit }: WeekViewProps) {
  const week = getWeekRange(reference);
  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(week.startMs), i));
  const logsInWeek = logs.filter((l) => l.date >= week.startDate && l.date <= week.endDate);
  const total = sumDriving(logsInWeek);
  const reduced = logsInWeek.filter(
    (l) => restKindAfter(l, findNextLog(logs, l)) === 'daily_reduced',
  ).length;
  const extended = logsInWeek.filter(isExtendedDriving).length;
  const weekNumber = format(new Date(week.startMs), "'Semana' II · RRRR");

  return (
    <div>
      <PeriodNav label={weekNumber} onPrev={onPrev} onNext={onNext} />

      <ul className="space-y-2">
        {days.map((d) => {
          const ds = dateStringFrom(d.getTime());
          const log = logsInWeek.find((l) => l.date === ds);
          return (
            <li key={ds} className="rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              <button
                type="button"
                onClick={() => (log ? onEdit(log) : onPickDay(d))}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span className="flex items-baseline gap-3">
                  <span className="w-8 font-semibold uppercase text-slate-500">
                    {format(d, 'EEEEEE')}
                  </span>
                  <span className="text-sm text-slate-500">{format(d, 'd LLL')}</span>
                </span>
                <span className="flex items-baseline gap-2">
                  {log ? <DayTags log={log} logs={logs} /> : <span className="text-sm text-slate-400">—</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-700 dark:text-slate-200">{t.history.totalWeek}</span>
          <span className="font-mono tabular-nums">
            {formatHHMM(total)} / {formatHHMM(REG.WEEKLY)}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>{t.history.weeklyReduced}</span>
          <span className="font-mono tabular-nums">
            {reduced} / {REG.MAX_REDUCED_DAILY_PER_WEEK}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>{t.history.weeklyExtended}</span>
          <span className="font-mono tabular-nums">
            {extended} / {REG.MAX_EXTENDED_PER_WEEK}
          </span>
        </div>
      </div>
    </div>
  );
}

function DayTags({ log, logs }: { log: DayLog; logs: DayLog[] }) {
  const extended = isExtendedDriving(log);
  const next = findNextLog(logs, log);
  const kind = restKindAfter(log, next);

  return (
    <>
      <span className="font-mono text-sm tabular-nums text-slate-500">
        {formatClock(log.openedAt)}
        {' → '}
        {log.closedAt ? formatClock(log.closedAt) : '—'}
      </span>
      <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
        {log.drivingMinutes != null ? formatHHMM(log.drivingMinutes) : '—'}
      </span>
      {extended && <Tag>⚡</Tag>}
      {kind === 'daily_reduced' && <Tag>🌙</Tag>}
      {kind === 'weekly_reduced' && <Tag>🛌</Tag>}
      {kind === 'insufficient' && <Tag>⚠</Tag>}
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">{children}</span>
  );
}

interface BiWeekViewProps {
  reference: Date;
  logs: DayLog[];
  onPrev: () => void;
  onNext: () => void;
}

function BiWeekView({ reference, logs, onPrev, onNext }: BiWeekViewProps) {
  const current = getWeekRange(reference);
  const previous = getPreviousWeekRange(reference);

  const currentLogs = logs.filter(
    (l) => l.date >= current.startDate && l.date <= current.endDate,
  );
  const previousLogs = logs.filter(
    (l) => l.date >= previous.startDate && l.date <= previous.endDate,
  );

  const currentTotal = sumDriving(currentLogs);
  const previousTotal = sumDriving(previousLogs);
  const biWeekTotal = currentTotal + previousTotal;

  const label = `${format(new Date(previous.startMs), 'II')}-${format(
    new Date(current.startMs),
    "II · RRRR",
  )}`;

  return (
    <div>
      <PeriodNav label={`${t.history.biWeekLabel} ${label}`} onPrev={onPrev} onNext={onNext} />

      <div className="space-y-3">
        <WeekSummary
          title={`${t.history.weekLabel} ${format(new Date(previous.startMs), 'II')} · ${format(new Date(previous.startMs), 'd LLL')} – ${format(new Date(previous.endMs), 'd LLL')}`}
          total={previousTotal}
          days={previousLogs.length}
        />
        <WeekSummary
          title={`${t.history.weekLabel} ${format(new Date(current.startMs), 'II')} · ${format(new Date(current.startMs), 'd LLL')} – ${format(new Date(current.endMs), 'd LLL')}`}
          total={currentTotal}
          days={currentLogs.length}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-700 dark:text-slate-200">{t.history.totalBiWeek}</span>
          <span className="font-mono tabular-nums">
            {formatHHMM(biWeekTotal)} / {formatHHMM(REG.BIWEEKLY)}
          </span>
        </div>
      </div>
    </div>
  );
}

function WeekSummary({
  title,
  total,
  days,
}: {
  title: string;
  total: number;
  days: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-500">
        {days} {days === 1 ? 'jornada' : 'jornadas'}
      </p>
      <p className="mt-2 flex items-baseline justify-between">
        <span className="text-slate-600 dark:text-slate-300">{t.history.driving}</span>
        <span className="font-mono tabular-nums">
          {formatHHMM(total)} / {formatHHMM(REG.WEEKLY)}
        </span>
      </p>
    </div>
  );
}

interface MonthViewProps {
  reference: Date;
  logs: DayLog[];
  onPrev: () => void;
  onNext: () => void;
  onPickDay: (d: Date) => void;
}

function MonthView({ reference, logs, onPrev, onNext, onPickDay }: MonthViewProps) {
  const monthStart = startOfMonth(reference);
  const monthEnd = endOfMonth(reference);
  const monthStartStr = format(monthStart, 'yyyy-MM-dd');
  const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

  const monthLogs = logs
    .filter((l) => l.date >= monthStartStr && l.date <= monthEndStr)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  const total = sumDriving(monthLogs);
  const daysWorked = monthLogs.length;
  const closedDays = monthLogs.filter((l) => l.drivingMinutes != null).length;
  const avgPerDay = closedDays > 0 ? Math.round(total / closedDays) : 0;
  const extendedDays = monthLogs.filter(isExtendedDriving).length;
  const reducedDaily = monthLogs.filter(
    (l) => restKindAfter(l, findNextLog(logs, l)) === 'daily_reduced',
  ).length;
  const reducedWeekly = monthLogs.filter(
    (l) => restKindAfter(l, findNextLog(logs, l)) === 'weekly_reduced',
  ).length;

  const monthLabel = format(reference, 'LLLL yyyy');

  return (
    <div>
      <PeriodNav label={monthLabel} onPrev={onPrev} onNext={onNext} />

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {t.history.monthSummary}
        </p>
        <Row label={t.history.monthTotal} value={formatHHMM(total)} />
        <Row label={t.history.monthDaysWorked} value={String(daysWorked)} />
        <Row
          label={t.history.monthAvgPerDay}
          value={closedDays > 0 ? formatHHMM(avgPerDay) : '—'}
        />
        <Row label={t.history.monthExtended} value={String(extendedDays)} />
        <Row label={t.history.monthReducedDaily} value={String(reducedDaily)} />
        <Row label={t.history.monthReducedWeekly} value={String(reducedWeekly)} />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          {t.history.monthJourneys}
        </p>
        {monthLogs.length === 0 ? (
          <p className="text-center text-sm text-slate-500">{t.history.monthEmpty}</p>
        ) : (
          <ul className="space-y-1">
            {monthLogs.map((log) => (
              <li key={log.id}>
                <button
                  type="button"
                  onClick={() => onPickDay(new Date(log.openedAt))}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="w-8 font-semibold uppercase text-slate-500">
                      {format(new Date(log.openedAt), 'EEEEEE')}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">
                      {format(new Date(log.openedAt), 'd LLL')}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {log.drivingMinutes != null ? formatHHMM(log.drivingMinutes) : '—'}
                    </span>
                    {isExtendedDriving(log) && <Tag>⚡</Tag>}
                    {restKindAfter(log, findNextLog(logs, log)) === 'daily_reduced' && (
                      <Tag>🌙</Tag>
                    )}
                    {restKindAfter(log, findNextLog(logs, log)) === 'weekly_reduced' && (
                      <Tag>🛌</Tag>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
