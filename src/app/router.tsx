import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { History } from '@/features/history/History';
import { Settings } from '@/features/settings/Settings';

// "/taco/" → "/taco" ; "/" → "" (React Router quiere basename sin barra final)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'history', element: <History /> },
        { path: 'settings', element: <Settings /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename },
);
