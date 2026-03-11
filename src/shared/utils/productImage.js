export const getProductImage = (product, index = 0) => {
  if (!product) return '';
  
  // Новый формат: массив images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const image = product.images[index] || product.images[0];
    // Если это объект с url, извлекаем url
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    // Если это строка
    if (typeof image === 'string') {
      return image;
    }
  }
  
  // Старый формат: image (строка)
  if (product.image && typeof product.image === 'string') {
    return product.image;
  }
  
  return '';
};

export const getProductImages = (product) => {
  if (!product) return [];
  
  // Новый формат: массив images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images.map(img => {
      if (typeof img === 'object' && img.url) {
        return img.url;
      }
      if (typeof img === 'string') {
        return img;
      }
      return '';
    }).filter(Boolean);
  }
  
  if (product.image && typeof product.image === 'string') {
    return [product.image];
  }
  
  return [];
};
