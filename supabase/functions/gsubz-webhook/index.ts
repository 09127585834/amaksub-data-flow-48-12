import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log('GSUBZ Webhook received:', webhookData);

    // Extract relevant data from webhook
    const {
      id,
      status,
      network,
      value,
      number,
      delivered,
      pending,
      pins,
      message
    } = webhookData;

    if (!id) {
      console.error('No transaction ID found in webhook data');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook data: missing transaction ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update transaction history based on webhook status
    const updateData: any = {
      api_response: webhookData,
      status: status === 'success' ? 'completed' : 'failed'
    };

    // Find and update the transaction with matching GSUBZ ID
    const { data: transactions, error: fetchError } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('transaction_type', 'recharge-card')
      .contains('api_response', { id });

    if (fetchError) {
      console.error('Error fetching transaction:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error while fetching transaction' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (transactions && transactions.length > 0) {
      const { error: updateError } = await supabase
        .from('transaction_history')
        .update(updateData)
        .eq('id', transactions[0].id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return new Response(
          JSON.stringify({ error: 'Database error while updating transaction' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Transaction ${transactions[0].id} updated successfully`);
    } else {
      console.log('No matching transaction found for GSUBZ ID:', id);
    }

    // Log webhook for monitoring
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        source: 'gsubz',
        webhook_data: webhookData,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
      // Don't fail the webhook response for logging errors
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in gsubz-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});