import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { settingsRepo } from '@/data/repositories/settingsRepo';
import { primeSettingsCache } from '@/hooks/useSettings';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');

settingsRepo.get().then((settings) => {
  primeSettingsCache(settings);
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
