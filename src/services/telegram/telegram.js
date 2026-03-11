import { supabase } from '../supabase/client';

export const sendOrderNotification = async ({ orderId, items, total, customerName, customerPhone }) => {
  const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
    body: { orderId, items, total, customerName, customerPhone }
  });

  if (error) {
    throw new Error(`Telegram notification failed: ${error.message}`);
  }
  return data;
};


export const sendTelegramNotification = sendOrderNotification;