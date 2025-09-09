import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and OTP are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if email exists and get OTP data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, sent_otp, otp_sent_at')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email address.' 
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if OTP exists
    if (!userData.sent_otp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No reset code found. Please request a new one.' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check OTP expiration (10 minutes)
    const otpSentAt = new Date(userData.otp_sent_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - otpSentAt.getTime()) / (1000 * 60);

    if (diffInMinutes > 10) {
      // Clear expired OTP
      await supabase
        .from('users')
        .update({ sent_otp: null, otp_sent_at: null })
        .eq('id', userData.id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Reset code has expired. Please request a new one.' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Verify OTP
    if (userData.sent_otp !== otp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid reset code. Please check and try again.' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // OTP is valid - clear it from database and return success
    const { error: clearError } = await supabase
      .from('users')
      .update({ sent_otp: null, otp_sent_at: null })
      .eq('id', userData.id);

    if (clearError) {
      console.error('Error clearing OTP:', clearError);
    }

    console.log('Reset OTP verified successfully for:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reset code verified successfully',
        userId: userData.id
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in verify-reset-otp function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});