import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApiErrorEmailRequest {
  userFullName: string;
  apiKeyName: string;
  errorMessage: string;
  errorResponse: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userFullName, apiKeyName, errorMessage, errorResponse }: ApiErrorEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Api Errors Respond <noreply@amaksub.name.ng>",
      to: ["kingkhalifah001@gmail.com"],
      subject: "API Error Response - Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0;">
            <h1 style="color: #333; margin: 0; font-size: 24px;">AMAKSUB DATA</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 16px;">API Error Response</p>
          </div>
          
          <div style="padding: 30px 0;">
            <h2 style="color: #dc2626; font-size: 20px; margin-bottom: 20px;">API Error Notification</h2>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;"><strong>User:</strong> ${userFullName}</p>
              <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;"><strong>API Key:</strong> ${apiKeyName}</p>
              <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;"><strong>Error Message:</strong> ${errorMessage}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">API Response Details:</h3>
              <pre style="color: #666; font-size: 14px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(errorResponse, null, 2)}</pre>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Please investigate this API error and take appropriate action to resolve it.
            </p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Note:</strong> This is an automated error notification. Please respond to this issue promptly to ensure service continuity.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999; font-size: 14px;">
            <p style="margin: 0;">This is an automated message from Amaksub Data API monitoring system.</p>
            <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    console.log("API error email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-api-error-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);