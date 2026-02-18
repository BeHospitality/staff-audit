import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { calculateChurn } from "@/lib/churnCalculations";

interface AuditResultsSummaryProps {
  staffCount: number | null;
  turnoverRate: number | null;
}

function fmt(val: number) {
  return "€" + val.toLocaleString("en-IE", { maximumFractionDigits: 0 });
}

export default function AuditResultsSummary({ staffCount, turnoverRate }: AuditResultsSummaryProps) {
  const hasData = staffCount && staffCount > 0 && turnoverRate && turnoverRate > 0;

  const calc = useMemo(() => {
    if (!hasData) return null;
    return calculateChurn("ireland", staffCount!, turnoverRate!, 2400, 2500, 3, 60);
  }, [staffCount, turnoverRate, hasData]);

  if (!hasData || !calc) {
    return (
      <Card className="border-primary/30 bg-card/80">
        <CardContent className="p-6 md:p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">📊 Your Staff Audit</p>
          <p className="text-muted-foreground leading-relaxed">
            We'll calculate your exact turnover cost as part of your Vibe Check report.
          </p>
          <p className="text-sm text-muted-foreground">
            Average Irish hotel (160 staff, 30% turnover) loses <span className="text-primary font-semibold">€249,120 per year</span> — and 81% of that cost is invisible.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-card/80">
      <CardContent className="p-6 md:p-8 space-y-5">
        <p className="text-lg font-semibold text-foreground text-center">📊 Your Staff Audit Results</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Annual Cost</p>
            <p className="text-xl md:text-2xl font-bold text-primary">{fmt(Math.round(calc.totalAnnual))}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Daily Bleed</p>
            <p className="text-xl md:text-2xl font-bold text-destructive">{fmt(Math.round(calc.dailyBleed))}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Per Departure</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{fmt(calc.perDeparture)}</p>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center space-y-2">
          <p className="text-sm font-semibold text-primary">💡 The Invisible {calc.invisiblePercentage}%</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're probably tracking <span className="font-semibold text-foreground">{fmt(calc.visibleCost)}</span> in recruitment fees.
            But <span className="font-semibold text-primary">{fmt(calc.hiddenCost)}</span> is hidden in training waste, productivity gaps, and early departures.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
