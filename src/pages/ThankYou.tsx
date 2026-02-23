import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Activity, CheckCircle, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AuditResultsSummary from "@/components/thankyou/AuditResultsSummary";
import VibeCheckLinkSection from "@/components/thankyou/VibeCheckLinkSection";
import ResponseTracker from "@/components/thankyou/ResponseTracker";

interface LeadData {
  id: string;
  full_name: string;
  property_name: string;
  email: string;
  staff_count: number | null;
  turnover_rate: number | null;
  vibe_check_code: string | null;
  vibe_check_responses: number | null;
  vibe_check_total_staff: number | null;
}

export default function ThankYou() {
  const navigate = useNavigate();
  const { leadId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const leadId = paramId || searchParams.get("id");

  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(!!leadId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    (async () => {
      const { data, error } = await supabase
        .from("leads" as any)
        .select("id, full_name, property_name, email, staff_count, turnover_rate, vibe_check_code, vibe_check_responses, vibe_check_total_staff")
        .eq("id", leadId)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setLead(data as any);
      }
      setLoading(false);
    })();
  }, [leadId]);

  // Generic fallback
  if (!leadId || notFound) {
    return (
      <PageShell navigate={navigate}>
        <div className="text-center max-w-lg mx-auto animate-fade-in space-y-4">
          <CheckCircle className="w-14 h-14 text-success mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Thank You!</h1>
          <p className="text-muted-foreground leading-relaxed">
            We've received your details. Our team will be in touch within 7 working days with your personalised report.
          </p>
          <p className="text-muted-foreground text-sm">
            If you have any questions, contact us at{" "}
            <a href="mailto:team@beconnect.ie" className="text-primary hover:underline">team@beconnect.ie</a>
          </p>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell navigate={navigate}>
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </PageShell>
    );
  }

  const staffTotal = lead!.vibe_check_total_staff || lead!.staff_count || null;

  return (
    <PageShell navigate={navigate}>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Section 1: Confirmation Header */}
        <div className="text-center space-y-3">
          <CheckCircle className="w-14 h-14 text-success mx-auto" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            ✅ Your Staff Audit is Complete
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Thank you for completing your property's Staff Audit
            {lead!.full_name ? `, ${lead!.full_name}` : ""}.
            We've captured your details and your team's unique Vibe Check link is below.
          </p>
        </div>

        {/* Section 2: Audit Results */}
        <AuditResultsSummary staffCount={lead!.staff_count} turnoverRate={lead!.turnover_rate} />

        {/* Section 3: Vibe Check Link */}
        <VibeCheckLinkSection
          vibeCheckCode={lead!.vibe_check_code}
          propertyName={lead!.property_name}
          fullName={lead!.full_name}
          email={lead!.email}
        />

        {/* Section 4: Response Tracker */}
        <ResponseTracker
          leadId={lead!.id}
          initialResponses={lead!.vibe_check_responses ?? 0}
          staffCount={staffTotal}
        />

        {/* Section 5: What Happens Next */}
        <div className="space-y-4 px-1 border-t border-border/30 pt-8">
          <p className="text-lg font-semibold text-foreground">📞 What Happens Next?</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our team will review your results and be in touch <span className="font-semibold text-foreground">within 7 working days</span> with a personalised update on your property's retention health.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you'd like to fast-track your consultation:
          </p>
          <Button
            variant="gold"
            size="lg"
            className="w-full md:w-auto text-base px-8 py-5 shadow-lg shadow-primary/20"
            onClick={() => window.open("https://calendar.app.google/jnoS2WB8um1GHo1S9", "_blank", "noopener,noreferrer")}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book a Strategy Session →
          </Button>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
            <span>Questions? We're here to help.</span>
            <a href="mailto:team@beconnect.ie" className="text-primary hover:underline flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> team@beconnect.ie
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ navigate, children }: { navigate: (path: string) => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary text-lg tracking-wide">Be Connect</span>
        </div>
      </nav>

      <div className="flex-1 px-4 md:px-6 py-8 md:py-12">
        {children}
      </div>

      <footer className="border-t border-border/30 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Be Connect</span>
        </div>
        <p className="text-xs text-muted-foreground">Staff Audit Pulse™ — Understand your team before they leave.</p>
      </footer>
    </div>
  );
}
