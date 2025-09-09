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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { network, mobile_number, plan, user_id, amount, selectedPlanType } = await req.json()

    console.log('GSUBZ Data Purchase Request:', {
      network,
      mobile_number,
      plan,
      user_id,
      amount,
      selectedPlanType
    })

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const gsubzApiKey = Deno.env.get('GSUBZ_API_KEY')!

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Map network and plan type to GSUBZ service ID
    let serviceID = ''
    if (network === 'MTN' && selectedPlanType === 'SME') {
      serviceID = 'mtn_sme'
    } else if (network === 'Airtel' && selectedPlanType === 'SME') {
      serviceID = 'airtel_sme'
    } else if (network === 'Glo' && selectedPlanType === 'CORPORATE GIFTING') {
      serviceID = 'glo_data'
    } else if (network === '9mobile' && selectedPlanType === 'CORPORATE GIFTING') {
      serviceID = 'etisalat_data'
    } else {
      throw new Error(`Unsupported network/plan combination: ${network} ${selectedPlanType}`)
    }

    console.log('GSUBZ Service ID:', serviceID)

    // Generate unique request ID
    const requestID = `${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Prepare form data for GSUBZ API
    const formData = new FormData()
    formData.append('serviceID', serviceID)
    formData.append('plan', plan)
    formData.append('api', gsubzApiKey)
    formData.append('amount', amount.toString())
    formData.append('phone', mobile_number)
    formData.append('requestID', requestID)

    console.log('GSUBZ API Payload:', {
      serviceID,
      plan,
      api: `${gsubzApiKey.substring(0, 10)}...`,
      amount: amount.toString(),
      phone: mobile_number,
      requestID
    })

    // Make request to GSUBZ API
    console.log('Making GSUBZ API request to: https://gsubz.com/api/pay/')
    const gsubzResponse = await fetch('https://gsubz.com/api/pay/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gsubzApiKey}`
      },
      body: formData
    })

    console.log('GSUBZ HTTP Response Status:', gsubzResponse.status)
    console.log('GSUBZ HTTP Response Headers:', JSON.stringify(Object.fromEntries(gsubzResponse.headers.entries()), null, 2))

    if (!gsubzResponse.ok) {
      console.error('GSUBZ HTTP Error:', gsubzResponse.status, gsubzResponse.statusText)
      const errorText = await gsubzResponse.text()
      console.error('GSUBZ Error Response Text:', errorText)
      throw new Error(`GSUBZ API request failed: ${gsubzResponse.status} ${gsubzResponse.statusText}`)
    }

    const gsubzResult = await gsubzResponse.json()
    console.log('GSUBZ API Response:', JSON.stringify(gsubzResult, null, 2))

    // Check if transaction was successful - handle both "TRANSACTION_SUCCESSFUL" and "successful" status
    if (gsubzResult.code !== 200 || (gsubzResult.status !== 'TRANSACTION_SUCCESSFUL' && gsubzResult.status !== 'successful')) {
      console.error('GSUBZ Error Response:', gsubzResult)
      
      // Get user full name for error email
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user_id)
        .single();
      
      // Send API error email
      await sendApiErrorEmail(
        supabase, 
        userData?.full_name || 'Unknown User',
        'GSUBZ API Key',
        gsubzResult.description || 'GSUBZ Data Purchase Failed',
        gsubzResult
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: gsubzResult.description || 'Transaction failed',
          details: gsubzResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert({
        user_id: user_id,
        transaction_type: 'data-bundle',
        mobile_number: mobile_number,
        mobile_network: network,
        amount: amount,
        status: 'completed',
        api_response: gsubzResult,
        order_id: gsubzResult.transactionID?.toString() || requestID
      })

    if (transactionError) {
      console.error('Error saving transaction:', transactionError)
      // Don't fail the request if transaction saving fails
    }

    // Get current user balance and update with the amount user selected to purchase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user_id)
      .single()

    if (userError) {
      console.error('Error fetching user balance:', userError)
    }

    const currentBalance = parseFloat(userData?.balance?.toString() || '0')
    const userSelectedAmount = parseFloat(amount.toString())
    const newBalance = currentBalance - userSelectedAmount

    // Update user balance with the amount user chose to purchase
    const { error: balanceError } = await supabase
      .from('users')
      .update({
        balance: newBalance
      })
      .eq('id', user_id)

    if (balanceError) {
      console.error('Error updating user balance:', balanceError)
      // Don't fail the request if balance update fails
    }

    console.log('GSUBZ Data Purchase Successful')

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          id: gsubzResult.transactionID,
          status: 'completed',
          amount: amount,
          mobile_number: mobile_number,
          network: network,
          plan: plan,
          requestID: requestID,
          date: gsubzResult.date || new Date().toISOString(),
          balance: gsubzResult.finalBalance
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in GSUBZ data purchase function:', error)
    
    // Send API error email for unexpected errors
    try {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', req.json().then(data => data.user_id))
        .single();
      
      await sendApiErrorEmail(
        supabase,
        userData?.full_name || 'Unknown User',
        'GSUBZ API Key',
        error.message || 'GSUBZ Data Purchase System Error',
        { error: error.message, stack: error.stack }
      );
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})