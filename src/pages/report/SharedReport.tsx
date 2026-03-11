import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hashPin } from "@/utils/pinUtils";
import PinEntry from "@/components/report/PinEntry";
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

  // PIN gate state
  const [needsPin, setNeedsPin] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [reportData, setReportData] = useState<{
    leadId: string;
    pinHash: string | null;
    pinSalt: string | null;
  } | null>(null);

  // Report data
  const [propertyName, setPropertyName] = useState("");
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [turnoverRate, setTurnoverRate] = useState<number | null>(null);
  const [responses, setResponses] = useState<VibeResponse[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const { data: report, error } = await supabase
        .from("shared_reports" as any)
        .select("lead_id, expires_at, pin_hash, pin_salt")
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

      // If report has a PIN, show PIN entry first
      if (r.pin_hash) {
        setReportData({ leadId: r.lead_id, pinHash: r.pin_hash, pinSalt: r.pin_salt });
        // Fetch just the property name for the PIN screen using secure RPC
        const { data: leadData } = await supabase.rpc("get_lead_report_data", {
          p_lead_id: r.lead_id,
        });
        const leadRow = Array.isArray(leadData) ? leadData[0] : leadData;
        if (leadRow) setPropertyName(leadRow.property_name);
        setNeedsPin(true);
        setLoading(false);
        return;
      }

      // No PIN — load report directly (legacy links)
      await loadReportData(r.lead_id);
    };
    load();
  }, [token]);

  const loadReportData = async (leadId: string) => {
    const { data: leadData } = await supabase.rpc("get_lead_report_data", {
      p_lead_id: leadId,
    });
    const leadRow = Array.isArray(leadData) ? leadData[0] : leadData;

    if (leadRow) {
      setPropertyName(leadRow.property_name);
      setStaffCount(leadRow.staff_count);
      setTurnoverRate(leadRow.turnover_rate);
    }

    const { data: respData } = await supabase.functions.invoke("get-vibe-responses", {
      body: { lead_id: leadId },
    });

    setResponses((respData?.responses as VibeResponse[]) || []);
    setPinVerified(true);
    setNeedsPin(false);
    setLoading(false);
  };

  const handlePinSubmit = async (enteredPin: string): Promise<boolean> => {
    if (!reportData?.pinHash || !reportData?.pinSalt) return false;
    const hash = await hashPin(enteredPin, reportData.pinSalt);
    if (hash === reportData.pinHash) {
      setLoading(true);
      await loadReportData(reportData.leadId);
      return true;
    }
    return false;
  };

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

  if (needsPin && !pinVerified) {
    return <PinEntry propertyName={propertyName} onSubmit={handlePinSubmit} />;
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
