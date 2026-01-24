import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastContainer } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import RecentlyViewed from './components/RecentlyViewed';
import ResetPasswordModal from './components/ResetPasswordModal';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import About from './pages/About';
import Contacts from './pages/Contacts';
import Sales from './pages/Sales';
import AdminPanel from './components/admin/AdminPanel';
import Premium from './pages/Premium';
import { supabase } from './lib/supabase';
import i18n from './i18n';
import './App.css';

function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Мемоизация частиц для фона
  const particles = useMemo(() => 
    [...Array(12)].map((_, i) => (
      <div key={i} className="particle" />
    )), []
  );

  // Мемоизация callback для открытия админ-панели
  const handleOpenAdmin = useCallback(() => {
    setShowAdminPanel(true);
  }, []);

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

    // Слушаем события авторизации для PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'PASSWORD_RECOVERY') {
        // Показываем модалку для ввода нового пароля
        setShowResetPasswordModal(true);
      }
    });

    // Проверяем URL hash на наличие токена восстановления
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      // Устанавливаем сессию с токеном и показываем модалку
      setShowResetPasswordModal(true);
      // Очищаем URL от токенов
      window.history.replaceState(null, '', window.location.pathname);
    }

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
      subscription?.unsubscribe();
    };
  }, [createRipple]);

  return (
    <AuthProvider>
      <AdminProvider>
        <SettingsProvider>
          <CartProvider>
            <Router>
              <div className="app">
              {/* Toast Container */}
              <ToastContainer />
              
              {/* Динамичный фон с частицами */}
              <div className="background-animation">
                {/* Floating Particles */}
                {particles}
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

              <Header onOpenAdmin={handleOpenAdmin} />
              
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/reset-password" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <RecentlyViewed />
              <Footer />

                {/* Admin Panel */}
                {showAdminPanel && (
                  <AdminPanel onClose={() => setShowAdminPanel(false)} />
                )}

                {/* Reset Password Modal */}
                {showResetPasswordModal && (
                  <ResetPasswordModal 
                    isOpen={showResetPasswordModal} 
                    onClose={() => setShowResetPasswordModal(false)}
                    onSuccess={() => setShowResetPasswordModal(false)}
                  />
                )}
              </div>
            </Router>
          </CartProvider>
        </SettingsProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
