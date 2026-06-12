import { useState } from 'react';
import { Play, ClipboardList, Smartphone } from 'lucide-react';
import { settingsRepo } from '@/data/repositories/settingsRepo';
import { Button } from '@/ui/Button';

interface Props {
  onDone: () => void;
}

const slides = [
  {
    icon: Smartphone,
    title: 'Tu cuaderno digital de tacógrafo',
    body: 'Lleva el control de tus tiempos de conducción según el Reglamento (CE) 561/2006 con un esfuerzo mínimo.',
  },
  {
    icon: Play,
    title: 'Dos toques al día',
    body: 'Pulsa Abrir al empezar la jornada. Al terminar, pulsa Cerrar e introduce las horas de conducción totales del día.',
  },
  {
    icon: ClipboardList,
    title: 'Disponibilidad siempre a la vista',
    body: 'Taco calcula hasta qué hora puedes conducir y a qué hora más pronto puedes empezar mañana. Tus datos viven en el móvil; exporta cuando quieras.',
  },
];

export function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const slide = slides[step]!;
  const Icon = slide.icon;
  const isLast = step === slides.length - 1;

  async function finish() {
    await settingsRepo.update({ onboardingCompleted: true });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-end px-4 pt-4">
        <button
          type="button"
          onClick={finish}
          className="text-sm font-medium text-slate-500 underline"
        >
          Saltar
        </button>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <Icon className="h-12 w-12" aria-hidden />
        </div>
        <h1 className="mb-3 text-2xl font-semibold">{slide.title}</h1>
        <p className="max-w-sm text-base text-slate-600 dark:text-slate-300">{slide.body}</p>

        <div className="mt-8 flex gap-2" role="tablist">
          {slides.map((_, i) => (
            <span
              key={i}
              aria-current={i === step}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </main>

      <div className="px-6 pb-8">
        <Button
          variant="primary"
          size="xl"
          block
          onClick={() => (isLast ? finish() : setStep(step + 1))}
        >
          {isLast ? 'Empezar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}
