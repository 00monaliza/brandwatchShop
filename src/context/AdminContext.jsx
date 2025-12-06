import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { products as initialProducts } from '../data/products';
import { defaultAdmins } from '../data/admins';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Нормализация номера телефона (удаление пробелов и оставление только цифр и +)
const normalizePhone = (phone) => {
  return phone.replace(/[\s()-]/g, '');
};

// Начальные настройки магазина
const defaultSettings = {
  logo: null,
  storeName: 'brandwatch',
  whatsapp: '+77778115151',
  telegram: '@baikadamov_a',
  paymentMethods: [
    { id: 1, name: 'Kaspi', enabled: true, details: '' },
    { id: 2, name: 'Карта', enabled: true, details: '' },
    { id: 3, name: 'Наличные', enabled: true, details: '' }
  ],
  currency: '$'
};

export const AdminProvider = ({ children }) => {
  const { user, logout } = useAuth();
  // Администраторы
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('adminUsers');
    return saved ? JSON.parse(saved) : defaultAdmins;
  });

  // Текущий авторизованный админ
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const saved = localStorage.getItem('currentAdmin');
    return saved ? JSON.parse(saved) : null;
  });

  // Товары
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('adminProducts');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Заказы
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('adminOrders');
    return saved ? JSON.parse(saved) : [];
  });

  // Настройки магазина
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('adminSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Сохранение в localStorage
  useEffect(() => {
    localStorage.setItem('adminUsers', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('currentAdmin');
    }
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem('adminProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('adminOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
  }, [settings]);

  // Синхронизация с AuthContext
  useEffect(() => {
    if (user && user.role === 'admin') {
      // Проверяем, есть ли такой админ в списке (на всякий случай)
      const normalizedPhone = normalizePhone(user.phone);
      const isAdminUser = admins.some(a => normalizePhone(a.phone) === normalizedPhone);
      
      if (isAdminUser) {
        setCurrentAdmin(user);
      } else {
        setCurrentAdmin(null);
      }
    } else {
      setCurrentAdmin(null);
    }
  }, [user, admins]);

  // ========== ТОВАРЫ ==========
  
  // ========== АДМИНИСТРАТОРЫ ==========
  
  // Проверка, является ли пользователь админом
  const isAdmin = (phone) => {
    const normalizedPhone = normalizePhone(phone);
    return admins.some(admin => normalizePhone(admin.phone) === normalizedPhone);
  };

  // Вход администратора
  const adminLogin = (phone, password) => {
    const normalizedPhone = normalizePhone(phone);
    const admin = admins.find(a => 
      normalizePhone(a.phone) === normalizedPhone && a.password === password
    );
    if (admin) {
      setCurrentAdmin(admin);
      return { success: true, admin };
    }
    return { success: false, error: 'Неверный номер или пароль' };
  };

  // Выход администратора
  const adminLogout = () => {
    logout();
    setCurrentAdmin(null);
  };

  // Добавить администратора
  const addAdmin = (adminData) => {
    const normalizedPhone = normalizePhone(adminData.phone);
    // Проверка на существование
    if (admins.some(a => normalizePhone(a.phone) === normalizedPhone)) {
      return { success: false, error: 'Администратор с таким номером уже существует' };
    }
    const newAdmin = {
      ...adminData,
      phone: normalizedPhone,
      id: Date.now()
    };
    setAdmins(prev => [...prev, newAdmin]);
    return { success: true, admin: newAdmin };
  };

  // Обновить данные администратора
  const updateAdmin = (id, updates) => {
    if (updates.phone) {
      updates.phone = normalizePhone(updates.phone);
      // Проверка на дублирование номера
      const exists = admins.some(a => a.id !== id && normalizePhone(a.phone) === updates.phone);
      if (exists) {
        return { success: false, error: 'Этот номер уже используется другим администратором' };
      }
    }
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    // Обновляем текущего админа если это он
    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdmin(prev => ({ ...prev, ...updates }));
    }
    return { success: true };
  };

  // Удалить администратора
  const deleteAdmin = (id) => {
    // Нельзя удалить последнего админа
    if (admins.length <= 1) {
      return { success: false, error: 'Нельзя удалить последнего администратора' };
    }
    // Нельзя удалить себя
    if (currentAdmin && currentAdmin.id === id) {
      return { success: false, error: 'Нельзя удалить свой аккаунт' };
    }
    setAdmins(prev => prev.filter(a => a.id !== id));
    return { success: true };
  };

  // ========== ТОВАРЫ (продолжение) ==========
  
  // Добавить товар
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  // Обновить товар
  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  };

  // Удалить товар
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Установить скидку
  const setProductDiscount = (id, discount) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const oldPrice = p.oldPrice || p.price;
        const newPrice = Math.round(oldPrice * (1 - discount / 100));
        return { 
          ...p, 
          discount, 
          oldPrice: discount > 0 ? oldPrice : null,
          price: discount > 0 ? newPrice : oldPrice
        };
      }
      return p;
    }));
  };

  // ========== ЗАКАЗЫ ==========
  
  // Добавить заказ
  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: Date.now(),
      status: 'new',
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // Обновить статус заказа
  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => 
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ));
  };

  // Удалить заказ
  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // ========== НАСТРОЙКИ ==========
  
  // Обновить настройки
  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Обновить способ оплаты
  const updatePaymentMethod = (id, updates) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(pm =>
        pm.id === id ? { ...pm, ...updates } : pm
      )
    }));
  };

  // Добавить способ оплаты
  const addPaymentMethod = (method) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, { ...method, id: Date.now() }]
    }));
  };

  // Удалить способ оплаты
  const deletePaymentMethod = (id) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id)
    }));
  };

  // ========== СТАТИСТИКА ==========
  
  const getStatistics = () => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'processing').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    // Заказы за последние 7 дней
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => 
        o.createdAt && o.createdAt.startsWith(dateStr)
      );
      last7Days.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      });
    }

    // Топ товары
    const productSales = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { ...item, totalSold: 0, totalRevenue: 0 };
        }
        productSales[item.id].totalSold += item.quantity || 1;
        productSales[item.id].totalRevenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      last7Days,
      topProducts
    };
  };

  const value = {
    // Администраторы
    admins,
    currentAdmin,
    isAdmin,
    adminLogin,
    adminLogout,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    // Товары
    products,
    orders,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    setProductDiscount,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    updateSettings,
    updatePaymentMethod,
    addPaymentMethod,
    deletePaymentMethod,
    getStatistics
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
