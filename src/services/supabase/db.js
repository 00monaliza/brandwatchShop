import { supabase } from './client';
import { normalizeProduct, normalizeOrder, toDbProduct, toDbOrder } from './transforms';

export const db = {
  products: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      query = query.eq('is_archived', false);

      if (filters.brand) query = query.eq('brand', filters.brand);
      if (filters.gender) query = query.eq('gender', filters.gender);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.isNew) query = query.eq('is_new', true);
      if (filters.inStock) query = query.eq('in_stock', true);
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      return { data: data?.map(normalizeProduct) ?? null, error };
    },

    getArchived: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_archived', true)
        .order('archived_at', { ascending: false });
      return { data: data?.map(normalizeProduct) ?? null, error };
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      return { data: normalizeProduct(data), error };
    },

    create: async (product) => {
      const { data, error } = await supabase
        .from('products')
        .insert(toDbProduct(product))
        .select()
        .single();
      return { data: normalizeProduct(data), error };
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data: normalizeProduct(data), error };
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      return { error };
    },

    archive: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: 0, in_stock: false, is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data: normalizeProduct(data), error };
    },

    restore: async (id, stockQuantity = 5) => {
      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: stockQuantity, in_stock: true, is_archived: false, archived_at: null })
        .eq('id', id)
        .select()
        .single();
      return { data: normalizeProduct(data), error };
    },

    decrementStock: async (productId, quantity = 1) => {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (fetchError) return { error: fetchError };

      const newStock = Math.max(0, (product.stock_quantity || 0) - quantity);

      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock, in_stock: newStock > 0 })
        .eq('id', productId)
        .select()
        .single();

      return { data: normalizeProduct(data), error };
    }
  },

  orders: {
    getAll: async (userId = null) => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) query = query.eq('user_id', userId);

      const { data, error } = await query;
      return { data: data?.map(normalizeOrder) ?? null, error };
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      return { data: normalizeOrder(data), error };
    },

    create: async (order) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(toDbOrder(order))
        .select()
        .single();
      return { data: normalizeOrder(data), error };
    },

    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();
      return { data: normalizeOrder(data), error };
    },

    updateTracking: async (id, trackingUrl) => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          tracking_url: trackingUrl,
          tracking_added_at: new Date().toISOString(),
          status: 'shipped',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .maybeSingle();
      return { data: normalizeOrder(data), error };
    },

    delete: async (id) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      return { error };
    }
  },

  favorites: {
    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`*, products (*)`)
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

  cart: {
    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`*, products (*)`)
        .eq('user_id', userId);
      return { data, error };
    },

    addItem: async (userId, productId, quantity = 1) => {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();
        return { data, error };
      } else {
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
