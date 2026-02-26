import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { questions } from "@/config/vibeCheckQuestions";
import { departments, roleLevels, tenureOptions, employmentTypes, type Demographics } from "@/config/demographics";
import VibeProgressBar from "@/components/vibe/VibeProgressBar";
import QuestionOption from "@/components/vibe/QuestionOption";
import { submitVibeCheck } from "@/utils/submitVibeCheck";
import { Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

type Screen = "loading" | "landing" | "prescreen" | "question" | "submitting" | "done" | "error" | "invalid" | "no-code" | "already-done";

export default function VibeCheck() {
  const { code } = useParams<{ code: string }>();
  const [screen, setScreen] = useState<Screen>("loading");
  const [propertyName, setPropertyName] = useState("");
  const [leadId, setLeadId] = useState("");
  const [demographics, setDemographics] = useState<Demographics>({
    department: "",
    role_level: "",
    tenure: "",
    employment_type: "",
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // Check if already done this session
  useEffect(() => {
    if (!code) {
      setScreen("no-code");
      return;
    }
    const alreadyDone = sessionStorage.getItem(`vibe_done_${code}`);
    if (alreadyDone) {
      setScreen("already-done");
      return;
    }
    // Validate code
    supabase
      .rpc("get_vibe_check_property" as any, { check_code: code })
      .then(({ data, error }: any) => {
        if (error || !data || data.length === 0) {
          setScreen("invalid");
        } else {
          setPropertyName(data[0].property_name);
          setLeadId(data[0].lead_id);
          setScreen("landing");
        }
      });
  }, [code]);

  const handleSubmit = async () => {
    setScreen("submitting");
    try {
      await submitVibeCheck(leadId, demographics, answers);
      sessionStorage.setItem(`vibe_done_${code}`, "true");
      setScreen("done");
    } catch {
      setScreen("error");
    }
  };

  const preScreenComplete =
    demographics.department && demographics.role_level && demographics.tenure && demographics.employment_type;

  // Current step for progress: 0=prescreen, 1-5=questions
  const currentStep = screen === "prescreen" ? 0 : currentQuestion;

  // --- SCREENS ---

  if (screen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (screen === "no-code") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm animate-fade-in">
          <h1 className="text-xl font-bold mb-3">You need a valid team link</h1>
          <p className="text-muted-foreground">Please ask your manager for the correct Vibe Check link.</p>
        </div>
      </div>
    );
  }

  if (screen === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm animate-fade-in">
          <h1 className="text-xl font-bold mb-3">This link doesn't seem to be valid.</h1>
          <p className="text-muted-foreground mb-4">
            Please check with your manager for the correct Team Vibe Check link.
          </p>
          <p className="text-sm text-muted-foreground">
            If you think this is an error, contact:{" "}
            <a href="mailto:team@beconnect.ie" className="text-primary underline">team@beconnect.ie</a>
          </p>
        </div>
      </div>
    );
  }

  if (screen === "already-done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm animate-fade-in">
          <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-3">You've already completed this assessment.</h1>
          <p className="text-muted-foreground mb-6">Thank you for your feedback!</p>
          <button
            onClick={() => {
              sessionStorage.removeItem(`vibe_done_${code}`);
              setScreen("landing");
              setAnswers({});
              setDemographics({ department: "", role_level: "", tenure: "", employment_type: "" });
              setCurrentQuestion(1);
            }}
            className="text-sm text-primary underline cursor-pointer"
          >
            Take it again?
          </button>
        </div>
      </div>
    );
  }

  if (screen === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm animate-fade-in">
          <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground mb-4">
            Your response has been recorded.
          </p>
          <p className="text-muted-foreground mb-6 text-sm">
            Your manager will receive a confidential team report once 80% of the team has responded. Individual answers stay completely private — only team-wide patterns are shared.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Powered by Be Connect</span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm animate-fade-in">
          <AlertTriangle className="w-14 h-14 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-3">Something went wrong.</h1>
          <p className="text-muted-foreground mb-6">
            Your answers couldn't be saved. Please check your connection and try again.
          </p>
          <Button onClick={handleSubmit} variant="default" size="lg" className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (screen === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Submitting your responses...</p>
        </div>
      </div>
    );
  }

  // --- LANDING ---
  if (screen === "landing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center animate-fade-in space-y-6">
          <div className="text-xs font-semibold text-primary tracking-widest uppercase">Be Connect</div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{propertyName}</p>
            <h1 className="text-3xl font-bold">Team Vibe Check</h1>
          </div>
          <p className="text-muted-foreground">
            Your manager has invited you to take a quick pulse check to understand team health and how to make things better.
          </p>
          <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-xs mx-auto">
            <li>• Takes 2 minutes</li>
            <li>• Completely anonymous</li>
            <li>• Your individual answers stay private</li>
            <li>• Only team-wide patterns are shared</li>
          </ul>
          <Button
            onClick={() => setScreen("prescreen")}
            size="lg"
            className="w-full text-base"
          >
            Start Assessment →
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Powered by Be Connect — Your responses are confidential.</span>
          </div>
        </div>
      </div>
    );
  }

  // --- PRE-SCREEN ---
  if (screen === "prescreen") {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-background">
        <div className="max-w-md mx-auto space-y-6 animate-fade-in">
          <VibeProgressBar currentStep={0} totalSteps={6} />

          <h2 className="text-2xl font-bold">Quick About You</h2>

          {/* GDPR consent - must appear before dropdowns */}
          <div className="bg-secondary rounded-xl p-4 border border-border">
            <div className="flex gap-2">
              <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your answers are completely anonymous. Your manager never sees your individual responses — only team-level patterns when 3 or more people from the same department have responded. Your results are stored securely by Be Connect and shared with your property's nominated contact.
              </p>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Department</label>
            <select
              value={demographics.department}
              onChange={(e) => setDemographics((d) => ({ ...d, department: e.target.value }))}
              className="w-full h-12 rounded-lg border border-border bg-card px-3 text-foreground text-base appearance-auto"
            >
              <option value="">Select your department</option>
              {departments.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your Role</label>
            <select
              value={demographics.role_level}
              onChange={(e) => setDemographics((d) => ({ ...d, role_level: e.target.value }))}
              className="w-full h-12 rounded-lg border border-border bg-card px-3 text-foreground text-base appearance-auto"
            >
              <option value="">Select your role level</option>
              {roleLevels.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Tenure */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Time at {propertyName}</label>
            <select
              value={demographics.tenure}
              onChange={(e) => setDemographics((d) => ({ ...d, tenure: e.target.value }))}
              className="w-full h-12 rounded-lg border border-border bg-card px-3 text-foreground text-base appearance-auto"
            >
              <option value="">How long have you worked here?</option>
              {tenureOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Employment Type</label>
            <select
              value={demographics.employment_type}
              onChange={(e) => setDemographics((d) => ({ ...d, employment_type: e.target.value }))}
              className="w-full h-12 rounded-lg border border-border bg-card px-3 text-foreground text-base appearance-auto"
            >
              <option value="">Select your type</option>
              {employmentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setScreen("landing")} className="flex-1">
              ← Back
            </Button>
            <Button
              onClick={() => {
                setScreen("question");
                setCurrentQuestion(1);
              }}
              disabled={!preScreenComplete}
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- QUESTIONS ---
  if (screen === "question") {
    const q = questions[currentQuestion - 1];
    const isLast = currentQuestion === 5;

    return (
      <div className="min-h-screen p-4 md:p-8 bg-background">
        <div className="max-w-md mx-auto space-y-6 animate-fade-in" key={currentQuestion}>
          <VibeProgressBar currentStep={currentQuestion} totalSteps={6} />

          <h2 className="text-xl md:text-2xl font-bold leading-snug pt-2">{q.text}</h2>

          <div className="space-y-3">
            {q.options.map((opt) => (
              <QuestionOption
                key={opt.value}
                option={opt}
                selected={answers[currentQuestion] === opt.value}
                onSelect={(v) => setAnswers((a) => ({ ...a, [currentQuestion]: v }))}
              />
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestion === 1) {
                  setScreen("prescreen");
                } else {
                  setCurrentQuestion((c) => c - 1);
                }
              }}
              className="flex-1"
            >
              ← Back
            </Button>
            {isLast ? (
              <Button
                onClick={handleSubmit}
                disabled={!answers[currentQuestion]}
                className="flex-1"
              >
                Submit
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion((c) => c + 1)}
                disabled={!answers[currentQuestion]}
                className="flex-1"
              >
                Next →
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
