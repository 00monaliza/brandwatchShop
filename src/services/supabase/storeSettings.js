import { supabase } from './client';

export const storeSettings = {
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

  update: async (updates) => {
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

  subscribe: (callback) => {
    const subscription = supabase
      .channel('store_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => { callback(payload.new); }
      )
      .subscribe();

    return subscription;
  },

  unsubscribe: (subscription) => {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};
