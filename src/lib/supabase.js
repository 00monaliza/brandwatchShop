import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mkobqocdntxvizfvzkpo.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2Jxb2NkbnR4dml6ZnZ6a3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjEyNDgsImV4cCI6MjA4MDc5NzI0OH0.ITZnCQTlikMUFev488Q8etVH_l7ea3Gro6MksIwKLG4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  // Регистрация
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Вход
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Выход
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Получить текущего пользователя
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Получить сессию
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Сброс пароля
  resetPassword: async (email) => {
    // Определяем URL для редиректа в зависимости от окружения
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/reset-password`
      : 'https://brandwatch.kz/reset-password';
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    console.log('Reset password response:', { data, error, redirectUrl });
    return { data, error };
  },

  // Обновить пароль
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  },

  // Слушатель изменений авторизации
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const db = {
  // Products
  products: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.isNew) {
        query = query.eq('is_new', true);
      }
      if (filters.inStock) {
        query = query.eq('in_stock', true);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      return { data, error };
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    create: async (product) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      return { data, error };
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Orders
  orders: {
    getAll: async (userId = null) => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      return { data, error };
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    create: async (order) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      return { data, error };
    },

    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // Favorites
  favorites: {
    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId);
      return { data, error };
    },

    add: async (userId, productId) => {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single();
      return { data, error };
    },

    remove: async (userId, productId) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      return { error };
    },

    check: async (userId, productId) => {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
      return { isFavorite: !!data, error };
    }
  },

  // Cart
  cart: {
    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId);
      return { data, error };
    },

    addItem: async (userId, productId, quantity = 1) => {
      // Check if item exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();
        return { data, error };
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ user_id: userId, product_id: productId, quantity })
          .select()
          .single();
        return { data, error };
      }
    },

    updateQuantity: async (id, quantity) => {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    removeItem: async (id) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
      return { error };
    },

    clear: async (userId) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      return { error };
    }
  },

  // User profiles
  profiles: {
    get: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  }
};

// Store Settings helpers
export const storeSettings = {
  // Получить настройки магазина
  get: async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return { 
        data: {
          id: 1,
          store_name: 'brandwatch',
          currency: '$',
          whatsapp: '+77778115151',
          telegram: '@baikadamov_a',
          email: 'info@brandwatch.kz',
          instagram: 'https://www.instagram.com/brandwatch.kz/',
          address: '',
          working_hours: '',
          payment_methods: [
            { id: 1, name: 'Kaspi', enabled: true },
            { id: 2, name: 'Карта', enabled: true },
            // { id: 3, name: 'Наличные', enabled: true }
          ],
          notifications: {
            telegramBotToken: '',
            telegramChatId: '',
            onNewOrder: true,
            onOrderStatusChange: false,
            onLowStock: false
          }
        }, 
        error: null 
      };
    }
    
    return { data, error };
  },

  // Обновить настройки магазина
  update: async (updates) => {
    // Преобразуем camelCase в snake_case для Supabase
    const dbUpdates = {};
    
    if (updates.storeName !== undefined) dbUpdates.store_name = updates.storeName;
    if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.contacts?.whatsapp !== undefined) dbUpdates.whatsapp = updates.contacts.whatsapp;
    if (updates.contacts?.telegram !== undefined) dbUpdates.telegram = updates.contacts.telegram;
    if (updates.contacts?.email !== undefined) dbUpdates.email = updates.contacts.email;
    if (updates.contacts?.address !== undefined) dbUpdates.address = updates.contacts.address;
    if (updates.contacts?.workingHours !== undefined) dbUpdates.working_hours = updates.contacts.workingHours;
    if (updates.contacts?.instagram !== undefined) dbUpdates.instagram = updates.contacts.instagram;
    if (updates.paymentMethods !== undefined) dbUpdates.payment_methods = updates.paymentMethods;
    if (updates.bankDetails !== undefined) dbUpdates.bank_details = updates.bankDetails;
    if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;

    const { data, error } = await supabase
      .from('store_settings')
      .upsert({ id: 1, ...dbUpdates })
      .select()
      .single();
    
    return { data, error };
  },

  // Подписка на изменения настроек (real-time)
  subscribe: (callback) => {
    const subscription = supabase
      .channel('store_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
    
    return subscription;
  },

  // Отписаться от изменений
  unsubscribe: (subscription) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};

// Storage helpers
export const storage = {
  uploadProductImage: async (file, productId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) return { url: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  },

  deleteProductImage: async (path) => {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);
    return { error };
  },

  // Загрузка логотипа магазина
  uploadStoreLogo: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `store-logo-${Date.now()}.${fileExt}`;
    
    // Удаляем старые логотипы
    const { data: existingFiles } = await supabase.storage
      .from('store-assets')
      .list('', { search: 'store-logo' });
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => f.name);
      await supabase.storage
        .from('store-assets')
        .remove(filesToRemove);
    }
    
    const { error } = await supabase.storage
      .from('store-assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) return { url: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  },

  // Удаление логотипа магазина
  deleteStoreLogo: async () => {
    const { data: existingFiles } = await supabase.storage
      .from('store-assets')
      .list('', { search: 'store-logo' });
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => f.name);
      const { error } = await supabase.storage
        .from('store-assets')
        .remove(filesToRemove);
      return { error };
    }
    return { error: null };
  }
};

export default supabase;
