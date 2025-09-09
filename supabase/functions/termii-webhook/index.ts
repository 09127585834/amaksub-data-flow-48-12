import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    console.log("Termii webhook received:", payload);
    
    // Handle different types of Termii webhooks
    // Common webhook types: delivery_report, message_status, etc.
    
    if (payload.type === "delivery_report") {
      console.log("SMS Delivery Report:", {
        messageId: payload.message_id,
        status: payload.status,
        phone: payload.phone_number,
        deliveredAt: payload.delivered_at
      });
    }
    
    // You can add more webhook handling logic here
    // For example, update delivery status in database
    
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
    console.error("Error in termii-webhook function:", error);
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