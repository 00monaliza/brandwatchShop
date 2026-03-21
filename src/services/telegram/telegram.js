import { supabase } from '../supabase/client';

export const sendOrderNotification = async ({ orderId, items, total, customerName, customerPhone }) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
      body: { orderId, items, total, customerName, customerPhone }
    });

    if (error) {
      console.error('Telegram notification failed:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Telegram notification error:', err);
    return null;
  }
};


export const sendTelegramNotification = sendOrderNotification;