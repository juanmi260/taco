import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/ui/Button';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      if (import.meta.env.DEV) {
        console.info('[PWA] SW registered:', swUrl);
      }
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

  function dismissOfflineReady() {
    setOfflineReady(false);
  }

  function applyUpdate() {
    updateServiceWorker(true);
  }

  return (
    <>
      {!online && (
        <div className="fixed inset-x-0 top-0 z-50 bg-amber-500 px-4 py-1 text-center text-xs font-medium text-white">
          ⚡ Sin conexión — la app sigue funcionando
        </div>
      )}

      {needRefresh && (
        <div
          role="alertdialog"
          aria-label="Nueva versión disponible"
          className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-4"
        >
          <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-lg dark:border-emerald-900/50 dark:bg-slate-800">
            <p className="text-sm text-slate-800 dark:text-slate-100">
              Nueva versión disponible.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" onClick={() => setNeedRefresh(false)}>
                Después
              </Button>
              <Button variant="primary" onClick={applyUpdate}>
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      )}

      {offlineReady && !needRefresh && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-4"
        >
          <div className="flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg">
            <span>Listo para funcionar sin conexión.</span>
            <button
              type="button"
              onClick={dismissOfflineReady}
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
