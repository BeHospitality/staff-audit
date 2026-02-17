import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Demo org IDs that use generated demo data
const DEMO_ORG_IDS = [
  "457b9a09-f8ed-415e-b2dd-8b87d75983a5", // Kilkea Castle
  "b1a2c3d4-e5f6-7890-abcd-ef1234567890", // Rose Hotel
  "c2b3d4e5-f6a7-8901-bcde-f12345678901", // Demo Property
];

function generateDemoResponses(orgId: string) {
  const now = new Date();
  const kitchen = [
    { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Head chef micromanages everything — no autonomy" },
    { department: "Kitchen", question_1_energy: 2, question_2_support: 1, question_3_growth: 3, question_4_spirit: 2, open_feedback: "Kitchen equipment constantly breaking, causes stress" },
    { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Communication breakdown between shifts" },
    { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Training materials need updating" },
    { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Chef goes extra mile during rush hour" },
    { department: "Kitchen", question_1_energy: 2, question_2_support: 1, question_3_growth: 2, question_4_spirit: 1, open_feedback: "No clear career progression in kitchen" },
    { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: null },
    { department: "Kitchen", question_1_energy: 1, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Broken equipment in the back slowing down service" },
  ];
  const foh = [
    { department: "Front of House", question_1_energy: 3, question_2_support: 4, question_3_growth: 3, question_4_spirit: 4, open_feedback: "FOH team has great collaboration" },
    { department: "Front of House", question_1_energy: 4, question_2_support: 3, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Management is trying to improve things" },
    { department: "Front of House", question_1_energy: 3, question_2_support: 4, question_3_growth: 4, question_4_spirit: 3, open_feedback: "No clear path for promotion in FOH" },
    { department: "Front of House", question_1_energy: 4, question_2_support: 4, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Great team spirit on weekends" },
    { department: "Front of House", question_1_energy: 3, question_2_support: 3, question_3_growth: 3, question_4_spirit: 4, open_feedback: null },
    { department: "Front of House", question_1_energy: 3, question_2_support: 4, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Would love more cross-training opportunities" },
    { department: "Front of House", question_1_energy: 4, question_2_support: 3, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Alex from concierge for exceptional guest service" },
  ];
  const hk = [
    { department: "Housekeeping", question_1_energy: 3, question_2_support: 3, question_3_growth: 3, question_4_spirit: 2, open_feedback: "Room inspection standards keep changing without notice" },
    { department: "Housekeeping", question_1_energy: 3, question_2_support: 3, question_3_growth: 2, question_4_spirit: 3, open_feedback: "Housekeeping team works alone, feels isolating" },
    { department: "Housekeeping", question_1_energy: 3, question_2_support: 3, question_3_growth: 3, question_4_spirit: 2, open_feedback: "Supplies are often low, makes the job harder" },
    { department: "Housekeeping", question_1_energy: 2, question_2_support: 3, question_3_growth: 2, question_4_spirit: 2, open_feedback: null },
  ];
  const all = [...kitchen, ...foh, ...hk];
  return all.map((r, i) => ({
    ...r,
    id: `demo-${orgId}-${i}`,
    organization_id: orgId,
    submitted_at: new Date(now.getTime() - (i % 7) * 86400000).toISOString(),
    is_demo_data: true,
  }));
}

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

    // Check if this is a demo org — serve generated demo data
    const isDemoOrg = DEMO_ORG_IDS.includes(dossier.organization_id);
    let responses;

    if (isDemoOrg) {
      responses = generateDemoResponses(dossier.organization_id);
    } else {
      const { data } = await supabase
        .from("pulse_responses")
        .select("*")
        .eq("organization_id", dossier.organization_id)
        .eq("is_demo_data", false);
      responses = data || [];
    }

    return new Response(
      JSON.stringify({
        org_name: org?.org_name || "Organization",
        responses,
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
