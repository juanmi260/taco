import { useEffect, useState } from 'react';
import { Button } from '@/ui/Button';
import { Sheet } from '@/ui/Sheet';
import { TimeInput } from '@/ui/TimeInput';
import { useDayLogStore } from '@/store/useDayLogStore';
import { t } from '@/i18n/es';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function OpenSheet({ open, onClose }: Props) {
  const openJourney = useDayLogStore((s) => s.openJourney);
  const pending = useDayLogStore((s) => s.pending);

  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    if (open) setTime(Date.now());
  }, [open]);

  async function onConfirm() {
    const result = await openJourney(time);
    if (result) onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.open.title}>
      <p className="mb-3 text-sm text-slate-500">{t.open.timeLabel}</p>
      <TimeInput value={time} onChange={setTime} id="open-time" />

      <div className="mt-5 flex gap-3">
        <Button variant="secondary" block onClick={onClose} disabled={pending}>
          {t.open.cancel}
        </Button>
        <Button variant="primary" block onClick={onConfirm} disabled={pending}>
          {t.open.confirm}
        </Button>
      </div>
    </Sheet>
  );
}
