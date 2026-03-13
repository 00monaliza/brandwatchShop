export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: '/product/:id',
  CART: '/cart',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  ABOUT: '/about',
  CONTACTS: '/contacts',
  SALES: '/sales',
  PREMIUM: '/premium',
  RESET_PASSWORD: '/reset-password',
  ORDER_TRACKING: '/orders/:id',
};

export const getProductRoute = (id) => `/product/${id}`;
export const getOrderRoute = (id) => `/orders/${id}`;
