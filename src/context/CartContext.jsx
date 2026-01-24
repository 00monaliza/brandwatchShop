import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { showToast } from '../utils/toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Сохраняем в localStorage при изменениях
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Добавить товар в корзину
  const addToCart = useCallback((product, silent = false) => {
    // Убеждаемся, что цена в KZT сохранена
    const priceInKZT = product.priceInKZT || product.price || 0;
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Сохраняем товар с ценой в KZT
      return [...prev, { 
        ...product, 
        quantity: 1,
        priceInKZT: priceInKZT,
        price: priceInKZT // Для обратной совместимости
      }];
    });
    if (!silent) {
      showToast.addedToCart(product.title || product.brand);
    }
  }, []);

  // Удалить товар из корзины
  const removeFromCart = useCallback((productId, productName = null) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    showToast.removedFromCart(productName);
  }, []);

  // Обновить количество
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Очистить корзину
  const clearCart = useCallback((silent = false) => {
    setCartItems([]);
    if (!silent) {
      showToast.cartCleared();
    }
  }, []);

  // Добавить/убрать из избранного
  const toggleFavorite = useCallback((product) => {
    setFavorites(prev => {
      const isFav = prev.some(item => item.id === product.id);
      
      if (isFav) {
        showToast.removedFromFavorites(product.title || product.brand);
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast.addedToFavorites(product.title || product.brand);
        return [...prev, product];
      }
    });
  }, []);

  // Проверить, в избранном ли товар
  const isFavorite = useCallback((productId) => {
    return favorites.some(item => item.id === productId);
  }, [favorites]);

  // Подсчёт общего количества товаров (мемоизировано)
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Подсчёт общей суммы в базовой валюте (KZT) (мемоизировано)
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      // Используем priceInKZT если есть, иначе price (предполагаем, что это уже в KZT)
      const priceInKZT = item.priceInKZT || item.price || 0;
      return sum + priceInKZT * item.quantity;
    }, 0);
  }, [cartItems]);

  // Количество избранного (мемоизировано)
  const favoritesCount = useMemo(() => favorites.length, [favorites]);

  const value = useMemo(() => ({
    cartItems,
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    isFavorite,
    cartCount,
    cartTotal,
    favoritesCount
  }), [cartItems, favorites, addToCart, removeFromCart, updateQuantity, clearCart, toggleFavorite, isFavorite, cartCount, cartTotal, favoritesCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
