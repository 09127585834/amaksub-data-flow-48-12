import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateVirtualAccountRequest {
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, email, phoneNumber, fullName }: CreateVirtualAccountRequest = await req.json();
    
    console.log("Creating virtual account for:", { username, email, phoneNumber, fullName });

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not found");
    }

    // Create customer first
    const customerResponse = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        first_name: fullName.split(' ')[0] || fullName,
        last_name: fullName.split(' ').slice(1).join(' ') || 'User',
        phone: phoneNumber,
      }),
    });

    const customerData = await customerResponse.json();
    
    if (!customerData.status) {
      throw new Error(customerData.message || "Failed to create customer");
    }

    console.log("Customer created:", customerData);

    // Create dedicated virtual account with Wema Bank
    const virtualAccountResponse = await fetch("https://api.paystack.co/dedicated_account", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerData.data.customer_code,
        preferred_bank: "wema-bank",
        subaccount: "", // Optional subaccount code
      }),
    });

    const virtualAccountData = await virtualAccountResponse.json();
    
    if (!virtualAccountData.status) {
      throw new Error(virtualAccountData.message || "Failed to create virtual account");
    }

    console.log("Virtual account created:", virtualAccountData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Virtual account created successfully",
        data: {
          account_number: virtualAccountData.data.account_number,
          account_name: virtualAccountData.data.account_name,
          bank_name: virtualAccountData.data.bank.name,
          customer_code: customerData.data.customer_code,
        }
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
    console.error("Error in create-virtual-account function:", error);
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