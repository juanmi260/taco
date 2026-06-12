import { useEffect } from 'react';
import { useSettings } from './useSettings';

export function useThemeEffect(): void {
  const settings = useSettings();
  const theme = settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    const applyAuto = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    };

    if (theme === 'dark') {
      root.classList.add('dark');
      return;
    }
    if (theme === 'light') {
      root.classList.remove('dark');
      return;
    }

    applyAuto();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyAuto);
    return () => mq.removeEventListener('change', applyAuto);
  }, [theme]);
}
