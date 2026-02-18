import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, fullName, propertyName, vibeCheckCode } = await req.json();

    // Log the lead for now — email sending can be configured later with SendGrid
    console.log(`New lead captured: ${fullName} from ${propertyName} (${email})`);
    console.log(`Vibe Check code: ${vibeCheckCode}`);
    console.log(`Lead ID: ${leadId}`);

    // TODO: Send confirmation email to property contact via SendGrid
    // TODO: Send notification email to sales team (WHITE_GLOVE_ADMIN_EMAILS)

    return new Response(
      JSON.stringify({ success: true, message: "Lead notification processed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing lead notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to process notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
