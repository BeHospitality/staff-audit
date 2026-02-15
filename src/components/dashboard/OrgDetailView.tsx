import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EMOJI_LABELS, type PulseResponse, generateDemoData } from "@/data/demoData";
import { exportPDF } from "@/lib/pdfExport";
import { ArrowLeft, Download, Copy, MessageCircle, FileText, Heart, Flame } from "lucide-react";
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
    if (v != null) { counts[v - 1]++; total++; }
  });
  return labels.map((label, i) => ({
    label, count: counts[i], pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
  }));
}

interface Props {
  orgId: string;
  orgName: string;
  orgCode: string;
  onBack: () => void;
  onGenerateDossier: () => void;
  demoMode?: boolean;
}

export default function OrgDetailView({ orgId, orgName, orgCode, onBack, onGenerateDossier, demoMode = false }: Props) {
  const [responses, setResponses] = useState<PulseResponse[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (demoMode) {
      setResponses(generateDemoData(orgId));
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    supabase
      .from("pulse_responses")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_demo_data", false)
      .then(({ data }) => {
        setResponses((data as PulseResponse[]) || []);
        setLoadingData(false);
      });
  }, [orgId, demoMode]);

  const filtered = useMemo(() => {
    if (dateFilter === "7") {
      const d = new Date(); d.setDate(d.getDate() - 7);
      return responses.filter((r) => new Date(r.submitted_at) >= d);
    }
    if (dateFilter === "30") {
      const d = new Date(); d.setDate(d.getDate() - 30);
      return responses.filter((r) => new Date(r.submitted_at) >= d);
    }
    return responses;
  }, [responses, dateFilter]);

  const energy = avgScore(filtered, "question_1_energy");
  const support = avgScore(filtered, "question_2_support");
  const growth = avgScore(filtered, "question_3_growth");
  const spirit = avgScore(filtered, "question_4_spirit");
  const overall = filtered.length > 0 ? Math.round((energy + support + growth + spirit) / 4) : 0;

  const energyDist = emojiDist(filtered, "question_1_energy", EMOJI_LABELS.energy);
  const supportDist = emojiDist(filtered, "question_2_support", EMOJI_LABELS.support);
  const growthDist = emojiDist(filtered, "question_3_growth", EMOJI_LABELS.growth);
  const spiritDist = emojiDist(filtered, "question_4_spirit", EMOJI_LABELS.spirit);

  const departments = [...new Set(filtered.map((r) => r.department).filter(Boolean))] as string[];

  const feedbacks = filtered.map((r) => ({ text: r.open_feedback, dept: r.department, date: r.submitted_at })).filter((f) => f.text);
  const positiveFeedback = feedbacks.filter((f) => {
    const t = f.text!.toLowerCase();
    return t.includes("great") || t.includes("extra mile") || t.includes("exceptional") || t.includes("appreciated") || t.includes("spirit") || t.includes("pull together");
  });
  const frictionFeedback = feedbacks.filter((f) => !positiveFeedback.includes(f));

  const surveyLink = `${window.location.origin}/pulse/survey?org=${orgCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyLink);
    toast({ title: "Link copied!" });
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi team, please take 2 mins to complete our pulse survey: ${surveyLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleExport = () => {
    const range = dateFilter === "7" ? "Last 7 Days" : dateFilter === "30" ? "Last 30 Days" : "All Time";
    exportPDF(orgName, filtered, range);
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-4 md:px-8 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="hover-scale">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <span className="font-bold text-primary text-sm">{orgName}</span>
        {demoMode && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium animate-pulse">Demo Mode</span>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">{orgName} — Pulse Analysis</h1>
            <p className="text-muted-foreground text-sm">
              {loadingData ? "Loading..." : `${filtered.length} responses`}
              {demoMode && " (demo data)"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExport} className="hover-scale"><Download className="w-4 h-4 mr-1" /> PDF</Button>
            <Button variant="gold" size="sm" onClick={onGenerateDossier} className="hover-scale"><FileText className="w-4 h-4 mr-1" /> Dossier</Button>
          </div>
        </div>

        {/* No responses state */}
        {!loadingData && filtered.length === 0 && !demoMode && (
          <div className="bg-card border border-border rounded-lg p-12 text-center animate-fade-in">
            <p className="text-lg font-medium mb-2">No responses yet</p>
            <p className="text-muted-foreground text-sm mb-4">Share your pulse survey link with your team to start collecting feedback.</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="w-4 h-4 mr-1" /> Copy Link</Button>
              <Button variant="gold" size="sm" onClick={handleWhatsApp}><MessageCircle className="w-4 h-4 mr-1" /> Share on WhatsApp</Button>
            </div>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            {/* Survey Link */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 animate-fade-in">
              <span className="text-sm font-medium">Survey Link:</span>
              <input readOnly value={surveyLink} className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground" />
              <Button variant="outline" size="sm" onClick={handleCopy} className="hover-scale"><Copy className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleWhatsApp} className="hover-scale"><MessageCircle className="w-4 h-4" /></Button>
            </div>

            {/* Overall Health */}
            <div className={`rounded-lg border p-6 text-center animate-fade-in ${scoreBg(overall)}`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall Health Score</p>
              <p className={`text-5xl font-bold ${scoreColor(overall)}`}>{overall}<span className="text-xl text-muted-foreground">/100</span></p>
              <p className={`text-sm font-medium mt-1 ${scoreColor(overall)}`}>{scoreLabel(overall)}</p>
            </div>

            {/* Sentiment Cards */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { title: "Team Energy", score: energy, dist: energyDist },
                { title: "Management Support", score: support, dist: supportDist },
                { title: "Growth Potential", score: growth, dist: growthDist },
                { title: "Team Spirit", score: spirit, dist: spiritDist },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className={`rounded-lg border p-4 transition-transform duration-200 hover:scale-[1.02] ${scoreBg(card.score)} animate-fade-in`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <h3 className="text-sm font-bold mb-3">{card.title}</h3>
                  <div className="space-y-1.5 mb-3">
                    {card.dist.map((d) => (
                      <div key={d.label} className="flex items-center gap-2 text-xs">
                        <span className="w-24 truncate">{d.label}</span>
                        <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground/30 rounded-full transition-all duration-700 ease-out"
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

            {/* Department Breakdown */}
            {departments.length > 0 && (
              <div className="animate-fade-in">
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
                        const dr = filtered.filter((r) => r.department === dept);
                        const de = avgScore(dr, "question_1_energy");
                        const ds = avgScore(dr, "question_2_support");
                        const dg = avgScore(dr, "question_3_growth");
                        const deptOverall = Math.round((de + ds + dg) / 3);
                        return (
                          <tr key={dept} className="border-b border-border/50">
                            <td className="p-3 font-medium">{dept}</td>
                            <td className="p-3 text-center">{dr.length}</td>
                            <td className={`p-3 text-center font-medium ${scoreColor(de)}`}>{de}/100</td>
                            <td className={`p-3 text-center font-medium ${scoreColor(ds)}`}>{ds}/100</td>
                            <td className={`p-3 text-center font-medium ${scoreColor(dg)}`}>{dg}/100</td>
                            <td className={`p-3 text-center font-bold ${scoreColor(deptOverall)}`}>{deptOverall}/100</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card border border-success/30 rounded-lg p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-success" />
                  <h3 className="font-bold">Positive Highlights</h3>
                </div>
                {positiveFeedback.length > 0 ? (
                  <div className="space-y-3">
                    {positiveFeedback.slice(0, 5).map((f, i) => (
                      <div key={i} className="text-sm border-l-2 border-success/40 pl-3">
                        <p className="text-foreground">"{f.text}"</p>
                        <p className="text-xs text-muted-foreground mt-1">— {f.dept || "Anonymous"}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No positive feedback yet.</p>}
              </div>

              <div className="bg-card border border-destructive/30 rounded-lg p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-destructive" />
                  <h3 className="font-bold">Friction Feed</h3>
                </div>
                {frictionFeedback.length > 0 ? (
                  <div className="space-y-3">
                    {frictionFeedback.slice(0, 5).map((f, i) => (
                      <div key={i} className="text-sm border-l-2 border-destructive/40 pl-3">
                        <p className="text-foreground">"{f.text}"</p>
                        <p className="text-xs text-muted-foreground mt-1">— {f.dept || "Anonymous"}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No friction points reported.</p>}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
