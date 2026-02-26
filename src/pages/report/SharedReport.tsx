import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import VibeScoreCard from "@/components/admin/VibeScoreCard";
import BreakdownTable from "@/components/admin/BreakdownTable";
import RiskFlags from "@/components/admin/RiskFlags";
import HubCTA from "@/components/admin/HubCTA";
import { groupByField, type VibeResponse } from "@/utils/dossierCalculations";
import { Loader2, Lock } from "lucide-react";

export default function SharedReport() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [propertyName, setPropertyName] = useState("");
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [turnoverRate, setTurnoverRate] = useState<number | null>(null);
  const [responses, setResponses] = useState<VibeResponse[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      // Look up shared report by token
      const { data: report, error } = await supabase
        .from("shared_reports" as any)
        .select("lead_id, expires_at")
        .eq("token", token)
        .single();

      if (error || !report) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const r = report as any;
      if (r.expires_at && new Date(r.expires_at) < new Date()) {
        setExpired(true);
        setLoading(false);
        return;
      }

      // Fetch lead info via RPC (no direct table access needed for public)
      const { data: leadData } = await supabase
        .from("leads")
        .select("property_name, staff_count, turnover_rate")
        .eq("id", r.lead_id)
        .single();

      if (leadData) {
        setPropertyName(leadData.property_name);
        setStaffCount(leadData.staff_count);
        setTurnoverRate(leadData.turnover_rate);
      }

      // Fetch responses via edge function or RPC since anon can't read vibe_check_responses
      // For now, use an edge function approach. Since we need the data, let's use the get-dossier pattern
      // Actually, shared reports are read by authenticated admins who generated them, and the public
      // page needs the data. We'll fetch via a function.
      // WORKAROUND: use supabase function to get aggregated data
      const { data: respData } = await supabase.functions.invoke("get-vibe-responses", {
        body: { lead_id: r.lead_id },
      });

      setResponses((respData?.responses as VibeResponse[]) || []);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-3">Report Not Found</h1>
          <p className="text-muted-foreground">This report link is not valid. Contact Be Connect for access.</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-3">Report Expired</h1>
          <p className="text-muted-foreground">This report has expired. Contact Be Connect for access.</p>
          <p className="text-sm text-muted-foreground mt-2">📧 team@beconnect.ie</p>
        </div>
      </div>
    );
  }

  const deptBreakdown = groupByField(responses, "department");
  const roleBreakdown = groupByField(responses, "role_level");
  const tenureBreakdown = groupByField(responses, "tenure");
  const empTypeBreakdown = groupByField(responses, "employment_type");

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <div className="text-center space-y-2 pt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Be Connect</p>
          <h1 className="text-2xl font-bold">{propertyName}</h1>
          <p className="text-muted-foreground">Team Vibe Check Report — {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">Confidential — Prepared for {propertyName}</p>
        </div>

        {responses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No data available for this report.
          </div>
        ) : (
          <>
            <VibeScoreCard responses={responses} />
            <BreakdownTable title="Department Breakdown" segments={deptBreakdown} shareable />
            <BreakdownTable title="Role Level Breakdown" segments={roleBreakdown} shareable />
            <BreakdownTable title="Tenure Breakdown" segments={tenureBreakdown} shareable />
            <BreakdownTable title="Employment Type Breakdown" segments={empTypeBreakdown} shareable />
            <RiskFlags responses={responses} />
            <HubCTA
              responses={responses}
              propertyName={propertyName}
              staffCount={staffCount}
              turnoverRate={turnoverRate}
            />
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-6">
          <Lock className="w-3.5 h-3.5" />
          <span>Powered by Be Connect — Confidential</span>
        </div>
      </main>
    </div>
  );
}
