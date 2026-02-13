import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { unique_code, pin } = await req.json();

    if (!unique_code || !pin) {
      return new Response(JSON.stringify({ error: "Missing code or pin" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify dossier and PIN
    const { data: dossier, error: dossierError } = await supabase
      .from("pulse_dossiers")
      .select("*")
      .eq("unique_code", unique_code)
      .single();

    if (dossierError || !dossier) {
      return new Response(JSON.stringify({ error: "Dossier not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (dossier.pin_code !== pin) {
      return new Response(JSON.stringify({ error: "Invalid PIN" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Track view
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      view_count: (dossier.view_count || 0) + 1,
      last_viewed_at: now,
    };
    if (!dossier.first_viewed_at) {
      updates.first_viewed_at = now;
    }
    await supabase
      .from("pulse_dossiers")
      .update(updates)
      .eq("id", dossier.id);

    // Get org name
    const { data: org } = await supabase
      .from("organizations")
      .select("org_name")
      .eq("id", dossier.organization_id)
      .single();

    // Get responses using service role (bypasses RLS)
    const { data: responses } = await supabase
      .from("pulse_responses")
      .select("*")
      .eq("organization_id", dossier.organization_id)
      .eq("is_demo_data", false);

    return new Response(
      JSON.stringify({
        org_name: org?.org_name || "Organization",
        responses: responses || [],
        client_response: dossier.client_response,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
