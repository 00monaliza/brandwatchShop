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
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
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

// Storage helpers
export const storage = {
  uploadProductImage: async (file, productId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
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
  }
};

export default supabase;
