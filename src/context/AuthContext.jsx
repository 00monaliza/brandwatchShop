import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, auth, db } from '../lib/supabase';
import { defaultAdmins } from '../data/admins';

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

  // Создание профиля пользователя в БД
  const createProfile = async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: profileData.email || '',
          phone: profileData.phone || '',
          first_name: profileData.name || profileData.first_name || '',
          last_name: profileData.last_name || '',
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      console.log('Auth state changed:', event);
      
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
  const register = async (userData) => {
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
        console.error('Supabase signup error:', error);
        
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
        const profileData = await createProfile(data.user.id, {
          email: userEmail,
          phone: phone,
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
  };

  // Авторизация пользователя
  const login = async (phoneOrEmail, password) => {
    setAuthError(null);

    try {
      // 1. Сначала проверяем локальных админов
      const savedAdmins = localStorage.getItem('adminUsers');
      const admins = savedAdmins ? JSON.parse(savedAdmins) : defaultAdmins;
      
      const normalizedPhone = phoneOrEmail.replace(/[\s\-()]/g, '');
      const admin = admins.find(a => 
        (a.phone && a.phone.replace(/[\s\-()]/g, '') === normalizedPhone && a.password === password) ||
        (a.email && a.email.toLowerCase() === phoneOrEmail.toLowerCase() && a.password === password)
      );

      if (admin) {
        const sessionUser = { 
          ...admin, 
          role: 'admin',
          isLocal: true
        };
        
        setUser(sessionUser);
        setProfile(sessionUser);
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
      }

      // 2. Попробуем войти через Supabase
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
  };

  // Выход из системы
  const logout = async () => {
    try {
      // Выход из Supabase
      await auth.signOut();
      
      // Очистка локального состояния
      setUser(null);
      setProfile(null);
      localStorage.removeItem('currentUser');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Обновление данных пользователя
  const updateUser = async (userData) => {
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
  };

  // Сброс пароля
  const resetPassword = async (email) => {
    try {
      const { error } = await auth.resetPassword(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    authError,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin || user?.role === 'admin',
    register,
    login,
    logout,
    updateUser,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
