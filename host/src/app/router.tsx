import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '#/app/AppLayout.tsx';
import { HomePage } from '#/pages/HomePage.tsx';
import { NotFoundPage } from '#/pages/NotFoundPage.tsx';
import { ToolPage } from '#/pages/ToolPage.tsx';
import { VaultPage } from '#/pages/VaultPage.tsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/vaults', element: <VaultPage /> },
      { path: '/vaults/:slug', element: <VaultPage /> },
      { path: '/tools/:slug/*', element: <ToolPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
