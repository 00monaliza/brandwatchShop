import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../shared/constants/routes';

// Eagerly load Home (first page users see)
import Home from '../pages/Home';

// Lazy load all other pages
const Catalog = lazy(() => import('../pages/Catalog'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Cart = lazy(() => import('../pages/Cart'));
const Favorites = lazy(() => import('../pages/Favorites'));
const Profile = lazy(() => import('../pages/Profile'));
const About = lazy(() => import('../pages/About'));
const Contacts = lazy(() => import('../pages/Contacts'));
const Sales = lazy(() => import('../pages/Sales'));
const Premium = lazy(() => import('../pages/Premium'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <div className="loading-spinner" />
  </div>
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.CATALOG} element={<Catalog />} />
        <Route path={ROUTES.PRODUCT} element={<ProductDetail />} />
        <Route path={ROUTES.CART} element={<Cart />} />
        <Route path={ROUTES.FAVORITES} element={<Favorites />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.CONTACTS} element={<Contacts />} />
        <Route path={ROUTES.SALES} element={<Sales />} />
        <Route path={ROUTES.PREMIUM} element={<Premium />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
