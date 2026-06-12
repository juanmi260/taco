import { Home, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { t } from '@/i18n/es';

const items = [
  { to: '/', icon: Home, label: t.tabs.home, end: true },
  { to: '/history', icon: HistoryIcon, label: t.tabs.history, end: false },
  { to: '/settings', icon: SettingsIcon, label: t.tabs.settings, end: false },
];

export function TabBar() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {items.map(({ to, icon: Icon, label, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-touch flex-col items-center justify-center gap-1 py-2 text-xs ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
