import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EMOJI_LABELS, DEPARTMENTS } from "@/data/demoData";
import { Activity, CheckCircle2 } from "lucide-react";

const questions = [
  { key: "energy" as const, title: "Team Energy", question: "How would you describe your energy level at work this week?" },
  { key: "support" as const, title: "Management Support", question: "How supported do you feel by your manager?" },
  { key: "growth" as const, title: "Growth Potential", question: "Do you see opportunities to grow here?" },
  { key: "spirit" as const, title: "Team Spirit", question: "How connected do you feel to your team?" },
];

export default function PulseSurvey() {
  const [searchParams] = useSearchParams();
  const orgCode = searchParams.get("org") || "kilkea-castle";
  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [department, setDepartment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check localStorage for recent submission
  useEffect(() => {
    const key = `pulse_submitted_${orgCode}`;
    const timestamp = localStorage.getItem(key);
    if (timestamp) {
      const submitted = new Date(timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 7) {
        setAlreadySubmitted(true);
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [orgCode]);

  useEffect(() => {
    supabase
      .from("organizations")
      .select("id, org_name")
      .eq("org_code", orgCode)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setOrgName(data.org_name);
          setOrgId(data.id);
        } else {
          setOrgName("");
          setOrgId("");
        }
      });
  }, [orgCode]);

  const handleSubmit = async () => {
    if (!answers.energy || !answers.support || !answers.growth) return;
    setLoading(true);
    await supabase.from("pulse_responses").insert({
      organization_id: orgId,
      department: department || null,
      question_1_energy: answers.energy,
      question_2_support: answers.support,
      question_3_growth: answers.growth,
      question_4_spirit: answers.spirit || null,
      open_feedback: feedback || null,
    });
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem(`pulse_submitted_${orgCode}`, new Date().toISOString());
  };

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center animate-fade-in max-w-md">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">You've already submitted your pulse for this period.</h1>
          <p className="text-muted-foreground">Thank you! Your feedback is being reviewed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center animate-fade-in max-w-md">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Your feedback is incredibly valuable to us. Thank you for taking the time to share your honest thoughts — it helps us build a better workplace for everyone.
          </p>
          <p className="text-muted-foreground mb-6">
            Your responses are completely anonymous and will be used to improve our team culture.
          </p>
          <p className="text-sm text-muted-foreground font-medium">✓ You can close this page now.</p>
        </div>
      </div>
    );
  }

  // Invalid org link
  if (!orgId && orgCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center animate-fade-in max-w-md">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Invalid Pulse Link</h1>
          <p className="text-muted-foreground">This survey link doesn't match any organization. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  const isComplete = answers.energy && answers.support && answers.growth;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-widest uppercase">Be Connect</span>
          </div>
          {orgName && (
            <p className="text-sm text-muted-foreground mb-4">Team Pulse for {orgName}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-3">How's Your Team Really Doing?</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            Take 2 minutes to help us build a better workplace. Your feedback is anonymous and goes directly to leadership.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div
              key={q.key}
              className="bg-card rounded-lg p-5 md:p-6 border border-border animate-slide-up"
              style={{ animationDelay: `${qi * 0.1}s` }}
            >
              <h3 className="text-sm font-semibold text-primary mb-1">{q.title}</h3>
              <p className="text-foreground font-medium mb-4">{q.question}</p>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_LABELS[q.key].map((label, i) => {
                  const value = i + 1;
                  const selected = answers[q.key] === value;
                  const emoji = label.split(" ")[0];
                  const text = label.split(" ").slice(1).join(" ");
                  return (
                    <button
                      key={value}
                      onClick={() => setAnswers((a) => ({ ...a, [q.key]: value }))}
                      className={`flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        selected
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-border hover:border-muted-foreground/40 hover:bg-secondary"
                      }`}
                    >
                      <span className="text-2xl md:text-3xl">{emoji}</span>
                      <span className="text-[10px] md:text-xs text-muted-foreground leading-tight text-center">{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Open Feedback */}
          <div className="bg-card rounded-lg p-5 md:p-6 border border-border animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-sm font-semibold text-primary mb-1">Open Feedback</h3>
            <p className="text-foreground font-medium mb-4">What's one thing that would make work better for you this week?</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Be specific and honest — this helps your team improve."
              className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Department */}
          <div className="bg-card rounded-lg p-5 md:p-6 border border-border animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-sm font-semibold text-primary mb-1">Department</h3>
            <p className="text-foreground font-medium mb-4">Which department are you in? (Optional)</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDepartment(department === d ? "" : d)}
                  className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                    department === d
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pb-8">
            <Button
              variant="gold"
              size="lg"
              onClick={handleSubmit}
              disabled={!isComplete || loading}
              className="w-full md:w-auto md:min-w-[200px] text-base"
            >
              {loading ? "Submitting..." : "Submit Pulse"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">🔒 Your responses are completely anonymous</p>
          </div>
        </div>
      </div>
    </div>
  );
}
