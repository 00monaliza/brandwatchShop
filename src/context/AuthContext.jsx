import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultAdmins } from '../data/admins';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Функции для работы с базой пользователей (localStorage)
const getUsers = () => {
  const users = localStorage.getItem('registeredUsers');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
};

const findUserByPhone = (phone) => {
  const users = getUsers();
  const normalizedPhone = phone.replace(/[\s\-()]/g, '');
  return users.find(user => user.phone.replace(/[\s\-()]/g, '') === normalizedPhone);
};

const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email && user.email.toLowerCase() === email.toLowerCase());
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненного пользователя (текущую сессию)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Регистрация нового пользователя
  const register = (userData) => {
    const { name, phone, email, password } = userData;
    
    // Проверяем, существует ли пользователь
    if (findUserByPhone(phone)) {
      return { success: false, error: 'phoneExists' };
    }
    
    if (email && findUserByEmail(email)) {
      return { success: false, error: 'emailExists' };
    }

    // Создаем нового пользователя
    const newUser = {
      id: Date.now(),
      name,
      phone: phone.replace(/[\s\-()]/g, ''),
      email: email || '',
      password, // В реальном проекте нужно хешировать!
      createdAt: new Date().toISOString()
    };

    // Сохраняем в базу
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);

    // Авторизуем пользователя
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  };

  // Авторизация пользователя
  const login = (phone, password) => {
    // 1. Сначала проверяем админов
    const savedAdmins = localStorage.getItem('adminUsers');
    const admins = savedAdmins ? JSON.parse(savedAdmins) : defaultAdmins;
    
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');
    const admin = admins.find(a => a.phone.replace(/[\s\-()]/g, '') === normalizedPhone && a.password === password);

    if (admin) {
      const sessionUser = { ...admin, role: 'admin' };
      // Не удаляем пароль для админа, так как он может понадобиться для проверок в админке
      // Но для безопасности лучше удалить. AdminContext должен доверять AuthContext.
      // delete sessionUser.password; 
      
      setUser(sessionUser);
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }

    // 2. Если не админ, проверяем обычных пользователей
    const foundUser = findUserByPhone(phone);
    
    if (!foundUser) {
      return { success: false, error: 'userNotFound' };
    }

    if (foundUser.password !== password) {
      return { success: false, error: 'wrongPassword' };
    }

    // Успешная авторизация
    const sessionUser = { ...foundUser, role: 'user' };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem('currentUser', JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  };

  // Выход из системы
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Обновление данных пользователя
  const updateUser = (userData) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...userData };
      saveUsers(users);
      
      const sessionUser = { ...users[userIndex] };
      delete sessionUser.password;
      setUser(sessionUser);
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
