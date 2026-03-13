# СИСТЕМА ОТСЛЕЖИВАНИЯ ЗАКАЗОВ

Последнее обновление: 2026-03-13 19:30
Завершено: 7/7

## ЗАКРЫТО:
- Задача 1 — SQL для базы данных (колонки tracking_url, tracking_added_at, notified_at)
- Задача 2 — Страница OrderTracking (/orders/:id) с realtime обновлением
- Задача 3 — Profile/Orders с кнопками отслеживания
- Задача 4 — AdminOrders с полем трек-ссылки и WhatsApp
- Задача 5 — Edge Function notify-tracking (Email + WhatsApp)
- Задача 6 — Роутинг /orders/:id
- Задача 7 — CheckoutModal с редиректом на заказ

## В РАБОТЕ:
— нет —

## ОЧЕРЕДЬ:
— нет —

## ЗАМЕТКИ:
- Supabase проект: mkobqocdntxvizfvzkpo
- Email: Resend API
- Уведомления: Email + WhatsApp (wa.me)

## НЕОБХОДИМЫЕ ДЕЙСТВИЯ:
1. Выполнить SQL в Supabase:
```sql
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_url text,
ADD COLUMN IF NOT EXISTS tracking_added_at timestamptz,
ADD COLUMN IF NOT EXISTS notified_at timestamptz,
ADD COLUMN IF NOT EXISTS whatsapp_notify_url text;
```

2. Задеплоить Edge Function:
```bash
supabase functions deploy notify-tracking
```

3. Добавить RESEND_API_KEY в Supabase secrets:
```bash
supabase secrets set RESEND_API_KEY=your_key
```
