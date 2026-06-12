import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { settingsRepo } from '@/data/repositories/settingsRepo';
import { primeSettingsCache } from '@/hooks/useSettings';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');

function mount() {
  createRoot(rootEl!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

settingsRepo
  .get()
  .then((settings) => {
    primeSettingsCache(settings);
  })
  .catch((err) => {
    console.error('[Taco] Failed to initialise settings, continuing with defaults:', err);
  })
  .finally(mount);
