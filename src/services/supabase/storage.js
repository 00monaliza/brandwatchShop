import { supabase } from './client';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const storage = {
  uploadProductImage: async (file, fileName, admin = null) => {
    let filePath;
    if (typeof fileName === 'string') {
      filePath = fileName;
    } else {
      const fileExt = file.name.split('.').pop();
      const productIdStr = String(fileName || 'temp');
      filePath = `${productIdStr}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { url: null, path: null, error: { message: 'Неподдерживаемый тип файла' } };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { url: null, path: null, error: { message: 'Файл слишком большой (максимум 20 МБ)' } };
    }

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      return { url: null, path: null, error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath, error: null };
  },

  uploadProductImages: async (files, productId) => {
    const results = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const result = await storage.uploadProductImage(file, fileName);
      if (result.error) continue;

      results.push({ url: result.url, path: result.path });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  },

  deleteProductImage: async (path) => {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);
    return { error };
  },

  deleteProductImages: async (paths) => {
    if (!paths || paths.length === 0) return { error: null };
    const { error } = await supabase.storage
      .from('product-images')
      .remove(paths);
    return { error };
  },

  uploadStoreLogo: async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `store-logo-${Date.now()}.${fileExt}`;

    const { data: existingFiles } = await supabase.storage
      .from('store-assets')
      .list('', { search: 'store-logo' });

    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => f.name);
      await supabase.storage.from('store-assets').remove(filesToRemove);
    }

    const { error } = await supabase.storage
      .from('store-assets')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) return { url: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  },

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
