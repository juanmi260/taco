import { formatHHMM, type Minutes } from '@/domain/time';
import { levelOf } from '@/domain/regulation';

interface Props {
  label: string;
  used: Minutes;
  limit: Minutes;
  extra?: string;
  showRemaining?: boolean;
}

const colorByLevel = {
  ok: 'bg-limit-ok',
  warn: 'bg-limit-warn',
  crit: 'bg-limit-crit',
  exceeded: 'bg-limit-crit',
} as const;

export function LimitGauge({ label, used, limit, extra, showRemaining }: Props) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const level = levelOf(used, limit);
  const exceeded = used > limit;

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
          {formatHHMM(used)} / {formatHHMM(limit)}
          {extra ? <span className="ml-2 text-slate-500">{extra}</span> : null}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full ${colorByLevel[level]} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      {showRemaining && (
        <p className="text-right text-xs">
          {exceeded ? (
            <span className="text-red-600 dark:text-red-400">
              Superado por{' '}
              <span className="font-mono tabular-nums">{formatHHMM(used - limit)}</span>
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Quedan{' '}
              <span className="font-mono tabular-nums">{formatHHMM(limit - used)}</span>
            </span>
          )}
        </p>
      )}
    </div>
  );
}
