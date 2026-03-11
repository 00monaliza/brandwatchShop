import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';
import { ToastContainer } from './shared/components/ui/Toast';
import Header from './shared/components/layout/Header';
import Footer from './shared/components/layout/Footer';
import RecentlyViewed from './features/catalog/components/RecentlyViewed';
import ResetPasswordModal from './features/auth/components/ResetPasswordModal';
import AdminPanel from './features/admin/components/AdminPanel';
import { supabase } from './services/supabase';
import i18n from './i18n';
import './App.css';

const PARTICLE_COUNT = 12;
const RIPPLE_DURATION_MS = 600;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Мемоизация частиц для фона
  const particles = useMemo(() => 
    [...Array(PARTICLE_COUNT)].map((_, i) => (
      <div key={i} className="particle" />
    )), []
  );

  // Мемоизация callback для открытия админ-панели
  const handleOpenAdmin = useCallback(() => {
    setShowAdminPanel(true);
  }, []);

  // Ripple эффект через делегирование событий (один обработчик на document)
  const createRipple = useCallback((e) => {
    const button = e.target.closest('button, .btn, [role="button"]');
    if (!button) return;

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
    }, RIPPLE_DURATION_MS);
  }, []);

  useEffect(() => {
    // Инициализация i18n
    const savedLanguage = localStorage.getItem('language') || 'ru';
    i18n.changeLanguage(savedLanguage);

    // Слушаем события авторизации для PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Показываем модалку для ввода нового пароля
        setShowResetPasswordModal(true);
      }
    });

    // Проверяем URL (hash или query) на наличие токена восстановления от Supabase
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const type = hashParams.get('type') || queryParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setShowResetPasswordModal(true);
      // Очищаем URL от токенов (оставляем только путь)
      window.history.replaceState(null, '', window.location.pathname || '/');
    }

    // Ripple эффект через делегирование — один обработчик на document
    document.addEventListener('click', createRipple);

    return () => {
      document.removeEventListener('click', createRipple);
      subscription?.unsubscribe();
    };
  }, [createRipple]);

  return (
    <AppProviders>
      <Router>
        <ScrollToTop />
        <div className="app">
          <ToastContainer />
          
          {/* Динамичный фон с частицами и анимированными линиями */}
          <div className="background-animation">
            <div className="light-stripes">
              <div className="light-stripe light-stripe-1"></div>
              <div className="light-stripe light-stripe-2"></div>
              <div className="light-stripe light-stripe-3"></div>
              <div className="light-stripe light-stripe-4"></div>
              <div className="light-stripe light-stripe-5"></div>
              <div className="light-stripe light-stripe-6"></div>
              <div className="light-stripe light-stripe-7"></div>
            </div>
            <div className="animated-lines">
              <div className="line line-h line-h-1"></div>
              <div className="line line-h line-h-2"></div>
              <div className="line line-h line-h-3"></div>
              <div className="line line-h line-h-4"></div>
              <div className="line line-h line-h-5"></div>
              <div className="line line-v line-v-1"></div>
              <div className="line line-v line-v-2"></div>
              <div className="line line-v line-v-3"></div>
              <div className="line line-diag line-diag-1"></div>
              <div className="line line-diag line-diag-2"></div>
              <div className="line line-diag line-diag-3"></div>
              <div className="line line-diag line-diag-4"></div>
            </div>
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
          
          <AppRouter />

          <RecentlyViewed />
          <Footer />

          {showAdminPanel && (
            <AdminPanel onClose={() => setShowAdminPanel(false)} />
          )}

          {showResetPasswordModal && (
            <ResetPasswordModal 
              isOpen={showResetPasswordModal} 
              onClose={() => setShowResetPasswordModal(false)}
              onSuccess={() => setShowResetPasswordModal(false)}
            />
          )}
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
