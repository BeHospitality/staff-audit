import { generateRiskFlags, groupByField, calcOverallScores, type VibeResponse } from "@/utils/dossierCalculations";

interface HubCTAProps {
  responses: VibeResponse[];
  propertyName: string;
  staffCount: number | null;
  turnoverRate: number | null;
}

export default function HubCTA({ responses, propertyName, staffCount, turnoverRate }: HubCTAProps) {
  const flags = generateRiskFlags(responses);
  const depts = groupByField(responses, "department");
  const atRiskDepts = depts.filter((d) => d.overall <= 3.0).length;
  const scores = calcOverallScores(responses);

  // Simple cost calc: staff × turnover% × €15,000 avg replacement cost
  const annualCost = staffCount && turnoverRate
    ? Math.round(staffCount * (turnoverRate / 100) * 15000)
    : null;

  return (
    <div className="bg-card border-2 border-primary/40 rounded-xl p-6 md:p-8 space-y-5">
      <h3 className="text-xl font-bold">What This Means — And What to Do Next</h3>

      <p className="text-muted-foreground">
        Your data has identified <strong className="text-foreground">{flags.length} retention risk area{flags.length !== 1 ? "s" : ""}</strong> across{" "}
        <strong className="text-foreground">{atRiskDepts} department{atRiskDepts !== 1 ? "s" : ""}</strong>.
      </p>

      {annualCost && (
        <p className="text-muted-foreground">
          Without intervention, at your current turnover rate, this will cost{" "}
          <strong className="text-foreground">{propertyName}</strong> approximately{" "}
          <strong className="text-destructive">€{annualCost.toLocaleString()}</strong> over the next 12 months.
        </p>
      )}

      <div className="space-y-2 pt-2">
        <p className="font-medium text-foreground">The Be Connect Charter Partner Hub gives you the tools to fix this:</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>✓ DNA-based hiring that matches people to roles (not just CVs to job specs)</li>
          <li>✓ Buddy matching for new starters (your 90-day retention is {scores.q4.toFixed(1)}/5)</li>
          <li>✓ Journey Blueprints that structure the first 90 days automatically</li>
          <li>✓ Real-time engagement tracking so you see risk before people hand in notice</li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Your Vibe Check data migrates directly into the Hub — no re-entry, no starting from scratch.
      </p>

      <div className="border-t border-border pt-5 space-y-2">
        <p className="text-sm font-medium text-foreground">
          Ready to talk? Your Be Connect partner will walk you through the next steps.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>📧 team@beconnect.ie</span>
          <span>🌐 beconnect.ie</span>
        </div>
      </div>
    </div>
  );
}
