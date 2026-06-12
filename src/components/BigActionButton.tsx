import { Play, Square } from 'lucide-react';
import { Button } from '@/ui/Button';

interface Props {
  state: 'open' | 'closed';
  onClick: () => void;
  disabled?: boolean;
}

export function BigActionButton({ state, onClick, disabled }: Props) {
  if (state === 'open') {
    return (
      <Button
        variant="danger"
        size="xl"
        block
        onClick={onClick}
        disabled={disabled}
        aria-label="Cerrar jornada"
      >
        <Square className="h-6 w-6" /> Cerrar jornada
      </Button>
    );
  }
  return (
    <Button
      variant="primary"
      size="xl"
      block
      onClick={onClick}
      disabled={disabled}
      aria-label="Abrir jornada"
    >
      <Play className="h-6 w-6" /> Abrir jornada
    </Button>
  );
}
