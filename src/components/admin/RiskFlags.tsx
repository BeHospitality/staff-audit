import { generateRiskFlags, type VibeResponse } from "@/utils/dossierCalculations";
import { AlertTriangle } from "lucide-react";

interface RiskFlagsProps {
  responses: VibeResponse[];
}

export default function RiskFlags({ responses }: RiskFlagsProps) {
  const flags = generateRiskFlags(responses);

  if (flags.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
        <p className="text-green-400 font-medium">✅ No major risk flags detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Risk Flags</h3>
      </div>
      <div className="space-y-2">
        {flags.map((flag, i) => (
          <div
            key={i}
            className={`rounded-lg p-4 border ${
              flag.severity === "red"
                ? "bg-destructive/10 border-destructive/30"
                : "bg-primary/10 border-primary/30"
            }`}
          >
            <p className="text-sm text-foreground">
              <span className="mr-2">{flag.severity === "red" ? "🔴" : "🟡"}</span>
              {flag.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
