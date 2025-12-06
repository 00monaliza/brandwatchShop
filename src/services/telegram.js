const BOT_TOKEN = '8484093750:AAF9nvhe1_7DMd2lNKwgXWD_dP5BBisOp2c';
const CHAT_ID = '1061292687';

// Для получения chat_id пользователя @baikadamov_a:
// 1. Пользователь должен написать вашему боту
// 2. Или добавьте бота в группу с этим пользователем

export const sendTelegramNotification = async (orderData) => {
  const { customer, items, total, comment, orderDate } = orderData;

  // Формируем сообщение
  const itemsList = items.map(item => 
    `  • ${item.brand} ${item.title} x${item.quantity} - $${item.price * item.quantity}`
  ).join('\n');

  const message = `
*НОВЫЙ ЗАКАЗ!*

*Клиент:*
Имя: ${customer.name}
Телефон: \`${customer.phone}\`
Email: ${customer.email || 'Не указан'}

*Товары:*
${itemsList}

*Итого:* $${total}

${comment ? `*Комментарий:* ${comment}\n` : ''}
*Дата:* ${orderDate}

━━━━━━━━━━━━━━━
Свяжитесь с клиентом!
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        }),
      }
    );

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      throw new Error(data.description || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    // Не выбрасываем ошибку, чтобы не блокировать оформление заказа
    // В реальном проекте можно добавить резервный способ уведомления
    return null;
  }
};

// Инструкция по настройке бота для @baikadamov_a:
// 
// 1. Создайте бота через @BotFather в Telegram:
//    - Напишите /newbot
//    - Дайте имя боту (например: BrandWatch Orders Bot)
//    - Дайте username боту (например: brandwatch_orders_bot)
//    - Скопируйте токен и вставьте выше в BOT_TOKEN
//
// 2. Получите CHAT_ID для @baikadamov_a:
//    - Пользователь @baikadamov_a должен написать /start вашему боту
//    - Перейдите: https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
//    - Найдите в ответе "chat":{"id": ЧИСЛО} - это и есть CHAT_ID
//    - Вставьте это число выше в CHAT_ID
//
// 3. Для группового чата:
//    - Добавьте бота в группу
//    - Напишите любое сообщение в группе
//    - Используйте getUpdates чтобы получить chat_id группы (будет отрицательным числом)
