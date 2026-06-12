import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function PWAUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (import.meta.env.DEV) {
        console.info('[PWA] SW registered:', swUrl);
      }
      if (!registration) return;
      const id = window.setInterval(() => {
        if (!navigator.onLine) return;
        registration.update().catch((e) => console.warn('[PWA] update check failed', e));
      }, UPDATE_CHECK_INTERVAL_MS);
      return () => window.clearInterval(id);
    },
    onRegisterError(error) {
      console.warn('[PWA] SW registration error:', error);
    },
  });

  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <>
      {!online && (
        <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 px-4 py-1 text-center text-xs font-medium text-white">
          ⚡ Sin conexión — la app sigue funcionando
        </div>
      )}

      {offlineReady && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-4"
        >
          <div className="flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg">
            <span>Listo para funcionar sin conexión.</span>
            <button
              type="button"
              onClick={() => setOfflineReady(false)}
              className="ml-2 underline"
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
