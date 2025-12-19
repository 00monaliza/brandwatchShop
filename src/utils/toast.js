// Toast notification utilities
import { addToast } from '../components/Toast';
import i18n from '../i18n';

// Helper function to get translation
const t = (key) => i18n.t(key);

// Типы уведомлений для пользователей
export const showToast = {
  // Корзина
  addedToCart: (productName) => {
    addToast({
      title: t('toast.addedToCart'),
      description: productName ? `${productName} ${t('toast.addedToCartDesc')}` : t('toast.productAddedToCart'),
      color: 'success',
      timeout: 3000,
    });
  },

  removedFromCart: (productName) => {
    addToast({
      title: t('toast.removedFromCart'),
      description: productName ? `${productName} ${t('toast.removedFromCartDesc')}` : t('toast.productRemovedFromCart'),
      color: 'warning',
      timeout: 3000,
    });
  },

  cartCleared: () => {
    addToast({
      title: t('toast.cartCleared'),
      description: t('toast.cartClearedDesc'),
      color: 'warning',
      timeout: 3000,
    });
  },

  // Избранное
  addedToFavorites: (productName) => {
    addToast({
      title: t('toast.addedToFavorites'),
      description: productName ? `${productName} ${t('toast.addedToFavoritesDesc')}` : t('toast.productAddedToFavorites'),
      color: 'success',
      timeout: 3000,
    });
  },

  removedFromFavorites: (productName) => {
    addToast({
      title: t('toast.removedFromFavorites'),
      description: productName ? `${productName} ${t('toast.removedFromFavoritesDesc')}` : t('toast.productRemovedFromFavorites'),
      color: 'warning',
      timeout: 3000,
    });
  },

  // Заказы
  orderPlaced: (orderId) => {
    addToast({
      title: t('toast.orderPlaced'),
      description: orderId ? `#${orderId} ${t('toast.orderPlacedDesc')}` : t('toast.orderSuccess'),
      color: 'success',
      timeout: 5000,
    });
  },

  orderPaid: () => {
    addToast({
      title: t('toast.orderPaid'),
      description: t('toast.orderPaidDesc'),
      color: 'success',
      timeout: 5000,
    });
  },

  // Ошибки
  error: (message) => {
    addToast({
      title: t('toast.error'),
      description: message || t('toast.errorDefault'),
      color: 'danger',
      timeout: 4000,
    });
  },

  // Авторизация
  loginSuccess: (userName) => {
    addToast({
      title: t('toast.loginSuccess'),
      description: userName ? `${t('toast.loginSuccessDesc')}, ${userName}` : t('toast.loginSuccessDefault'),
      color: 'success',
      timeout: 3000,
    });
  },

  logoutSuccess: () => {
    addToast({
      title: t('toast.logoutSuccess'),
      description: t('toast.logoutSuccessDesc'),
      color: 'primary',
      timeout: 3000,
    });
  },

  registrationSuccess: () => {
    addToast({
      title: t('toast.registrationSuccess'),
      description: t('toast.registrationSuccessDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  // Общие
  info: (title, description) => {
    addToast({
      title: title || t('toast.info'),
      description: description,
      color: 'primary',
      timeout: 3000,
    });
  },

  success: (title, description) => {
    addToast({
      title: title || t('toast.success'),
      description: description,
      color: 'success',
      timeout: 3000,
    });
  },

  warning: (title, description) => {
    addToast({
      title: title || t('toast.warning'),
      description: description,
      color: 'warning',
      timeout: 4000,
    });
  },
};

// Типы уведомлений для администратора
export const showAdminToast = {
  // Товары
  productAdded: (productName) => {
    addToast({
      title: t('toast.productAdded'),
      description: productName ? `"${productName}" ${t('toast.productAddedDesc')}` : t('toast.productAddedDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  productUpdated: (productName) => {
    addToast({
      title: t('toast.productUpdated'),
      description: productName ? `"${productName}" ${t('toast.productUpdatedDesc')}` : t('toast.productUpdatedDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  productDeleted: (productName) => {
    addToast({
      title: t('toast.productDeleted'),
      description: productName ? `"${productName}" ${t('toast.productDeletedDesc')}` : t('toast.productDeletedDesc'),
      color: 'warning',
      timeout: 3000,
    });
  },

  productRestored: (productName) => {
    addToast({
      title: t('toast.productRestored'),
      description: productName ? `"${productName}" ${t('toast.productRestoredDesc')}` : t('toast.productRestoredDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  stockUpdated: (productName, newStock) => {
    addToast({
      title: t('toast.stockUpdated'),
      description: productName 
        ? `"${productName}": ${newStock} ${t('toast.pieces')}` 
        : `${newStock} ${t('toast.pieces')}`,
      color: 'primary',
      timeout: 3000,
    });
  },

  // Заказы
  orderStatusChanged: (orderId, newStatus) => {
    const statusLabel = t(`toast.orderStatus.${newStatus}`) || newStatus;
    addToast({
      title: t('toast.orderStatusChanged'),
      description: `#${orderId}: ${statusLabel}`,
      color: newStatus === 'cancelled' ? 'danger' : 'success',
      timeout: 3000,
    });
  },

  newOrder: (orderId) => {
    addToast({
      title: t('toast.newOrder'),
      description: orderId ? `${t('toast.newOrderDesc')} #${orderId}` : t('toast.newOrderDesc'),
      color: 'primary',
      timeout: 5000,
    });
  },

  // Настройки
  settingsSaved: () => {
    addToast({
      title: t('toast.settingsSaved'),
      description: t('toast.settingsSavedDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  settingsError: (message) => {
    addToast({
      title: t('toast.settingsError'),
      description: message || t('toast.settingsErrorDesc'),
      color: 'danger',
      timeout: 4000,
    });
  },

  // Администраторы
  adminAdded: (adminName) => {
    addToast({
      title: t('toast.adminAdded'),
      description: adminName ? `${adminName} ${t('toast.adminAddedDesc')}` : t('toast.adminAddedDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  adminDeleted: (adminName) => {
    addToast({
      title: t('toast.adminDeleted'),
      description: adminName ? `${adminName} ${t('toast.adminDeletedDesc')}` : t('toast.adminDeletedDesc'),
      color: 'warning',
      timeout: 3000,
    });
  },

  adminLogin: (adminName) => {
    addToast({
      title: t('toast.adminLogin'),
      description: adminName ? `${t('toast.adminLoginDesc')}, ${adminName}` : t('toast.adminLoginDesc'),
      color: 'success',
      timeout: 3000,
    });
  },

  // Общие
  dataLoaded: () => {
    addToast({
      title: t('toast.dataLoaded'),
      description: t('toast.dataLoadedDesc'),
      color: 'primary',
      timeout: 2000,
    });
  },

  error: (message) => {
    addToast({
      title: t('toast.error'),
      description: message || t('toast.errorDefault'),
      color: 'danger',
      timeout: 4000,
    });
  },

  info: (title, description) => {
    addToast({
      title: title || t('toast.info'),
      description: description,
      color: 'primary',
      timeout: 3000,
    });
  },
};

export default showToast;
