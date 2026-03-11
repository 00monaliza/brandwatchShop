import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../shared/constants/routes';
import Home from '../pages/Home';
import Catalog from '../pages/Catalog';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Favorites from '../pages/Favorites';
import Profile from '../pages/Profile';
import About from '../pages/About';
import Contacts from '../pages/Contacts';
import Sales from '../pages/Sales';
import Premium from '../pages/Premium';

export function AppRouter() {
  return (
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
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
