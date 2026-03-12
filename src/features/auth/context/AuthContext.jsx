import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, auth, db } from '../../../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Получение профиля пользователя из БД
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await db.profiles.get(userId);
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  // Форматирование телефона в единый формат
  const formatPhone = (phone) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('8') && digits.length === 11) {
      return '+7' + digits.slice(1);
    }
    if (!digits.startsWith('7') && digits.length === 10) {
      return '+7' + digits;
    }
    return '+' + digits;
  };

  // Создание профиля пользователя в БД
  const createProfile = async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: profileData.email || '',
          phone: profileData.phone || null,
          first_name: profileData.name || profileData.first_name || '',
          is_admin: false,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error creating profile:', err);
      return null;
    }
  };

  // Инициализация авторизации при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Проверяем сессию Supabase
        const { session } = await auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          // Проверяем localStorage для обратной совместимости
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Если это локальный пользователь (не из Supabase), оставляем его
            if (parsedUser.isLocal) {
              setUser(parsedUser);
              setProfile(parsedUser);
            }
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Слушаем изменения авторизации Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Регистрация нового пользователя через Supabase
  const register = useCallback(async (userData) => {
    const { name, phone, email, password } = userData;
    setAuthError(null);

    try {
      // Проверяем, что email указан (Supabase требует email)
      let userEmail = email;
      if (!email) {
        // Если email не указан, создаём фиктивный на основе телефона
        userEmail = `${phone.replace(/[^0-9]/g, '')}@brandwatch.local`;
      }

      // Регистрация через Supabase Auth
      const { data, error } = await auth.signUp(
        userEmail,
        password,
        {
          name: name,
          phone: phone
        }
      );

      if (error) {
        // Обработка конкретных ошибок
        if (error.message?.includes('already registered')) {
          return { success: false, error: 'emailExists' };
        }
        if (error.message?.includes('invalid email')) {
          return { success: false, error: 'invalidEmail' };
        }
        
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Создаём профиль в таблице profiles
        const formattedPhone = formatPhone(phone);
        const profileData = await createProfile(data.user.id, {
          email: userEmail,
          phone: formattedPhone,
          name: name
        });

        setUser(data.user);
        setProfile(profileData);

        const sessionUser = {
          id: data.user.id,
          email: data.user.email,
          name: name,
          phone: phone,
          role: 'user'
        };

        return { success: true, user: sessionUser };
      }

      return { success: false, error: 'unknownError' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Авторизация пользователя
  const login = useCallback(async (phoneOrEmail, password) => {
    setAuthError(null);

    try {
      const normalizedPhone = phoneOrEmail.replace(/[\s\-()]/g, '');

      // Определяем, это email или телефон
      let email = phoneOrEmail;
      
      // Если это похоже на телефон, пробуем найти пользователя по телефону
      if (/^[+]?[0-9\s\-()]+$/.test(phoneOrEmail)) {
        // Это телефон - ищем пользователя в profiles по телефону
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', normalizedPhone)
          .limit(1);

        if (profiles && profiles.length > 0 && profiles[0].email) {
          email = profiles[0].email;
        } else {
          // Пробуем фиктивный email
          email = `${normalizedPhone}@brandwatch.local`;
        }
      }

      // Вход через Supabase Auth
      const { data, error } = await auth.signIn(email, password);

      if (error) {
        console.error('Supabase login error:', error);
        
        if (error.message?.includes('Invalid login credentials')) {
          return { success: false, error: 'wrongPassword' };
        }
        if (error.message?.includes('Email not confirmed')) {
          return { success: false, error: 'emailNotConfirmed' };
        }
        
        return { success: false, error: 'userNotFound' };
      }

      if (data?.user) {
        // Получаем профиль
        const profileData = await fetchProfile(data.user.id);
        
        setUser(data.user);
        setProfile(profileData);

        const sessionUser = {
          id: data.user.id,
          email: data.user.email,
          name: profileData?.first_name || data.user.user_metadata?.name || '',
          phone: profileData?.phone || data.user.user_metadata?.phone || '',
          role: profileData?.is_admin ? 'admin' : 'user'
        };

        return { success: true, user: sessionUser };
      }

      return { success: false, error: 'userNotFound' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Выход из системы
  const logout = useCallback(async () => {
    // Сначала очищаем локальное состояние
    setUser(null);
    setProfile(null);
    localStorage.removeItem('currentUser');
    
    try {
      // Потом выходим из Supabase
      await auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  // Обновление данных пользователя
  const updateUser = useCallback(async (userData) => {
    try {
      if (user?.id) {
        const { data, error } = await db.profiles.update(user.id, {
          first_name: userData.name || userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          updated_at: new Date().toISOString()
        });

        if (!error && data) {
          setProfile(data);
          return { success: true };
        }
      }
      return { success: false };
    } catch (err) {
      console.error('Update user error:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Обновление профиля пользователя
  const updateProfile = useCallback(async (profileData) => {
    try {
      if (user?.id) {
        const { data, error } = await db.profiles.update(user.id, {
          first_name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.error('Update profile error:', error);
          return { success: false, error: error.message };
        }

        if (data) {
          setProfile(data);
          // Обновляем локальное состояние user
          setUser(prev => ({
            ...prev,
            name: profileData.name || prev.name,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone
          }));
          // Обновляем localStorage
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          localStorage.setItem('currentUser', JSON.stringify({
            ...currentUser,
            name: profileData.name || currentUser.name,
            email: profileData.email || currentUser.email,
            phone: profileData.phone || currentUser.phone
          }));
          return { success: true };
        }
      }
      return { success: false, error: 'User not found' };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Сброс пароля
  const resetPassword = useCallback(async (email) => {
    try {
      const { error } = await auth.resetPassword(email);
      if (error) {
        console.error('Reset password error:', error);
        // Проверяем на ошибку сети
        if (error.message?.includes('Failed to fetch') || error.name === 'AuthRetryableFetchError') {
          return { success: false, error: 'Ошибка сети. Проверьте подключение к интернету.' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('Reset password exception:', err);
      // Проверяем на ошибку сети
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        return { success: false, error: 'Ошибка сети. Проверьте подключение к интернету.' };
      }
      return { success: false, error: err.message };
    }
  }, []);

  // Мемоизация вычисляемых значений
  const isAuthenticated = useMemo(() => !!user, [user]);
  const isAdmin = useMemo(() => profile?.is_admin || user?.role === 'admin', [profile, user]);

  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    authError,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    updateUser,
    updateProfile,
    resetPassword
  }), [user, profile, isLoading, authError, isAuthenticated, isAdmin, register, login, logout, updateUser, updateProfile, resetPassword]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
