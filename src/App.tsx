import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useThemeEffect } from './hooks/useThemeEffect';
import { useSettings } from './hooks/useSettings';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { Onboarding } from './features/onboarding/Onboarding';

export function App() {
  useThemeEffect();
  const settings = useSettings();
  const [dismissed, setDismissed] = useState(false);
  const showOnboarding = !settings.onboardingCompleted && !dismissed;

  return (
    <>
      <RouterProvider router={router} />
      <PWAUpdatePrompt />
      {showOnboarding && <Onboarding onDone={() => setDismissed(true)} />}
    </>
  );
}
