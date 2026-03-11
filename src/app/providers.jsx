import React from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { AdminProvider } from '../features/admin/context/AdminContext';
import { SettingsProvider } from '../features/admin/context/SettingsContext';
import { CartProvider } from '../features/cart/context/CartContext';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <SettingsProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SettingsProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
