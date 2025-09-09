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
    const { selectedNetwork, selectedPlan, smartCardNumber, customerName, user_id, phone_number } = await req.json()

    console.log('GSUBZ Cable Purchase Request:', {
      selectedNetwork,
      selectedPlan,
      smartCardNumber,
      customerName,
      user_id,
      phone_number
    })

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const gsubzApiKey = Deno.env.get('GSUBZ_API_KEY')!

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user details for error reporting
    const { data: userData } = await supabase
      .from('users')
      .select('full_name, balance')
      .eq('id', user_id)
      .single();

    // Check if user has sufficient balance
    const totalAmount = parseFloat(selectedPlan.price.toString())
    if (userData.balance < totalAmount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient balance',
          insufficientBalance: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the correct plan value from the appropriate table based on selected network
    const tableName = selectedNetwork?.toUpperCase()
    console.log('Looking up plan in table:', tableName, 'for plan ID:', selectedPlan.id)
    console.log('Selected plan full object:', JSON.stringify(selectedPlan, null, 2))
    
    const { data: planData, error: planError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', selectedPlan.id)
      .single()
    
    console.log('Database plan lookup result:', { planData, planError })

    if (planError) {
      console.error('Error fetching plan value:', planError)
      throw new Error(`Failed to fetch plan value: ${planError.message}`)
    }

    if (!planData) {
      console.error('No plan data found for ID:', selectedPlan.id)
      throw new Error('Plan not found')
    }

    // Try to get the value from different possible fields
    const actualPlanValue = planData.value || planData.plan_value || planData.plan || selectedPlan.value
    console.log('Retrieved plan value from database:', actualPlanValue)
    console.log('Full plan data from database:', JSON.stringify(planData, null, 2))

    // Map some known problematic values to their correct GSUBZ equivalents
    const planValueMap: { [key: string]: string } = {
      'dstv-access-1': 'dstv-access',
      'basic-weekly': 'startimes-basic-weekly', 
      'basic': 'startimes-basic',
      'smart-weekly': 'startimes-smart-weekly',
      'smart': 'startimes-smart',
      'classic': 'startimes-classic',
      'classic-weekly': 'startimes-classic-weekly',
      'special-monthly': 'startimes-special',
      'special-weekly': 'startimes-special-weekly',
      'uni-1': 'startimes-chinese'
    }

    const mappedPlanValue = planValueMap[actualPlanValue] || actualPlanValue
    console.log('Final plan value to send to GSUBZ:', mappedPlanValue)

    // Prepare form data for GSUBZ API exactly as specified in curl format
    const formData = new FormData()
    formData.append('serviceID', `"${selectedNetwork.toLowerCase()}"`) // e.g., "gotv", "dstv", "startimes"
    formData.append('api', `"${gsubzApiKey}"`)
    formData.append('plan', `"${actualPlanValue}"`) // Use actual plan value from database with quotes
    formData.append('phone', `"${phone_number}"`)
    formData.append('amount', '""') // Empty string with quotes
    formData.append('customerID', `"${smartCardNumber}"`) // Smart card/Decoder number with quotes

    console.log('GSUBZ API Payload:', {
      serviceID: selectedNetwork.toLowerCase(),
      api: `${gsubzApiKey.substring(0, 10)}...`,
      plan: actualPlanValue,
      phone: phone_number,
      amount: '',
      customerID: smartCardNumber
    })
    
    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

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
      
      // Send API error email
      await sendApiErrorEmail(
        supabase,
        userData?.full_name || 'Unknown User',
        'GSUBZ API Key',
        `GSUBZ Cable API HTTP Error: ${gsubzResponse.status} ${gsubzResponse.statusText}`,
        { error: errorText, status: gsubzResponse.status }
      );
      
      throw new Error(`GSUBZ API request failed: ${gsubzResponse.status} ${gsubzResponse.statusText}`)
    }

    const gsubzResult = await gsubzResponse.json()
    console.log('GSUBZ API Response:', JSON.stringify(gsubzResult, null, 2))

    // Check if transaction was successful
    if (gsubzResult.code !== 200 || gsubzResult.status !== 'TRANSACTION_SUCCESSFUL') {
      console.error('GSUBZ Error Response:', JSON.stringify(gsubzResult, null, 2))
      console.error('Plan value sent to API:', actualPlanValue)
      console.error('Service ID sent to API:', selectedNetwork.toLowerCase())
      console.error('Customer ID sent to API:', smartCardNumber)
      
      // Send API error email
      await sendApiErrorEmail(
        supabase,
        userData?.full_name || 'Unknown User',
        'GSUBZ API Key',
        `GSUBZ Cable Purchase Failed - Plan: ${actualPlanValue}, Service: ${selectedNetwork.toLowerCase()}, Error: ${gsubzResult.description}`,
        {
          ...gsubzResult,
          debugInfo: {
            planValueSent: actualPlanValue,
            serviceIdSent: selectedNetwork.toLowerCase(),
            customerIdSent: smartCardNumber,
            originalPlanData: planData,
            selectedPlan: selectedPlan
          }
        }
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
        transaction_type: 'cable',
        mobile_number: smartCardNumber,
        mobile_network: selectedNetwork,
        amount: totalAmount,
        status: 'completed',
        api_response: gsubzResult,
        order_id: gsubzResult.content?.transactionID?.toString() || Date.now().toString()
      })

    if (transactionError) {
      console.error('Error saving transaction:', transactionError)
      // Don't fail the request if transaction saving fails
    }

    // Update user balance with the amount user chose to purchase
    const newBalance = userData.balance - totalAmount

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

    // Save smart card number to beneficiaries for cable service
    const { error: beneficiaryError } = await supabase
      .from('beneficiaries')
      .insert({
        user_id: user_id,
        mobile_number: smartCardNumber,
        mobile_network: selectedNetwork.toLowerCase(),
        network_name: selectedNetwork.toLowerCase()
      })
      .select()

    if (beneficiaryError) {
      console.error('Error saving beneficiary:', beneficiaryError)
      // Don't fail the request if beneficiary saving fails
    }

    console.log('GSUBZ Cable Purchase Successful')

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          id: gsubzResult.content?.transactionID,
          status: 'completed',
          amount: totalAmount,
          smartCardNumber: smartCardNumber,
          customerName: customerName,
          selectedNetwork: selectedNetwork,
          selectedPlan: selectedPlan,
          date: gsubzResult.content?.date || new Date().toISOString(),
          balance: newBalance,
          order_id: gsubzResult.content?.transactionID?.toString() || Date.now().toString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in GSUBZ cable function:', error)
    
    // Send API error email for unexpected errors
    try {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
      const requestData = await req.json();
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', requestData.user_id)
        .single();
      
      await sendApiErrorEmail(
        supabase,
        userData?.full_name || 'Unknown User',
        'GSUBZ API Key',
        error.message || 'GSUBZ Cable Purchase System Error',
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