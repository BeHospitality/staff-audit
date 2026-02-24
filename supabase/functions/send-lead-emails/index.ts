import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendBrevoEmail(payload: Record<string, unknown>) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Brevo error:", JSON.stringify(data));
  }
  return { status: res.status, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      contactName,
      contactEmail,
      propertyName,
      vibeCheckLink,
      phone,
      staffCount,
      turnoverRate,
      vibeCheckCode,
    } = await req.json();

    console.log(`Processing lead emails for ${contactName} at ${propertyName}`);

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // EMAIL 1: Confirmation to the lead
    const confirmationPayload = {
      sender: { name: "Be Connect", email: "hello@be.ie" },
      to: [{ email: contactEmail, name: contactName }],
      subject: `Your Staff Audit Results — ${propertyName}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Be Connect</h1>
          </div>
          
          <h2 style="color: #1a1a2e;">Hi ${contactName},</h2>
          
          <p>Thank you for completing the Staff Audit for <strong>${propertyName}</strong>.</p>
          
          <p>We've received your details and our team will review your results. You'll hear from us within <strong>7 working days</strong> with a personalised update on your property's retention health.</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Your Team's Vibe Check Link</h3>
            <p>Share this link with your team to get anonymous feedback on how they're really feeling:</p>
            <div style="background: #1a1a2e; border-radius: 6px; padding: 15px; text-align: center;">
              <a href="${vibeCheckLink}" style="color: #f59e0b; font-size: 16px; word-break: break-all; text-decoration: none;">${vibeCheckLink}</a>
            </div>
            <p style="font-size: 13px; color: #666; margin-bottom: 0;">Each person takes a 2-minute anonymous pulse check. We need 80%+ response rate for accurate results.</p>
          </div>
          
          <p>Want to fast-track your consultation?</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1qGGbFMhT-B5Rj7I8GxsflFHrbjF9KO-K_BVK8749yJtT_6yFB2Jf_TQRBd9bTGFUh7g60AHIT" 
               style="background: #f59e0b; color: #1a1a2e; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Book a Strategy Session →
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Be Connect — The Talent Concierge for Hospitality<br>
            hello@be.ie | be.ie
          </p>
        </div>
      `,
    };

    // EMAIL 2: Internal notification to Be Connect team
    const internalPayload = {
      sender: { name: "Staff Audit", email: "hello@be.ie" },
      to: [{ email: "hello@be.ie", name: "Be Connect Team" }],
      subject: `New Staff Audit Lead: ${propertyName}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a2e;">New Lead from Staff Audit</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Property:</td><td style="padding: 8px;">${propertyName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Contact:</td><td style="padding: 8px;">${contactName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${contactEmail}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phone || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Staff Count:</td><td style="padding: 8px;">${staffCount || "Not provided"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Turnover Rate:</td><td style="padding: 8px;">${turnoverRate ? turnoverRate + "%" : "Not sure"}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Vibe Check Code:</td><td style="padding: 8px;">${vibeCheckCode}</td></tr>
          </table>
          <div style="margin: 20px 0;">
            <p><strong>Vibe Check Link:</strong> <a href="${vibeCheckLink}">${vibeCheckLink}</a></p>
            <p><strong>Admin Dashboard:</strong> <a href="https://staff-audit.be.ie/admin">https://staff-audit.be.ie/admin</a></p>
          </div>
          <p style="color: #e74c3c; font-weight: bold;">Action: Follow up within 7 working days.</p>
        </div>
      `,
    };

    // Send both emails concurrently
    const [confirmResult, internalResult] = await Promise.all([
      sendBrevoEmail(confirmationPayload),
      sendBrevoEmail(internalPayload),
    ]);

    console.log("Confirmation email:", confirmResult.status);
    console.log("Internal email:", internalResult.status);

    return new Response(
      JSON.stringify({ success: true, confirmation: confirmResult, internal: internalResult }),
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
