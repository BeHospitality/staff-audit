import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generatePin, generateSalt, hashPin } from "@/utils/pinUtils";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import VibeScoreCard from "@/components/admin/VibeScoreCard";
import BreakdownTable from "@/components/admin/BreakdownTable";
import RiskFlags from "@/components/admin/RiskFlags";
import HubCTA from "@/components/admin/HubCTA";
import ConvertToClient from "@/components/admin/ConvertToClient";
import { Button } from "@/components/ui/button";
import { groupByField, type VibeResponse } from "@/utils/dossierCalculations";
import { Activity, ArrowLeft, Eye, EyeOff, Download, Link2, Loader2, Copy, CheckCircle2, X, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";

interface LeadData {
  id: string;
  property_name: string;
  full_name: string;
  email: string;
  phone: string;
  staff_count: number | null;
  turnover_rate: number | null;
  biggest_challenge: string | null;
  vibe_check_responses: number | null;
  created_at: string;
}

export default function DossierView() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadData | null>(null);
  const [responses, setResponses] = useState<VibeResponse[]>([]);
  const [shareable, setShareable] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const shareableRef = useRef<HTMLDivElement>(null);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ url: string; pin: string; expiresAt: string } | null>(null);
  const [generatingShare, setGeneratingShare] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    const load = async () => {
      const { data: leadData } = await supabase
        .from("leads")
        .select("id, property_name, full_name, email, phone, staff_count, turnover_rate, biggest_challenge, vibe_check_responses, created_at")
        .eq("id", leadId)
        .single();

      const { data: respData } = await (supabase as any)
        .from("vibe_check_responses")
        .select("*")
        .eq("lead_id", leadId);

      setLead(leadData as LeadData);
      setResponses((respData as unknown as VibeResponse[]) || []);

      // Check for existing share link
      const { data: existing } = await supabase
        .from("shared_reports" as any)
        .select("token")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (existing && (existing as any[]).length > 0) {
        setShareLink(`${window.location.origin}/report/${(existing as any[])[0].token}`);
      }

      setLoading(false);
    };
    load();
  }, [leadId]);

  const handleGenerateShareLink = async (regenerate = false) => {
    if (!lead) return;
    setGeneratingShare(true);

    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const rawPin = generatePin();
    const salt = generateSalt();
    const hash = await hashPin(rawPin, salt);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: { session } } = await supabase.auth.getSession();

    await supabase.from("shared_reports" as any).insert({
      lead_id: lead.id,
      token,
      created_by: session?.user.email || "admin",
      expires_at: expiresAt.toISOString(),
      pin_hash: hash,
      pin_salt: salt,
    });

    const url = `${window.location.origin}/report/${token}`;
    setShareLink(url);
    setShareModalData({
      url,
      pin: rawPin,
      expiresAt: expiresAt.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }),
    });
    setShowShareModal(true);
    setGeneratingShare(false);
  };

  const exportPDF = () => {
    if (!lead) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Confidential — Prepared for ${lead.property_name}`, w / 2, y, { align: "center" });
    y += 15;

    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text(`${lead.property_name}`, w / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Team Vibe Check Report", w / 2, y, { align: "center" });
    y += 5;
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), w / 2, y, { align: "center" });
    y += 15;

    const { calcOverallScores, questionLabels } = require("@/utils/dossierCalculations");
    const scores = calcOverallScores(responses);
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(`Overall Team Vibe: ${scores.overall} / 5.0 — ${scores.riskLevel}`, 20, y);
    y += 10;

    doc.setFontSize(10);
    const qScores = [scores.q1, scores.q2, scores.q3, scores.q4, scores.q5];
    questionLabels.forEach((label: string, i: number) => {
      doc.text(`Q${i + 1} — ${label}: ${qScores[i].toFixed(1)}`, 25, y);
      y += 6;
    });
    y += 10;

    const depts = groupByField(responses, "department");
    if (depts.length > 0) {
      doc.setFontSize(13);
      doc.text("Department Breakdown", 20, y);
      y += 8;
      doc.setFontSize(9);
      depts.forEach((seg) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${seg.label}: ${seg.overall.toFixed(1)}/5 (Q1:${seg.q1} Q2:${seg.q2} Q3:${seg.q3} Q4:${seg.q4} Q5:${seg.q5})`, 25, y);
        y += 5;
      });
      y += 10;
    }

    const { generateRiskFlags } = require("@/utils/dossierCalculations");
    const flags = generateRiskFlags(responses);
    if (flags.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text("Risk Flags", 20, y);
      y += 8;
      doc.setFontSize(9);
      flags.forEach((f: any) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`${f.severity === "red" ? "🔴" : "🟡"} ${f.text}`, w - 50);
        doc.text(lines, 25, y);
        y += lines.length * 5 + 3;
      });
    }

    doc.addPage();
    y = 30;
    doc.setFontSize(16);
    doc.text("What This Means — And What to Do Next", 20, y);
    y += 12;
    doc.setFontSize(10);
    const ctaText = [
      `Your data has identified ${flags.length} retention risk areas.`,
      "",
      "The Be Connect Charter Partner Hub gives you the tools to fix this:",
      "✓ DNA-based hiring that matches people to roles",
      `✓ Buddy matching for new starters (90-day retention: ${scores.q4.toFixed(1)}/5)`,
      "✓ Journey Blueprints that structure the first 90 days",
      "✓ Real-time engagement tracking",
      "",
      "Ready to talk? team@beconnect.ie | beconnect.ie",
    ];
    ctaText.forEach((line) => {
      doc.text(line, 25, y);
      y += 6;
    });

    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`${lead.property_name.replace(/\s+/g, "-")}-Team-Vibe-Report-${dateStr}.pdf`);
  };

  if (loading) {
    return (
      <AdminRouteGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AdminRouteGuard>
    );
  }

  if (!lead) {
    return (
      <AdminRouteGuard>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Lead not found.</p>
        </div>
      </AdminRouteGuard>
    );
  }

  const deptBreakdown = groupByField(responses, "department");
  const roleBreakdown = groupByField(responses, "role_level");
  const tenureBreakdown = groupByField(responses, "tenure");
  const empTypeBreakdown = groupByField(responses, "employment_type");
  const resp = lead.vibe_check_responses || 0;
  const staff = lead.staff_count || 0;
  const pct = staff > 0 ? Math.round((resp / staff) * 100) : 0;

  const annualCost = lead.staff_count && lead.turnover_rate
    ? Math.round(lead.staff_count * (lead.turnover_rate / 100) * 15000)
    : null;

  return (
    <AdminRouteGuard>
      <div className="min-h-screen">
        <nav className="border-b border-border px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dossier")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">{lead.property_name} — Dossier</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={shareable ? "default" : "outline"}
              size="sm"
              onClick={() => setShareable(!shareable)}
            >
              {shareable ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {shareable ? "Admin View" : "Shareable View"}
            </Button>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8" ref={shareableRef}>
          {/* Admin lead summary */}
          {!shareable && (
            <div className="bg-card border border-border rounded-lg p-5 md:p-6 space-y-3">
              <h2 className="text-xl font-bold">{lead.property_name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Contact:</span>{" "}
                  <span className="text-foreground">{lead.full_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="text-foreground">{lead.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span className="text-foreground">{lead.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Staff:</span>{" "}
                  <span className="text-foreground">{staff}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Turnover:</span>{" "}
                  <span className="text-foreground">{lead.turnover_rate || "—"}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <span className="text-foreground">{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {lead.biggest_challenge && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Biggest Challenge:</span>{" "}
                  <span className="text-foreground italic">"{lead.biggest_challenge}"</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Responses: {resp} of {staff} ({pct}%)</span>
                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                {pct >= 80 && <span className="text-sm">✅</span>}
              </div>
              {annualCost && (
                <p className="text-sm text-destructive font-medium">
                  Audit Cost: €{annualCost.toLocaleString()}/year (€{Math.round(annualCost / 365).toLocaleString()}/day)
                </p>
              )}
            </div>
          )}

          {/* Shareable header */}
          {shareable && (
            <div className="text-center space-y-2 pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Be Connect</p>
              <h1 className="text-2xl font-bold">{lead.property_name}</h1>
              <p className="text-muted-foreground">Team Vibe Check Report — {new Date().toLocaleDateString()}</p>
            </div>
          )}

          {responses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No vibe check responses yet. Share the survey link to start collecting data.
            </div>
          ) : (
            <>
              <VibeScoreCard responses={responses} />
              <BreakdownTable title="Department Breakdown" segments={deptBreakdown} shareable={shareable} />
              <BreakdownTable title="Role Level Breakdown" segments={roleBreakdown} shareable={shareable} />
              <BreakdownTable title="Tenure Breakdown" segments={tenureBreakdown} shareable={shareable} />
              <BreakdownTable title="Employment Type Breakdown" segments={empTypeBreakdown} shareable={shareable} />
              <RiskFlags responses={responses} />
              {shareable && (
                <HubCTA
                  responses={responses}
                  propertyName={lead.property_name}
                  staffCount={lead.staff_count}
                  turnoverRate={lead.turnover_rate}
                />
              )}
            </>
          )}

          {/* Share This Dossier section */}
          <div className="bg-card border border-border rounded-lg p-5 md:p-6 space-y-3">
            <h3 className="font-semibold">Share This Dossier</h3>
            <Button
              variant="gold"
              className="w-full"
              onClick={() => shareLink ? setShowShareModal(true) : handleGenerateShareLink()}
              disabled={generatingShare}
            >
              {generatingShare ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              {shareLink ? "View Shareable Link" : "Generate Shareable Link"}
            </Button>
            <button
              onClick={exportPDF}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 w-full text-center block"
            >
              Need a PDF copy? Export PDF ↓
            </button>
          </div>
        </main>
      </div>

      {/* Share Link Modal */}
      {showShareModal && shareModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">Shareable Link Created</span>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Link</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={shareModalData.url} className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground truncate" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(shareModalData.url); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Access PIN</label>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-mono font-bold text-primary tracking-[0.3em]">{shareModalData.pin}</div>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(shareModalData.pin); }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  ⚠️ Save this PIN now — it cannot be retrieved later. You'll share it with the property contact during your call.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">Expires: {shareModalData.expiresAt}</p>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowShareModal(false)}>
                  Done
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleGenerateShareLink(true)}
                  disabled={generatingShare}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminRouteGuard>
  );
}
