import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { orderId, items, total, customerName, customerPhone } = await req.json()

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500 })
    }

    const itemsList = items.map((item: any) => 
      `• ${item.name} x${item.quantity} — ${item.price * item.quantity} ₸`
    ).join('\n')

    const message = `
🛒 Новый заказ #${orderId}
👤 ${customerName}
📞 ${customerPhone}

${itemsList}

💰 Итого: ${total} ₸
    `.trim()

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})