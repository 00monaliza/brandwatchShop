import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const addToCart = (product, silent = false) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (!silent) {
      showToast.addedToCart(product.title || product.brand);
    }
  };

  // Удалить товар из корзины
  const removeFromCart = (productId, productName = null) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    showToast.removedFromCart(productName);
  };

  // Обновить количество
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Очистить корзину
  const clearCart = (silent = false) => {
    setCartItems([]);
    if (!silent) {
      showToast.cartCleared();
    }
  };

  // Добавить/убрать из избранного
  const toggleFavorite = (product) => {
    const isFav = favorites.some(item => item.id === product.id);
    
    if (isFav) {
      setFavorites(prev => prev.filter(item => item.id !== product.id));
      showToast.removedFromFavorites(product.title || product.brand);
    } else {
      setFavorites(prev => [...prev, product]);
      showToast.addedToFavorites(product.title || product.brand);
    }
  };

  // Проверить, в избранном ли товар
  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  // Подсчёт общего количества товаров
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Подсчёт общей суммы
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = {
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
    favoritesCount: favorites.length
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
