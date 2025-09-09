import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, table, record, old_record } = await req.json();

    // Only handle INSERT operations on auth.users table
    if (type === "INSERT" && table === "users" && record) {
      const { id, email, user_metadata } = record;
      
      console.log("New user created:", { id, email, user_metadata });

      // Check if user profile already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (!existingUser) {
        // Create user profile in users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: id,
            email: email,
            username: user_metadata?.username || `user_${id.slice(0, 8)}`,
            full_name: user_metadata?.full_name || 'User',
            phone_number: user_metadata?.phone_number || '',
            referral_code: user_metadata?.referral_code || null,
            transaction_pin: user_metadata?.transaction_pin || '',
            password_hash: '', // Handled by auth
            balance: 0,
            is_active: true,
            // Virtual account fields - will be populated later
            paystack_account_number: user_metadata?.paystack_account_number || null,
            paystack_account_name: user_metadata?.paystack_account_name || null,
            paystack_bank_name: user_metadata?.paystack_bank_name || null,
            virtual_account_number: user_metadata?.virtual_account_number || null,
            virtual_account_bank: user_metadata?.virtual_account_bank || null,
          });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          throw insertError;
        }

        console.log("User profile created successfully for:", id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in handle-new-user webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});