import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary text-lg tracking-wide">Be Connect</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-lg animate-fade-in">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Thank You!
          </h1>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            We'll be in touch shortly with your free Team Vibe Check. Check your email for next steps.
          </p>
          <Button variant="ghost" onClick={() => navigate("/")} className="text-primary">
            ← Back to Calculator
          </Button>
        </div>
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
