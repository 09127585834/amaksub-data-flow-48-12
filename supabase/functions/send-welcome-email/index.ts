import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  type: 'signup' | 'login';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, type }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending ${type} email to:`, { email, fullName });

    const isSignup = type === 'signup';
    let actualFullName = fullName;

    // For login messages, always fetch user's full name from database
    // For signup, use provided fullName or fetch from database as fallback
    if (!isSignup || !fullName) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('Fetching user data for email:', email);

        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (error) {
          console.error('Error fetching user data:', error);
        } else if (userData && userData.full_name) {
          actualFullName = userData.full_name;
          console.log('Found user full name:', actualFullName);
        } else {
          console.log('No user data found or no full_name, using fallback');
          // Use email prefix as fallback only if no fullName was provided
          actualFullName = fullName || email.split('@')[0];
        }
      } catch (error) {
        console.error('Exception when fetching user data:', error);
        // Use provided fullName or email prefix as fallback
        actualFullName = fullName || email.split('@')[0];
      }
    }

    const subject = isSignup ? "Welcome to Amaksub Data - Account Created Successfully!" : "Login Successful - Welcome Back!";

    const emailResponse = await resend.emails.send({
      from: "Amaksub Data <noreply@amaksub.name.ng>",
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">${isSignup ? 'Account Created Successfully!' : 'Welcome Back!'}</h2>
          <p style="color: #666; font-size: 16px;">Hello ${actualFullName},</p>
          <p style="color: #666; font-size: 16px;">
            ${isSignup 
              ? 'Congratulations! Your Amaksub Data account has been created successfully. You can now enjoy our data and airtime services with ease.'
              : 'You have successfully logged into your Amaksub Data account. Welcome back!'
            }
          </p>
          <div style="margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">
              ${isSignup ? 'Account Features:' : 'Available Services:'}
            </h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Buy Data Bundles</li>
              <li>Purchase Airtime</li>
              <li>Virtual Account Funding</li>
              <li>Transaction History</li>
              <li>24/7 Customer Support</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 16px;">
            ${isSignup 
              ? 'Your virtual account details have been set up and are ready for use. Start enjoying seamless transactions today!'
              : 'Thank you for using Amaksub Data. We\'re here to serve you better!'
            }
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; text-align: center;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });

    console.log(`${type} email response:`, emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${type} email sent successfully`,
        emailSent: emailResponse.data?.id ? true : false,
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
    console.error(`Error in send-welcome-email function:`, error);
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