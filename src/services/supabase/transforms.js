/**
 * Нормализация данных из БД (snake_case → camelCase)
 */

const isValidUUID = (id) => {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const normalizeProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    title: p.title ?? p.name ?? '',
    originalPrice: p.original_price ?? p.old_price ?? p.originalPrice ?? null,
    originalPriceInKZT: p.original_price ?? p.old_price ?? p.originalPriceInKZT ?? null,
    oldPrice: p.old_price ?? p.original_price ?? null,
    stock: p.stock_quantity ?? p.stock ?? 5,
    isArchived: p.is_archived ?? false,
    archivedAt: p.archived_at ?? null,
    priceInKZT: p.price_in_kzt ?? p.price ?? 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

export const normalizeOrder = (o) => {
  if (!o) return o;
  return {
    ...o,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    userId: o.user_id,
    paymentMethod: o.payment_method,
    cardLast4: o.card_last4,
    totalInKZT: o.total_in_kzt ?? o.total,
  };
};

export const toDbProduct = (p) => ({
  // Keep backward compatibility with older RU values in admin form/state.
  // DB constraint allows only men|women|unisex.
  gender: (() => {
    const value = (p.gender || '').toString().toLowerCase();
    if (value === 'men' || value === 'мужские') return 'men';
    if (value === 'women' || value === 'женские') return 'women';
    return 'unisex';
  })(),
  brand: p.brand,
  name: p.title ?? p.name,
  price: p.priceInKZT ?? p.price,
  old_price: p.originalPrice ?? p.oldPrice ?? null,
  stock_quantity: p.stock ?? 5,
  in_stock: (p.stock ?? 5) > 0,
  images: Array.isArray(p.images) ? p.images : [],
  category: p.category ?? '',
  description: p.description ?? '',
});

export const toDbOrder = (o) => ({
  user_id: isValidUUID(o.userId) ? o.userId : null,
  customer: o.customer,
  items: o.items,
  total: o.total,
  total_in_kzt: o.totalInKZT ?? o.total,
  payment_method: o.paymentMethod ?? null,
  card_last4: o.cardLast4 ?? null,
  comment: o.comment ?? null,
  status: o.status ?? 'pending',
});
