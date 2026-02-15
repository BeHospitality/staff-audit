import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Lock, CheckCircle2, ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMOJI_LABELS, type PulseResponse } from "@/data/demoData";

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

const SOLUTION_PROTOCOLS = [
  {
    icon: "⚙️",
    title: "How to Compress the Productivity Gap",
    brief: "Structured shadowing and onboarding protocols reduce new-hire ramp-up time by up to 60%. Without them, every new team member costs weeks of lost productivity.",
    diyCost: "25+ hours per new hire",
    hook: "Or let us handle it",
  },
  {
    icon: "🎯",
    title: "The Retention Early-Warning System",
    brief: "Weekly pulse tracking catches disengagement signals 4–6 weeks before resignations happen. Most managers only find out when it's too late.",
    diyCost: "3–5 hours/week",
    hook: "Or let us automate it",
  },
  {
    icon: "🔄",
    title: "The Ecosystem Transfer Protocol",
    brief: "Seasonal staff circulation between partner properties prevents total churn. Instead of losing trained staff, they rotate within your ecosystem and return stronger.",
    diyCost: "12+ hours per transition",
    hook: "Or we manage your ecosystem",
  },
];

export default function DossierPage() {
  const { code } = useParams<{ code: string }>();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [orgName, setOrgName] = useState("");
  const [responses, setResponses] = useState<PulseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [clientResponse, setClientResponse] = useState<string | null>(null);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("pulse_dossiers" as any)
        .select("id, unique_code, organization_id, client_response, created_at")
        .eq("unique_code", code)
        .single();

      if (!data) { setNotFound(true); setLoading(false); return; }
      setDossier(data);
      if ((data as any).client_response) setClientResponse((data as any).client_response);
      if ((data as any).created_at) setCreatedAt((data as any).created_at);
      setLoading(false);
    };
    load();
  }, [code]);

  const logAction = async (actionType: string) => {
    if (!dossier) return;
    await supabase.from("dossier_actions" as any).insert({
      dossier_id: (dossier as any).id,
      action_type: actionType,
    } as any);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier) return;
    setVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke("get-dossier", {
        body: { unique_code: code, pin },
      });

      if (error || !data || data.error) {
        setPinError(true);
        setVerifying(false);
        return;
      }

      setOrgName(data.org_name);
      setResponses(data.responses || []);
      if (data.client_response) setClientResponse(data.client_response);
      setUnlocked(true);
      logAction("pin_verified");
    } catch {
      setPinError(true);
    }
    setVerifying(false);
  };

  const handleClientResponse = async (response: "interested" | "passed") => {
    setClientResponse(response);
    await supabase
      .from("pulse_dossiers" as any)
      .update({ client_response: response } as any)
      .eq("id", (dossier as any).id);
    setResponseSubmitted(true);
    logAction(response === "interested" ? "cta_interested" : "cta_passed");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground">This dossier link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary">Be Connect</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-8">
            <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-1">Team Health Report</h1>
            <p className="text-sm text-muted-foreground mb-6">Enter your 6-digit PIN to view</p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(false); }}
                className={`w-full text-center text-3xl font-mono tracking-[0.5em] bg-secondary border rounded-lg px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${pinError ? "border-destructive" : "border-border"}`}
                placeholder="••••••"
              />
              {pinError && <p className="text-sm text-destructive">Incorrect PIN. Please try again.</p>}
              <Button variant="gold" type="submit" className="w-full" disabled={pin.length !== 6 || verifying}>
                {verifying ? "Verifying..." : "View Report"}
              </Button>
            </form>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secured by Be Connect Intelligence
          </p>
        </div>
      </div>
    );
  }

  // Unlocked — show report
  const energy = avgScore(responses, "question_1_energy");
  const support = avgScore(responses, "question_2_support");
  const growth = avgScore(responses, "question_3_growth");
  const spirit = avgScore(responses, "question_4_spirit");
  const overall = responses.length > 0 ? Math.round((energy + support + growth + spirit) / 4) : 0;

  const departments = [...new Set(responses.map((r) => r.department).filter(Boolean))] as string[];

  const feedbacks = responses.map((r) => ({ text: r.open_feedback, dept: r.department })).filter((f) => f.text);
  const positiveFeedback = feedbacks.filter((f) => {
    const t = f.text!.toLowerCase();
    return t.includes("great") || t.includes("extra mile") || t.includes("exceptional") || t.includes("appreciated") || t.includes("spirit") || t.includes("pull together");
  });
  const frictionFeedback = feedbacks.filter((f) => !positiveFeedback.includes(f));

  const emojiDist = (resps: PulseResponse[], key: keyof PulseResponse, labels: string[]) => {
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    resps.forEach((r) => { const v = r[key] as number | null; if (v != null) { counts[v - 1]++; total++; } });
    return labels.map((label, i) => ({ label, pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0 }));
  };

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-widest uppercase">Be Connect</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{orgName}</h1>
          <p className="text-lg text-muted-foreground">Team Health Report</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            {formattedDate && <span className="text-xs text-muted-foreground">{formattedDate}</span>}
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Confidential</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{responses.length} anonymous responses analyzed</p>
        </div>

        {/* Overall Health Score */}
        <div className={`rounded-xl border p-8 text-center ${scoreBg(overall)}`}>
          <p className="text-sm font-medium text-muted-foreground mb-2">Overall Health Score</p>
          <p className={`text-7xl font-bold ${scoreColor(overall)}`}>
            {overall}<span className="text-2xl text-muted-foreground">/100</span>
          </p>
          <p className={`text-lg font-medium mt-2 ${scoreColor(overall)}`}>{scoreLabel(overall)}</p>
        </div>

        {/* Sentiment Cards */}
        <div>
          <h2 className="text-lg font-bold mb-4">Sentiment Snapshot</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Team Energy", score: energy, dist: emojiDist(responses, "question_1_energy", EMOJI_LABELS.energy) },
              { title: "Management Support", score: support, dist: emojiDist(responses, "question_2_support", EMOJI_LABELS.support) },
              { title: "Growth Potential", score: growth, dist: emojiDist(responses, "question_3_growth", EMOJI_LABELS.growth) },
              { title: "Team Spirit", score: spirit, dist: emojiDist(responses, "question_4_spirit", EMOJI_LABELS.spirit) },
            ].map((card) => (
              <div key={card.title} className={`rounded-lg border p-4 ${scoreBg(card.score)}`}>
                <h3 className="text-sm font-bold mb-3">{card.title}</h3>
                <div className="space-y-1.5 mb-3">
                  {card.dist.map((d) => (
                    <div key={d.label} className="flex items-center gap-2 text-xs">
                      <span className="w-24 truncate">{d.label}</span>
                      <div className="flex-1 h-3 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full bg-foreground/30 rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{d.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${scoreColor(card.score)}`}>{card.score}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
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
                    <th className="text-center p-3 font-medium">Health Score</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const dr = responses.filter((r) => r.department === dept);
                    const de = avgScore(dr, "question_1_energy");
                    const ds = avgScore(dr, "question_2_support");
                    const dg = avgScore(dr, "question_3_growth");
                    const deptOverall = Math.round((de + ds + dg) / 3);
                    return (
                      <tr key={dept} className="border-b border-border/50">
                        <td className="p-3 font-medium">{dept}</td>
                        <td className="p-3 text-center">{dr.length}</td>
                        <td className={`p-3 text-center font-bold ${scoreColor(deptOverall)}`}>{deptOverall}/100</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            deptOverall <= 40 ? "bg-destructive/20 text-destructive" :
                            deptOverall <= 70 ? "bg-primary/20 text-primary" :
                            "bg-success/20 text-success"
                          }`}>{scoreLabel(deptOverall)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Friction Points */}
        {frictionFeedback.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Key Issues Detected</h2>
            <div className="space-y-3">
              {frictionFeedback.slice(0, 5).map((f, i) => (
                <div key={i} className="bg-card border border-destructive/20 rounded-lg p-4 text-sm flex gap-3">
                  <span className="text-destructive font-bold mt-0.5">•</span>
                  <div>
                    <p className="text-foreground">"{f.text}"</p>
                    <p className="text-xs text-muted-foreground mt-1">— {f.dept || "Anonymous"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Highlights */}
        {positiveFeedback.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Positive Highlights</h2>
            <div className="space-y-3">
              {positiveFeedback.slice(0, 5).map((f, i) => (
                <div key={i} className="bg-card border border-success/20 rounded-lg p-4 text-sm flex gap-3">
                  <span className="text-success font-bold mt-0.5">•</span>
                  <div>
                    <p className="text-foreground">"{f.text}"</p>
                    <p className="text-xs text-muted-foreground mt-1">— {f.dept || "Anonymous"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution Protocols */}
        <div>
          <h2 className="text-lg font-bold mb-2">Solution Protocols</h2>
          <p className="text-sm text-muted-foreground mb-4">Proven frameworks for addressing the issues above</p>
          <div className="space-y-3">
            {SOLUTION_PROTOCOLS.map((protocol, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    setExpandedProtocol(expandedProtocol === i ? null : i);
                    logAction(`protocol_expand_${i}`);
                  }}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{protocol.icon}</span>
                    <span className="font-semibold text-sm">{protocol.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedProtocol === i ? "rotate-180" : ""}`} />
                </button>
                {expandedProtocol === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/50 animate-fade-in">
                    <p className="text-sm text-muted-foreground mt-3 mb-3">{protocol.brief}</p>
                    <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">DIY Cost</p>
                        <p className="text-sm font-bold text-foreground">{protocol.diyCost}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">{protocol.hook}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card border border-primary/30 rounded-xl p-8 text-center">
          {responseSubmitted || clientResponse ? (
            <div className="animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">
                {clientResponse === "interested" ? "We'll contact you shortly" : "Thank you for reviewing"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {clientResponse === "interested"
                  ? "A Be Connect specialist will reach out to discuss solutions tailored to your team's needs."
                  : "We appreciate you taking the time to review this report."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">Total cost of managing this yourself</p>
              <p className="text-3xl font-bold text-foreground mb-1">400+ hours/year</p>
              <p className="text-sm text-muted-foreground mb-6">
                vs. <span className="text-primary font-semibold">Let Be Connect handle it — €24,000/year</span>
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => { handleClientResponse("interested"); logAction("cta_book_consultation"); }}
                >
                  Book Free Consultation
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { logAction("cta_learn_more"); window.open("https://beconnect.ie", "_blank"); }}
                >
                  Learn More
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-8">
          Powered by Be Connect Intelligence — Operational Stability Solutions
        </p>
      </div>
    </div>
  );
}
