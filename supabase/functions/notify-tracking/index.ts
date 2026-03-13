import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { orderId, trackingUrl } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Получить данные заказа с профилем
    const { data: order } = await supabase
      .from('orders')
      .select('*, profiles(first_name, email, phone)')
      .eq('id', orderId)
      .single()

    const userName = order?.profiles?.first_name || 'Покупатель'
    const userEmail = order?.profiles?.email
    const userPhone = order?.profiles?.phone

    // 1. Email через Resend
    if (userEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'BrandWatch <orders@brandwatch.kz>',
          to: userEmail,
          subject: `Ваш заказ #${orderId} отправлен!`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#2F4454">Ваш заказ отправлен!</h2>
              <p>Здравствуйте, ${userName}!</p>
              <p>Ваш заказ <b>#${orderId}</b> передан в доставку.</p>
              <p style="margin:24px 0">
                <a href="${trackingUrl}"
                   style="background:#DA7B93;color:white;padding:14px 28px;
                          text-decoration:none;border-radius:8px;font-weight:600">
                  Отследить заказ
                </a>
              </p>
              <p style="color:#666;font-size:14px">
                Ссылка для отслеживания:<br>
                <a href="${trackingUrl}">${trackingUrl}</a>
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
              <p style="color:#999;font-size:12px">BrandWatch — brandwatch.kz</p>
            </div>
          `
        })
      })
    }

    // 2. WhatsApp ссылка
    if (userPhone) {
      const phone = userPhone.replace(/\D/g, '')
      const message = encodeURIComponent(
        `Здравствуйте, ${userName}!\n\n` +
        `Ваш заказ #${orderId} в BrandWatch отправлен!\n\n` +
        `Ссылка для отслеживания:\n${trackingUrl}\n\n` +
        `Спасибо за покупку!`
      )
      const whatsappUrl = `https://wa.me/${phone}?text=${message}`

      await supabase
        .from('orders')
        .update({
          whatsapp_notify_url: whatsappUrl,
          notified_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})