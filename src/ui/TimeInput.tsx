import { formatClock } from '@/domain/time';
import { Stepper } from './Stepper';

interface Props {
  value: number;
  onChange: (ts: number) => void;
  id?: string;
}

export function TimeInput({ value, onChange, id }: Props) {
  const date = new Date(value);
  const hours = date.getHours();
  const mins = date.getMinutes();

  function setHours(next: number) {
    const d = new Date(value);
    d.setHours(next);
    d.setSeconds(0, 0);
    onChange(d.getTime());
  }

  function setMins(next: number) {
    const d = new Date(value);
    d.setMinutes(next);
    d.setSeconds(0, 0);
    onChange(d.getTime());
  }

  return (
    <div className="space-y-3">
      <p
        className="text-center text-clock font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100"
        aria-live="polite"
      >
        {formatClock(value)}
      </p>
      <Stepper id={id} label="Hora" value={hours} onChange={setHours} min={0} max={23} step={1} pad={2} />
      <Stepper label="Minutos" value={mins} onChange={setMins} min={0} max={59} step={1} pad={2} />
    </div>
  );
}
