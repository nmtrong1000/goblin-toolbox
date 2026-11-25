import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '#/styles/global.css';
import '#/styles/app.css';
import '#/i18n/index.ts';
import { router } from '#/app/router.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
