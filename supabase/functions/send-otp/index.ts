import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  phoneNumber: string;
  fullName: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailOTP = async (email: string, otp: string, fullName: string) => {
  return await resend.emails.send({
    from: "Amaksub Data <noreply@amaksub.name.ng>",
    to: [email],
    subject: "Your Amaksub Data Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Account Verification</h2>
        <p style="color: #666; font-size: 16px;">Hello ${fullName},</p>
        <p style="color: #666; font-size: 16px;">Thank you for signing up with Amaksub Data! Please use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; padding: 20px; background: #f3f4f6; border-radius: 10px; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 16px;">This code will expire in 10 minutes for security reasons.</p>
        <p style="color: #666; font-size: 16px;">If you didn't request this verification, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 14px; text-align: center;">This is an automated message, please do not reply.</p>
      </div>
    `,
  });
};

const sendSMSOTP = async (phoneNumber: string, otp: string) => {
  const termiiApiKey = Deno.env.get("TERMII_API_KEY");
  
  if (!termiiApiKey) {
    throw new Error("TERMII_API_KEY not found");
  }

  // Ensure phone number starts with +234
  let formattedPhone = phoneNumber;
  if (phoneNumber.startsWith("0")) {
    formattedPhone = "+234" + phoneNumber.substring(1);
  } else if (!phoneNumber.startsWith("+234")) {
    formattedPhone = "+234" + phoneNumber;
  }

  const smsData = {
    to: formattedPhone,
    from: "Amaksub",
    sms: `Your Amaksub Data verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
    type: "plain",
    api_key: termiiApiKey,
    channel: "generic",
  };

  const response = await fetch("https://api.termii.com/api/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(smsData),
  });

  return await response.json();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phoneNumber, fullName }: SendOTPRequest = await req.json();
    
    console.log("Sending OTP to:", { email, phoneNumber, fullName });

    // Generate a single OTP for both email and SMS
    const otp = generateOTP();
    
    // Send email and SMS concurrently
    const [emailResponse, smsResponse] = await Promise.all([
      sendEmailOTP(email, otp, fullName),
      sendSMSOTP(phoneNumber, otp)
    ]);

    console.log("Email response:", emailResponse);
    console.log("SMS response:", smsResponse);

    // Store OTP temporarily (in production, use Redis or database)
    // For now, we'll return the OTP in response for verification
    // In production, you should store this securely and not return it
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully to both email and phone",
        emailSent: emailResponse.data?.id ? true : false,
        smsSent: smsResponse.message_id ? true : false,
        // Remove this in production - only for testing
        otp: otp
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
    console.error("Error in send-otp function:", error);
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