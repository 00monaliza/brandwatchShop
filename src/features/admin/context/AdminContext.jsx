import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { supabase, db, toDbProduct } from '../../../services/supabase';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

const normalizePhone = (phone) => {
  return phone.replace(/[\s()-]/g, '');
};

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
  const { user, profile, logout } = useAuth();
  // Список админов (загружается из profiles where is_admin=true)
  const [admins, setAdmins] = useState([]);

  // Текущий авторизованный админ (определяется из auth session + is_admin)
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [products, setProducts] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Настройки магазина
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('adminSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Загрузка товаров и заказов из Supabase
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    const [activeResult, archivedResult] = await Promise.all([
      db.products.getAll(),
      db.products.getArchived(),
    ]);
    if (!activeResult.error) setProducts(activeResult.data ?? []);
    if (!archivedResult.error) setArchivedProducts(archivedResult.data ?? []);
    setProductsLoading(false);
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    const { data, error } = await db.orders.getAll();
    if (!error) setOrders(data ?? []);
    setOrdersLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadProducts, loadOrders]);

  useEffect(() => {
    if (!user?.id) return;
    loadOrders();
    loadAdmins();
  }, [user?.id, loadOrders, loadAdmins]);

  // Загрузка списка админов из Supabase profiles
  const loadAdmins = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, phone, first_name, last_name, is_admin')
      .eq('is_admin', true);
    if (!error && data) {
      setAdmins(data.map(a => ({
        id: a.id,
        name: a.first_name || a.email || '',
        phone: a.phone || '',
        email: a.email || '',
      })));
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
  }, [settings]);

  // Синхронизация с AuthContext — определяем currentAdmin из profile.is_admin
  useEffect(() => {
    if (profile?.is_admin) {
      setCurrentAdmin({
        id: user?.id,
        name: profile.first_name || user?.email || '',
        phone: profile.phone || '',
        email: profile.email || user?.email || '',
      });
    } else {
      setCurrentAdmin(null);
    }
  }, [user, profile]);

  // ========== ТОВАРЫ ==========
  
  // ========== АДМИНИСТРАТОРЫ ==========

  // Проверка, является ли пользователь админом
  const isAdmin = useCallback((phone) => {
    const normalizedPhone = normalizePhone(phone);
    return admins.some(admin => normalizePhone(admin.phone) === normalizedPhone);
  }, [admins]);

  // Вход администратора через Supabase Auth
  const adminLogin = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: 'Неверный email или пароль' };
      }
      // Проверяем is_admin в profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, phone, email, is_admin')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData?.is_admin) {
        await supabase.auth.signOut();
        return { success: false, error: 'У вас нет прав администратора' };
      }

      const admin = {
        id: profileData.id,
        name: profileData.first_name || email,
        phone: profileData.phone || '',
        email: profileData.email || email,
      };
      setCurrentAdmin(admin);
      return { success: true, admin };
    } catch (err) {
      return { success: false, error: 'Ошибка авторизации' };
    }
  }, []);

  // Выход администратора
  const adminLogout = useCallback(() => {
    logout();
    setCurrentAdmin(null);
  }, [logout]);

  // Добавить администратора (установить is_admin=true для существующего пользователя)
  const addAdmin = useCallback(async (adminData) => {
    const { email, phone } = adminData;
    // Ищем пользователя по email или телефону
    let query = supabase.from('profiles').select('id, first_name, phone, email, is_admin');
    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', normalizePhone(phone));
    } else {
      return { success: false, error: 'Укажите email пользователя' };
    }

    const { data: profiles, error } = await query;
    if (error || !profiles || profiles.length === 0) {
      return { success: false, error: 'Пользователь не найден. Он должен сначала зарегистрироваться.' };
    }

    const targetProfile = profiles[0];
    if (targetProfile.is_admin) {
      return { success: false, error: 'Пользователь уже является администратором' };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', targetProfile.id);

    if (updateError) {
      return { success: false, error: 'Ошибка при назначении администратора' };
    }

    const newAdmin = {
      id: targetProfile.id,
      name: targetProfile.first_name || targetProfile.email || '',
      phone: targetProfile.phone || '',
      email: targetProfile.email || '',
    };
    setAdmins(prev => [...prev, newAdmin]);
    return { success: true, admin: newAdmin };
  }, []);

  // Обновить данные администратора
  const updateAdmin = useCallback(async (id, updates) => {
    const dbUpdates = {};
    if (updates.name) dbUpdates.first_name = updates.name;
    if (updates.phone) dbUpdates.phone = normalizePhone(updates.phone);

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      return { success: false, error: 'Ошибка при обновлении данных' };
    }

    setAdmins(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (currentAdmin && currentAdmin.id === id) {
      setCurrentAdmin(prev => ({ ...prev, ...updates }));
    }
    return { success: true };
  }, [currentAdmin]);

  // Удалить администратора (установить is_admin=false)
  const deleteAdmin = useCallback(async (id) => {
    if (admins.length <= 1) {
      return { success: false, error: 'Нельзя удалить последнего администратора' };
    }
    if (currentAdmin && currentAdmin.id === id) {
      return { success: false, error: 'Нельзя удалить свой аккаунт' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', id);

    if (error) {
      return { success: false, error: 'Ошибка при удалении администратора' };
    }

    setAdmins(prev => prev.filter(a => a.id !== id));
    return { success: true };
  }, [admins, currentAdmin]);

  // ========== ТОВАРЫ (продолжение) ==========

  const addProduct = useCallback(async (product) => {
    const { data, error } = await db.products.create(product);
    if (error) throw new Error(error.message);
    setProducts(prev => [data, ...prev]);
    return data;
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    const stock = updates.stock !== undefined ? Number(updates.stock) : undefined;
    if (stock !== undefined && stock <= 0) {
      const { data, error } = await db.products.archive(id);
      if (error) throw new Error(error.message);
      if (data) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setArchivedProducts(prev => [data, ...prev]);
      }
    } else {
      const dbUpdates = toDbProduct({ ...updates });
      const { data, error } = await db.products.update(id, dbUpdates);
      if (error) throw new Error(error.message);
      if (data) setProducts(prev => prev.map(p => p.id === id ? data : p));
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    const { error } = await db.products.delete(id);
    if (error) throw new Error(error.message);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateProductStock = useCallback(async (id, newStock) => {
    if (newStock <= 0) {
      const { data, error } = await db.products.archive(id);
      if (error) throw new Error(error.message);
      if (data) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setArchivedProducts(prev => [data, ...prev]);
      }
    } else {
      const { data, error } = await db.products.update(id, {
        stock_quantity: newStock,
        in_stock: newStock > 0,
      });
      if (error) throw new Error(error.message);
      if (data) setProducts(prev => prev.map(p => p.id === id ? data : p));
    }
  }, []);

  const restoreFromArchive = useCallback(async (id, newStock = 5) => {
    const { data, error } = await db.products.restore(id, newStock);
    if (error) throw new Error(error.message);
    if (data) {
      setArchivedProducts(prev => prev.filter(p => p.id !== id));
      setProducts(prev => [data, ...prev]);
    }
  }, []);

  const deleteFromArchive = useCallback(async (id) => {
    const { error } = await db.products.delete(id);
    if (error) throw new Error(error.message);
    setArchivedProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Установить скидку (сохраняет в Supabase)
  const setProductDiscount = useCallback(async (id, discount) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const oldPrice = product.oldPrice || product.price;
    const newPrice = Math.round(oldPrice * (1 - discount / 100));

    // Оптимистичное обновление UI
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          discount,
          oldPrice: discount > 0 ? oldPrice : null,
          price: discount > 0 ? newPrice : oldPrice
        };
      }
      return p;
    }));

    // Сохраняем в Supabase
    await db.products.update(id, {
      price: discount > 0 ? newPrice : oldPrice,
      old_price: discount > 0 ? oldPrice : null,
    });
  }, [products]);

  // ========== ЗАКАЗЫ ==========

  const addOrder = useCallback(async (orderData) => {
    const { data, error } = await db.orders.create(orderData);
    if (error) throw new Error(error.message);

    setOrders(prev => [data, ...prev]);

    // Уменьшаем сток в Supabase и обновляем локальный стейт
    for (const item of (orderData.items || [])) {
      const { data: updated } = await db.products.decrementStock(item.id, item.quantity);
      if (updated) {
        if (updated.stock === 0) {
          await db.products.archive(item.id);
          setProducts(prev => prev.filter(p => p.id !== item.id));
          setArchivedProducts(prev => [{ ...updated, isArchived: true }, ...prev]);
        } else {
          setProducts(prev => prev.map(p => p.id === item.id ? updated : p));
        }
      }
    }

    return data;
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    const { data, error } = await db.orders.updateStatus(id, status);
    if (error) throw new Error(error.message);
    if (data) setOrders(prev => prev.map(o => o.id === id ? data : o));
  }, []);

  const updateOrderTracking = useCallback(async (id, trackingUrl) => {
    const { data, error } = await db.orders.updateTracking(id, trackingUrl);
    if (error) throw new Error(error.message);
    if (data) setOrders(prev => prev.map(o => o.id === id ? data : o));

    // Отправить уведомления через Edge Function
    try {
      await supabase.functions.invoke('notify-tracking', {
        body: { orderId: id, trackingUrl }
      });
    } catch (funcError) {
      console.error('Edge function error:', funcError);
    }

    return data;
  }, []);

  const deleteOrder = useCallback(async (id) => {
    const { error } = await db.orders.delete(id);
    if (error) throw new Error(error.message);
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  // ========== НАСТРОЙКИ ==========
  
  // Обновить настройки
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Обновить способ оплаты
  const updatePaymentMethod = useCallback((id, updates) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(pm =>
        pm.id === id ? { ...pm, ...updates } : pm
      )
    }));
  }, []);

  // Добавить способ оплаты
  const addPaymentMethod = useCallback((method) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, { ...method, id: Date.now() }]
    }));
  }, []);

  // Удалить способ оплаты
  const deletePaymentMethod = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id)
    }));
  }, []);

  // ========== СТАТИСТИКА ==========
  
  const getStatistics = useCallback(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    
    // Выручка считается по доставленным заказам
    const completedStatuses = ['completed', 'delivered'];
    const totalRevenue = orders
      .filter(o => completedStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Ожидающие обработки
    const pendingStatuses = ['new', 'pending', 'processing'];
    const pendingOrders = orders.filter(o => pendingStatuses.includes(o.status)).length;
    
    // Завершенные заказы
    const completedOrders = orders.filter(o => completedStatuses.includes(o.status)).length;
    
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
        revenue: dayOrders
          .filter(o => completedStatuses.includes(o.status))
          .reduce((sum, o) => sum + (o.total || 0), 0)
      });
    }

    // Топ товары (по всем заказам, не только завершенным)
    const productSales = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const itemId = item.id || item.title;
        if (!productSales[itemId]) {
          productSales[itemId] = { 
            id: item.id,
            brand: item.brand,
            title: item.title,
            image: item.image,
            totalSold: 0, 
            totalRevenue: 0 
          };
        }
        productSales[itemId].totalSold += item.quantity || 1;
        productSales[itemId].totalRevenue += (item.price || 0) * (item.quantity || 1);
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
      archivedCount: archivedProducts.length,
      last7Days,
      topProducts
    };
  }, [products, orders, archivedProducts]);

  const value = useMemo(() => ({
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
    archivedProducts,
    orders,
    settings,
    productsLoading,
    ordersLoading,
    loadProducts,
    loadOrders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    restoreFromArchive,
    deleteFromArchive,
    setProductDiscount,
    addOrder,
    updateOrderStatus,
    updateOrderTracking,
    deleteOrder,
    updateSettings,
    updatePaymentMethod,
    addPaymentMethod,
    deletePaymentMethod,
    getStatistics
  }), [admins, currentAdmin, products, archivedProducts, orders, settings, productsLoading, ordersLoading, loadProducts, loadOrders, loadAdmins, isAdmin, adminLogin, adminLogout, addAdmin, updateAdmin, deleteAdmin, addProduct, updateProduct, deleteProduct, updateProductStock, restoreFromArchive, deleteFromArchive, setProductDiscount, addOrder, updateOrderStatus, updateOrderTracking, deleteOrder, updateSettings, updatePaymentMethod, addPaymentMethod, deletePaymentMethod, getStatistics]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
