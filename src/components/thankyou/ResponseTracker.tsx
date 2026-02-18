import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ResponseTrackerProps {
  leadId: string;
  initialResponses: number;
  staffCount: number | null;
}

export default function ResponseTracker({ leadId, initialResponses, staffCount }: ResponseTrackerProps) {
  const [responses, setResponses] = useState(initialResponses);
  const [refreshing, setRefreshing] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const total = staffCount && staffCount > 0 ? staffCount : 0;
  const threshold = Math.ceil(total * 0.8);
  const progressPercent = total > 0 ? Math.min(100, Math.round((responses / total) * 100)) : 0;
  const thresholdMet = total > 0 && responses >= threshold;

  // Animate progress bar on mount / update
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progressPercent), 100);
    return () => clearTimeout(timer);
  }, [progressPercent]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const { data } = await supabase
        .from("leads" as any)
        .select("vibe_check_responses")
        .eq("id", leadId)
        .single();
      if (data) setResponses((data as any).vibe_check_responses ?? 0);
    } finally {
      setRefreshing(false);
    }
  }

  if (!total) {
    return (
      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            📊 Responses so far: <span className="font-semibold text-foreground">{responses}</span> — We'll track these as they come in.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-foreground">
            {thresholdMet ? "✅ 80% Threshold Reached!" : "📊 Team Response Tracker"}
          </p>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing} className="text-muted-foreground hover:text-primary">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Responses: <span className="font-semibold text-foreground">{responses}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span>{" "}
          ({progressPercent}%)
        </p>

        <Progress value={animatedProgress} className="h-3" />

        {thresholdMet ? (
          <p className="text-sm text-success font-medium">
            Our team is now analysing your results. Expect your PIN-protected report within 3-5 business days.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Need 80%+ for your report ({threshold} responses needed). Bookmark this page to check progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
