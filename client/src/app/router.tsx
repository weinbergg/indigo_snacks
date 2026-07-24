import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

const HomePage = lazy(() => import('../pages/HomePage'));
const CatalogPage = lazy(() => import('../pages/CatalogPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
