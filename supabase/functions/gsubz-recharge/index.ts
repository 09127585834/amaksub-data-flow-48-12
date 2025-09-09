import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { network, value, number, user_id } = await req.json();

    if (!network || !value || !number) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: network, value, number' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get GSUBZ API key from environment
    const gsubzApiKey = Deno.env.get('GSUBZ_API_KEY');
    if (!gsubzApiKey) {
      console.error('GSUBZ_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare form data for GSUBZ API
    const formData = new FormData();
    formData.append('network', network);
    formData.append('value', value);
    formData.append('number', number);

    console.log('Calling GSUBZ API with:', { network, value, number });

    // Call GSUBZ API
    const response = await fetch('https://gsubz.com/apiV2/generate/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gsubzApiKey}`,
      },
      body: formData
    });

    const responseData = await response.json();
    console.log('GSUBZ API response:', responseData);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'GSUBZ API request failed',
          details: responseData
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if the response indicates success
    if (responseData.status !== 'success') {
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
        'GSUBZ API Key',
        'GSUBZ Recharge Card Failed',
        responseData
      );
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: responseData.message || 'Transaction failed',
          details: responseData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in gsubz-recharge function:', error);
    
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
        'GSUBZ API Key',
        error.message || 'GSUBZ Recharge Card System Error',
        { error: error.message, stack: error.stack }
      );
    } catch (emailError) {
      console.error('Failed to send error email:', emailError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
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