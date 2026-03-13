import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, trackingUrl } = await req.json()

    if (!orderId || !trackingUrl) {
      return new Response(
        JSON.stringify({ error: 'orderId and trackingUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get order with user profile data
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Order fetch error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile if user_id exists
    let userProfile = null
    if (order.user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('first_name, email, phone')
        .eq('id', order.user_id)
        .single()
      userProfile = profile
    }

    const userName = userProfile?.first_name || order.customer?.name || 'Покупатель'
    const userEmail = userProfile?.email || order.customer?.email
    const userPhone = userProfile?.phone || order.customer?.phone
    const orderIdShort = String(orderId).slice(-8)

    let emailSent = false
    let whatsappUrl = null

    // 1. Send Email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey && userEmail) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'BrandWatch <orders@brandwatch.kz>',
            to: userEmail,
            subject: `Ваш заказ #${orderIdShort} отправлен!`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
                  .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                  .header { background: linear-gradient(135deg, #DA7B93, #2E151B); padding: 30px; text-align: center; }
                  .header h1 { color: #fff; margin: 0; font-size: 24px; }
                  .content { padding: 30px; }
                  .track-btn { display: inline-block; background: linear-gradient(135deg, #DA7B93, #c56a82); color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                  .track-btn:hover { opacity: 0.9; }
                  .footer { padding: 20px 30px; background: #f9f9f9; text-align: center; color: #888; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Ваш заказ отправлен!</h1>
                  </div>
                  <div class="content">
                    <p>Здравствуйте, ${userName}!</p>
                    <p>Ваш заказ <strong>#${orderIdShort}</strong> передан в службу доставки.</p>
                    <p style="text-align: center;">
                      <a href="${trackingUrl}" class="track-btn">Отследить заказ</a>
                    </p>
                    <p>Или перейдите по ссылке:<br>
                    <a href="${trackingUrl}" style="color: #DA7B93;">${trackingUrl}</a></p>
                    <p>Спасибо за покупку!</p>
                  </div>
                  <div class="footer">
                    <p>BrandWatch — оригинальные часы</p>
                  </div>
                </div>
              </body>
              </html>
            `
          })
        })

        if (emailResponse.ok) {
          emailSent = true
          console.log('Email sent successfully to', userEmail)
        } else {
          const emailError = await emailResponse.text()
          console.error('Email send error:', emailError)
        }
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
    }

    // 2. Generate WhatsApp URL
    if (userPhone) {
      const phone = userPhone.replace(/[\s\-()+]/g, '')
      const message = encodeURIComponent(
        `Здравствуйте, ${userName}!\n\n` +
        `Ваш заказ #${orderIdShort} в BrandWatch отправлен!\n\n` +
        `Ссылка для отслеживания:\n${trackingUrl}\n\n` +
        `Спасибо за покупку!`
      )
      whatsappUrl = `https://wa.me/${phone}?text=${message}`

      // Save whatsapp URL and notification time to order
      await supabaseAdmin
        .from('orders')
        .update({
          whatsapp_notify_url: whatsappUrl,
          notified_at: new Date().toISOString()
        })
        .eq('id', orderId)
    }

    return new Response(
      JSON.stringify({
        ok: true,
        emailSent,
        whatsappUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
