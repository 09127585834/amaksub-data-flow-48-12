import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const handler = async (req: Request): Promise<Response> => {
  // Log all incoming requests for debugging
  console.log('=== WEBHOOK REQUEST RECEIVED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecret) {
      console.error('PAYSTACK_SECRET_KEY not found');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the signature from headers
    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      console.error('No signature found');
      return new Response(JSON.stringify({ error: 'No signature found' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the signature using HMAC-SHA512
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(paystackSecret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    const signature_buffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const hash = Array.from(new Uint8Array(signature_buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Signature verification:', {
      expected: hash,
      received: signature,
      body_length: body.length
    });
    
    if (hash !== signature) {
      console.error('Invalid signature. Expected:', hash, 'Received:', signature);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    console.log('Paystack webhook received:', event.event);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different event types
    if (event.event === 'charge.success') {
      const data = event.data;
      console.log('Processing successful charge:', data.reference);

      // Extract customer email or reference to identify the user
      const customerEmail = data.customer.email;
      const amount = data.amount / 100; // Paystack amounts are in kobo, convert to naira
      const reference = data.reference;

      // Find the user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, balance')
        .eq('email', customerEmail)
        .single();

      if (userError || !user) {
        console.error('User not found for email:', customerEmail);
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Update user balance
      const currentBalance = parseFloat(user.balance?.toString() || '0');
      const newBalance = currentBalance + amount;
      console.log(`Updating balance for user ${user.id}: ${currentBalance} + ${amount} = ${newBalance}`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance.toString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update balance' }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          transaction_type: 'wallet_funding',
          amount: amount,
          mobile_number: customerEmail, // Using email as identifier
          mobile_network: 'paystack',
          status: 'completed',
          order_id: reference,
          api_response: data
        });

      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
      }

      console.log(`Successfully credited ${amount} to user ${customerEmail}. New balance: ${newBalance}`);

    } else if (event.event === 'transfer.success') {
      console.log('Transfer success webhook received:', event.data.reference);
      // Handle successful transfers if needed
    } else {
      console.log('Unhandled webhook event:', event.event);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in paystack-webhook function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);