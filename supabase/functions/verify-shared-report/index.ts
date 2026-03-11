import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, pin } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the shared report by token
    const { data: report, error: reportError } = await supabase
      .from("shared_reports")
      .select("lead_id, expires_at, pin_hash, pin_salt")
      .eq("token", token)
      .single();

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: "not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get property name (always returned for the PIN screen)
    const { data: leadData } = await supabase.rpc("get_lead_report_data", {
      p_lead_id: report.lead_id,
    });
    const leadRow = Array.isArray(leadData) ? leadData[0] : leadData;
    const propertyName = leadRow?.property_name || "";

    // If report has a PIN and no PIN was provided, tell client to show PIN entry
    if (report.pin_hash && !pin) {
      return new Response(
        JSON.stringify({ needs_pin: true, property_name: propertyName }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If report has a PIN, verify it server-side
    if (report.pin_hash && report.pin_salt && pin) {
      const computedHash = await hashPin(pin, report.pin_salt);
      if (computedHash !== report.pin_hash) {
        return new Response(
          JSON.stringify({ error: "invalid_pin" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // PIN verified (or no PIN required) — return full report data
    const staffCount = leadRow?.staff_count || null;
    const turnoverRate = leadRow?.turnover_rate || null;

    // Get vibe check responses
    const { data: responses } = await supabase
      .from("vibe_check_responses")
      .select("*")
      .eq("lead_id", report.lead_id);

    return new Response(
      JSON.stringify({
        verified: true,
        property_name: propertyName,
        staff_count: staffCount,
        turnover_rate: turnoverRate,
        responses: responses || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
