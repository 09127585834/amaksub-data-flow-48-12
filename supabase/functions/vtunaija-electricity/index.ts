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

    const { disco_name, meter_number, user_id, amount, phone_number, customer_name, paymentType } = await req.json()

    console.log('VTUNAIJA Electricity Purchase Request:', { disco_name, meter_number, user_id, amount, phone_number, customer_name })

    // Validate required parameters
    if (!disco_name || !meter_number || !user_id || !amount || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
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
        JSON.stringify({ error: 'Insufficient balance', balance: userData.balance }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate request ID
    const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // Prepare VTUNAIJA API request
    const vtuApiKey = Deno.env.get('VTUNAIJA_API_KEY')
    if (!vtuApiKey) {
      console.error('VTUNAIJA API key not configured')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // First, verify the meter before attempting payment
    console.log('Verifying meter first before payment...')
    const verifyPayload = {
      disco_name: disco_name,
      meter_number: meter_number
    }

    console.log('VTUNAIJA Verify Payload:', verifyPayload)

    const verifyResponse = await fetch('https://vtunaija.com.ng/api/billpayment/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${vtuApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyPayload)
    })

    const verifyResult = await verifyResponse.json()
    console.log('VTUNAIJA Verify Response:', verifyResult)

    if (verifyResult.Status !== 'successful') {
      console.error('Meter verification failed:', verifyResult)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Meter verification failed',
          details: verifyResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Proceed with payment if verification is successful
    const vtuPayload = {
      disco_name: disco_name,
      meter_number: meter_number,
      MeterType: paymentType || "prepaid",
      amount: amount.toString()
    }

    console.log('VTUNAIJA API Payload:', vtuPayload)

    // Call VTUNAIJA API for bill payment
    console.log('Making VTUNAIJA API request to:', 'https://vtunaija.com.ng/api/billpayment/')
    console.log('Request headers:', {
      'Authorization': `Token ${vtuApiKey?.substring(0, 10)}...`, // Log partial key for debugging
      'Content-Type': 'application/json'
    })
    
    const vtuResponse = await fetch('https://vtunaija.com.ng/api/billpayment/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${vtuApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vtuPayload)
    })

    console.log('VTUNAIJA HTTP Response Status:', vtuResponse.status)
    console.log('VTUNAIJA HTTP Response Headers:', Object.fromEntries(vtuResponse.headers.entries()))
    
    if (!vtuResponse.ok) {
      console.error('VTUNAIJA HTTP Error:', vtuResponse.status, vtuResponse.statusText)
      const errorText = await vtuResponse.text()
      console.error('VTUNAIJA Error Response:', errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'VTUNAIJA API HTTP Error',
          details: {
            status: vtuResponse.status,
            statusText: vtuResponse.statusText,
            response: errorText
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const vtuResult = await vtuResponse.json()
    console.log('VTUNAIJA API Response:', vtuResult)
    
    // Additional error details for failed transactions
    if (vtuResult.Status === 'failed') {
      console.error('VTUNAIJA Transaction Failed:', {
        api_response: vtuResult.api_response,
        id: vtuResult.id,
        ident: vtuResult.ident,
        plan_amount: vtuResult.plan_amount,
        full_response: vtuResult
      })
    }

    // Store transaction in history
    const transactionData = {
      user_id,
      transaction_type: 'electricity',
      mobile_number: phone_number,
      mobile_network: 'electricity',
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
          new_balance: userData.balance - amount,
          token: vtuResult.token || vtuResult.electricitytoken || vtuResult.id || vtuResult.ident,
          customer_name: vtuResult.Customer_Name || vtuResult.name,
          customer_address: vtuResult.Customer_Address
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
        'VTUNAIJA Electricity Failed',
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
    console.error('Error in VTUNAIJA electricity purchase:', error)
    
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
        error.message || 'VTUNAIJA Electricity System Error',
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