interface Props {
  id?: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  secondaryStep?: number;
  pad?: number;
}

export function Stepper({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  secondaryStep,
  pad = 0,
}: Props) {
  const display = pad > 0 ? String(value).padStart(pad, '0') : String(value);
  const hasSecondary =
    typeof secondaryStep === 'number' && secondaryStep > 0 && secondaryStep !== step;

  function commit(raw: string) {
    if (raw === '') {
      onChange(min);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange(Math.max(min, Math.min(max, Math.floor(n))));
  }

  function adjust(delta: number) {
    onChange(Math.max(min, Math.min(max, value + delta)));
  }

  const buttonBase =
    'flex h-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 font-semibold text-slate-700 active:scale-[0.96] disabled:opacity-40 dark:bg-slate-700 dark:text-slate-200';
  const primaryW = hasSecondary ? 'w-11' : 'w-12';
  const secondaryW = 'w-11';

  return (
    <div className="space-y-1">
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="flex items-stretch gap-1.5">
        {hasSecondary && (
          <button
            type="button"
            aria-label={`Disminuir ${label.toLowerCase()} en ${secondaryStep}`}
            disabled={value <= min}
            onClick={() => adjust(-(secondaryStep ?? 0))}
            className={`${buttonBase} ${secondaryW} text-sm`}
          >
            −{secondaryStep}
          </button>
        )}
        <button
          type="button"
          aria-label={`Disminuir ${label.toLowerCase()}${hasSecondary ? ` en ${step}` : ''}`}
          disabled={value <= min}
          onClick={() => adjust(-step)}
          className={`${buttonBase} ${primaryW} ${hasSecondary ? 'text-sm' : 'text-2xl'}`}
        >
          {hasSecondary ? `−${step}` : '−'}
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => commit(e.target.value)}
          className="h-12 w-full min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2 text-center text-2xl font-mono tabular-nums text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          aria-label={label}
        />
        <button
          type="button"
          aria-label={`Aumentar ${label.toLowerCase()}${hasSecondary ? ` en ${step}` : ''}`}
          disabled={value >= max}
          onClick={() => adjust(step)}
          className={`${buttonBase} ${primaryW} ${hasSecondary ? 'text-sm' : 'text-2xl'}`}
        >
          {hasSecondary ? `+${step}` : '+'}
        </button>
        {hasSecondary && (
          <button
            type="button"
            aria-label={`Aumentar ${label.toLowerCase()} en ${secondaryStep}`}
            disabled={value >= max}
            onClick={() => adjust(secondaryStep ?? 0)}
            className={`${buttonBase} ${secondaryW} text-sm`}
          >
            +{secondaryStep}
          </button>
        )}
      </div>
    </div>
  );
}
