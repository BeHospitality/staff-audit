import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { generateDemoData, EMOJI_LABELS, type PulseResponse } from "@/data/demoData";
import { exportPDF } from "@/lib/pdfExport";
import { Activity, Copy, LogOut, Download, MessageCircle, AlertTriangle, Heart, Flame, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function avgScore(responses: PulseResponse[], key: keyof PulseResponse): number {
  const vals = responses.map((r) => r[key] as number).filter((v) => v != null);
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length / 5) * 100);
}

function scoreColor(score: number): string {
  if (score <= 40) return "text-destructive";
  if (score <= 70) return "text-primary";
  return "text-success";
}

function scoreBg(score: number): string {
  if (score <= 40) return "bg-destructive/10 border-destructive/30";
  if (score <= 70) return "bg-primary/10 border-primary/30";
  return "bg-success/10 border-success/30";
}

function scoreLabel(score: number): string {
  if (score <= 40) return "Critical";
  if (score <= 70) return "Moderate Risk";
  return "Healthy";
}

function emojiDist(responses: PulseResponse[], key: keyof PulseResponse, labels: string[]) {
  const counts = [0, 0, 0, 0, 0];
  let total = 0;
  responses.forEach((r) => {
    const v = r[key] as number | null;
    if (v != null) {
      counts[v - 1]++;
      total++;
    }
  });
  return labels.map((label, i) => ({
    label,
    count: counts[i],
    pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
  }));
}

export default function PulseDashboard() {
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [responses, setResponses] = useState<PulseResponse[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/pulse/login"); return; }
      setUser(session.user);

      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("manager_email", session.user.email)
        .single();

      if (orgData) {
        setOrg(orgData);
        const { data: resp } = await supabase
          .from("pulse_responses")
          .select("*")
          .eq("organization_id", orgData.id)
          .eq("is_demo_data", false);
        setResponses((resp as PulseResponse[]) || []);
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/pulse/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const displayResponses = useMemo(() => {
    if (demoMode) return generateDemoData(org?.id || "demo");
    let filtered = responses;
    if (dateFilter === "7") {
      const d = new Date(); d.setDate(d.getDate() - 7);
      filtered = responses.filter((r) => new Date(r.submitted_at) >= d);
    } else if (dateFilter === "30") {
      const d = new Date(); d.setDate(d.getDate() - 30);
      filtered = responses.filter((r) => new Date(r.submitted_at) >= d);
    }
    return filtered;
  }, [demoMode, responses, dateFilter, org]);

  const energy = avgScore(displayResponses, "question_1_energy");
  const support = avgScore(displayResponses, "question_2_support");
  const growth = avgScore(displayResponses, "question_3_growth");
  const spirit = avgScore(displayResponses, "question_4_spirit");

  const energyDist = emojiDist(displayResponses, "question_1_energy", EMOJI_LABELS.energy);
  const supportDist = emojiDist(displayResponses, "question_2_support", EMOJI_LABELS.support);
  const growthDist = emojiDist(displayResponses, "question_3_growth", EMOJI_LABELS.growth);
  const spiritDist = emojiDist(displayResponses, "question_4_spirit", EMOJI_LABELS.spirit);

  const departments = [...new Set(displayResponses.map((r) => r.department).filter(Boolean))] as string[];

  const exhaustedPct = displayResponses.length > 0
    ? Math.round(displayResponses.filter((r) => r.question_1_energy <= 2).length / displayResponses.length * 100)
    : 0;

  const feedbacks = displayResponses.map((r) => ({ text: r.open_feedback, dept: r.department, date: r.submitted_at })).filter((f) => f.text);
  const positiveFeedback = feedbacks.filter((f) => {
    const t = f.text!.toLowerCase();
    return t.includes("great") || t.includes("extra mile") || t.includes("exceptional") || t.includes("appreciated") || t.includes("spirit") || t.includes("pull together");
  });
  const frictionFeedback = feedbacks.filter((f) => !positiveFeedback.includes(f));

  const surveyLink = org ? `${window.location.origin}/pulse?org=${org.org_code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyLink);
    toast({ title: "Link copied!" });
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi team, please take 2 mins to complete our pulse survey: ${surveyLink}. Your honest feedback helps us improve.`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleExport = () => {
    const range = dateFilter === "7" ? "Last 7 Days" : dateFilter === "30" ? "Last 30 Days" : "All Time";
    exportPDF(org?.org_name || "Organization", displayResponses, range);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Nav */}
      <nav className="border-b border-border px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary text-sm">Be Connect</span>
          {org && <span className="text-muted-foreground text-sm hidden md:inline">| {org.org_name}</span>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {demoMode ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
            Demo
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{org?.org_name || "Organization"} Team Pulse</h1>
            <p className="text-muted-foreground text-sm mt-1">Employee sentiment & churn risk analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Stability Warning */}
        {exhaustedPct >= 40 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-destructive">STABILITY WARNING DETECTED</p>
              <p className="text-sm text-foreground mt-1">
                High Friction Detected at this Property. Over <strong>{exhaustedPct}%</strong> of the team reports 'Struggling' (😫😓). Immediate intervention is recommended to prevent turnover.
              </p>
            </div>
          </div>
        )}

        {/* Top Row: Deployment Hub + Response Counter */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Deployment Hub */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📤</span>
              <h3 className="font-bold">Share Your Team Link</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Send this link to your team to reach the 20-response milestone for full analysis.</p>
            <div className="flex gap-2 mb-3">
              <input
                readOnly
                value={surveyLink}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground"
              />
              <Button variant="gold" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleWhatsApp} className="w-full">
              <MessageCircle className="w-4 h-4 mr-1" /> Share via WhatsApp
            </Button>
          </div>

          {/* Response Counter */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-bold mb-2">Intelligence Loop</h3>
            <p className="text-3xl font-bold text-primary">{displayResponses.length}</p>
            <p className="text-sm text-muted-foreground">Employee Responses Collected</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Gathering Data</span>
                <span>Milestone: {Math.min(displayResponses.length, 20)}/20</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((displayResponses.length / 20) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {displayResponses.length >= 20
                  ? "✓ Full analysis unlocked"
                  : `Need ${20 - displayResponses.length} more responses for full sentiment analysis`}
              </p>
            </div>
          </div>
        </div>

        {/* Sentiment Snapshot */}
        <div>
          <h2 className="text-lg font-bold mb-4">Sentiment Snapshot</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { title: "Team Energy", score: energy, dist: energyDist },
              { title: "Management Support", score: support, dist: supportDist },
              { title: "Growth Potential", score: growth, dist: growthDist },
              { title: "Team Spirit", score: spirit, dist: spiritDist },
            ].map((card) => (
              <div key={card.title} className={`rounded-lg border p-4 ${scoreBg(card.score)}`}>
                <h3 className="text-sm font-bold mb-3">{card.title}</h3>
                <div className="space-y-1.5 mb-3">
                  {card.dist.map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-xs">
                      <span className="w-24 truncate">{d.label}</span>
                      <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground/30 rounded-full"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{d.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${scoreColor(card.score)}`}>{card.score}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                  <span className={`text-xs ml-auto font-medium ${scoreColor(card.score)}`}>({scoreLabel(card.score)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        {departments.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Department Breakdown</h2>
            <div className="bg-card border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-center p-3 font-medium">Responses</th>
                    <th className="text-center p-3 font-medium">Energy</th>
                    <th className="text-center p-3 font-medium">Support</th>
                    <th className="text-center p-3 font-medium">Growth</th>
                    <th className="text-center p-3 font-medium">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const dr = displayResponses.filter((r) => r.department === dept);
                    const de = avgScore(dr, "question_1_energy");
                    const ds = avgScore(dr, "question_2_support");
                    const dg = avgScore(dr, "question_3_growth");
                    const overall = Math.round((de + ds + dg) / 3);
                    return (
                      <tr key={dept} className="border-b border-border/50">
                        <td className="p-3 font-medium">{dept}</td>
                        <td className="p-3 text-center">{dr.length}</td>
                        <td className={`p-3 text-center font-medium ${scoreColor(de)}`}>{de}/100</td>
                        <td className={`p-3 text-center font-medium ${scoreColor(ds)}`}>{ds}/100</td>
                        <td className={`p-3 text-center font-medium ${scoreColor(dg)}`}>{dg}/100</td>
                        <td className={`p-3 text-center font-bold ${scoreColor(overall)}`}>{overall}/100</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Positive Highlights + Friction Feed */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Positive */}
          <div className="bg-card border border-success/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-success" />
              <h3 className="font-bold">What's Working Well</h3>
            </div>
            {positiveFeedback.length > 0 ? (
              <div className="space-y-3">
                {positiveFeedback.slice(0, 5).map((f, i) => (
                  <div key={i} className="text-sm border-l-2 border-success/40 pl-3">
                    <p className="text-foreground">"{f.text}"</p>
                    <p className="text-xs text-muted-foreground mt-1">— {f.dept || "Anonymous"}, {new Date(f.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No positive feedback yet.</p>
            )}
          </div>

          {/* Friction Feed */}
          <div className="bg-card border border-destructive/30 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-destructive" />
              <h3 className="font-bold">Radical Candor: Friction Feed</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <span className="bg-destructive/20 text-destructive text-[10px] px-1.5 py-0.5 rounded font-medium">Manager Eyes Only</span>
            </p>
            {frictionFeedback.length > 0 ? (
              <div className="space-y-3">
                {frictionFeedback.slice(0, 5).map((f, i) => (
                  <div key={i} className="text-sm border-l-2 border-destructive/40 pl-3">
                    <p className="text-foreground">"{f.text}"</p>
                    <p className="text-xs text-muted-foreground mt-1">— {f.dept || "Anonymous"}, {new Date(f.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No friction points reported.</p>
            )}
          </div>
        </div>

        {/* Efficiency Metric */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-bold">Efficiency Metric</h3>
              <p className="text-sm text-muted-foreground">Est. Manual Admin: <strong className="text-foreground">3-5 Hours/Week</strong></p>
              <p className="text-xs text-muted-foreground">Automated in Be Connect App.</p>
            </div>
          </div>
          <Button variant="gold" size="sm">Apply for Charter Selection</Button>
        </div>
      </main>
    </div>
  );
}
