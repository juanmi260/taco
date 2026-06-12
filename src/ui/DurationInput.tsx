import { formatHHMM } from '@/domain/time';
import { Stepper } from './Stepper';

interface Props {
  value: number;
  onChange: (totalMinutes: number) => void;
  id?: string;
}

const MAX_TOTAL = 24 * 60;

export function DurationInput({ value, onChange, id }: Props) {
  const safe = Math.max(0, Math.min(MAX_TOTAL, Math.floor(value)));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  function setHours(next: number) {
    onChange(Math.min(MAX_TOTAL, next * 60 + mins));
  }

  function setMins(next: number) {
    onChange(Math.min(MAX_TOTAL, hours * 60 + next));
  }

  return (
    <div className="space-y-3">
      <Stepper id={id} label="Horas" value={hours} onChange={setHours} min={0} max={24} step={1} />
      <Stepper
        label="Minutos"
        value={mins}
        onChange={setMins}
        min={0}
        max={59}
        step={1}
        secondaryStep={5}
      />
      <p className="text-center text-sm text-slate-500" aria-live="polite">
        Total:{' '}
        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
          {formatHHMM(safe)}
        </span>
      </p>
    </div>
  );
}
