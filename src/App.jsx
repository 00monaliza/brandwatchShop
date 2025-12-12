import React, { useEffect, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MagicNavigation from './components/MagicNavigation';
import RecentlyViewed from './components/RecentlyViewed';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import AdminPanel from './components/admin/AdminPanel';
import Premium from './pages/Premium';
import i18n from './i18n';
import './App.css';

function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Ripple эффект для всех кнопок
  const createRipple = useCallback((e) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'ripple';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  useEffect(() => {
    // Инициализация i18n
    const savedLanguage = localStorage.getItem('language') || 'ru';
    i18n.changeLanguage(savedLanguage);

    // Ripple эффект на все кнопки
    const addRippleToButtons = () => {
      const buttons = document.querySelectorAll('button, .btn, [role="button"]');
      buttons.forEach(button => {
        button.removeEventListener('click', createRipple);
        button.addEventListener('click', createRipple);
      });
    };

    // Наблюдатель за DOM для новых кнопок
    const observer = new MutationObserver(() => {
      addRippleToButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    addRippleToButtons();

    return () => {
      observer.disconnect();
    };
  }, [createRipple]);

  return (
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <Router>
            <div className="app">
              {/* Динамичный фон с частицами */}
              <div className="background-animation">
                {/* Floating Particles */}
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="particle" />
                ))}
                <div className="clock clock-1"></div>
                <div className="clock clock-2"></div>
                <div className="clock clock-3"></div>
                <div className="clock clock-4"></div>
                <div className="time-line time-line-1"></div>
                <div className="time-line time-line-2"></div>
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
                <div className="floating-circle circle-3"></div>
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
              </div>

              <Header onOpenAdmin={() => setShowAdminPanel(true)} />
              
              <Routes>
                <Route path="/" element={<Navigate to="/catalog" replace />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="*" element={<Navigate to="/catalog" replace />} />
              </Routes>

              <RecentlyViewed />
              <Footer />
              
              {/* Magic Navigation Menu */}
              <MagicNavigation />

              {/* Admin Panel */}
              {showAdminPanel && (
                <AdminPanel onClose={() => setShowAdminPanel(false)} />
              )}
            </div>
          </Router>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
