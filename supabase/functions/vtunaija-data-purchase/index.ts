import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to send API error email
const sendApiErrorEmail = async (supabase: any, userFullName: string, apiKeyName: string, errorMessage: string, errorResponse: any) => {
  try {
    await supabase.functions.invoke('send-api-error-email', {
      body: {
        userFullName,
        apiKeyName,
        errorMessage,
        errorResponse
      }
    });
  } catch (emailError) {
    console.error('Failed to send API error email:', emailError);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { network, mobile_number, plan, user_id, amount, selectedPlanType } = await req.json()

    console.log('VTUNAIJA Data Purchase Request:', { network, mobile_number, plan, user_id, amount, selectedPlanType })

    // Validate required parameters
    if (!network || !mobile_number || !plan || !user_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check allowed plan types
    const allowedPlanTypes = {
      'MTN': ['CORPORATE GIFTING', 'GIFTING PROMO', 'GIFTING'],
      'Airtel': ['GIFTING PROMO'],
      'Glo': ['GIFTING PROMO', 'SME'],
      '9mobile': ['SME']
    }

    if (!allowedPlanTypes[network as keyof typeof allowedPlanTypes]?.includes(selectedPlanType)) {
      return new Response(
        JSON.stringify({ error: 'Plan type not allowed for VTUNAIJA API' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user balance
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('balance')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (userData.balance < amount) {
      // Get user full name for error email
      const { data: userFullData } = await supabaseClient
        .from('users')
        .select('full_name')
        .eq('id', user_id)
        .single();
      
      // Send API error email
      await sendApiErrorEmail(
        supabaseClient,
        userFullData?.full_name || 'Unknown User',
        'VTUNAIJA API Key',
        'Insufficient Wallet Balance',
        { user_balance: userData.balance, required_amount: amount }
      );
      
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate request ID
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // Map network names to API values
    const networkMapping = {
      'MTN': '1',
      'Glo': '2', 
      'Airtel': '4',
      '9mobile': '3'
    }

    // Prepare VTUNAIJA API request
    const vtuApiKey = Deno.env.get('VTUNAIJA_API_KEY')
    if (!vtuApiKey) {
      console.error('VTUNAIJA API key not configured')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vtuPayload = {
      network: networkMapping[network as keyof typeof networkMapping],
      mobile_number: mobile_number,
      Ported_number: "true",
      "request-id": requestId,
      plan: plan.toString()
    }

    console.log('VTUNAIJA API Payload:', vtuPayload)

    // Call VTUNAIJA API
    const vtuResponse = await fetch('https://vtunaija.com.ng/api/data/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${vtuApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vtuPayload)
    })

    const vtuResult = await vtuResponse.json()
    console.log('VTUNAIJA API Response:', vtuResult)

    // Store transaction in history
    const transactionData = {
      user_id,
      transaction_type: 'data-bundle',
      mobile_number,
      mobile_network: network,
      amount,
      status: vtuResult.Status === 'successful' ? 'successful' : 'failed',
      order_id: requestId,
      api_response: vtuResult
    }

    const { error: transactionError } = await supabaseClient
      .from('transaction_history')
      .insert(transactionData)

    if (transactionError) {
      console.error('Error storing transaction:', transactionError)
    }

    // If successful, deduct amount from user balance
    if (vtuResult.Status === 'successful') {
      const { error: balanceError } = await supabaseClient
        .from('users')
        .update({ 
          balance: userData.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)

      if (balanceError) {
        console.error('Error updating user balance:', balanceError)
        // Continue anyway as the transaction was successful
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          transaction: vtuResult,
          order_id: requestId,
          new_balance: userData.balance - amount
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Get user full name for error email
      const { data: userFullData } = await supabaseClient
        .from('users')
        .select('full_name')
        .eq('id', user_id)
        .single();
      
      // Send API error email
      await sendApiErrorEmail(
        supabaseClient,
        userFullData?.full_name || 'Unknown User',
        'VTUNAIJA API Key',
        'VTUNAIJA Data Purchase Failed',
        vtuResult
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transaction failed',
          details: vtuResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in VTUNAIJA data purchase:', error)
    
    // Send API error email for unexpected errors
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const requestData = await req.json();
      const { data: userData } = await supabaseClient
        .from('users')
        .select('full_name')
        .eq('id', requestData.user_id)
        .single();
      
      await sendApiErrorEmail(
        supabaseClient,
        userData?.full_name || 'Unknown User',
        'VTUNAIJA API Key',
        error.message || 'VTUNAIJA Data Purchase System Error',
        { error: error.message, stack: error.stack }
      );
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})