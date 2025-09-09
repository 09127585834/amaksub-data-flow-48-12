import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const webhookData = await req.json()
    console.log('VTUNAIJA Webhook received:', webhookData)

    // Store webhook data in logs
    const { error: logError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        source: 'vtunaija',
        webhook_data: webhookData,
        processed_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error storing webhook log:', logError)
    }

    // If webhook contains transaction update, update transaction history
    if (webhookData.request_id || webhookData.id) {
      const orderId = webhookData.request_id || webhookData.id
      
      const { error: updateError } = await supabaseClient
        .from('transaction_history')
        .update({
          status: webhookData.Status === 'successful' ? 'successful' : 'failed',
          api_response: webhookData,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)

      if (updateError) {
        console.error('Error updating transaction status:', updateError)
      } else {
        console.log('Transaction status updated for order:', orderId)
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing VTUNAIJA webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})