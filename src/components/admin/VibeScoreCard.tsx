import { calcOverallScores, getScoreEmoji, getScoreColor, questionLabels } from "@/utils/dossierCalculations";
import type { VibeResponse } from "@/utils/dossierCalculations";

interface VibeScoreCardProps {
  responses: VibeResponse[];
}

export default function VibeScoreCard({ responses }: VibeScoreCardProps) {
  const scores = calcOverallScores(responses);
  const qScores = [scores.q1, scores.q2, scores.q3, scores.q4, scores.q5];

  return (
    <div className="bg-card border border-border rounded-lg p-5 md:p-6 space-y-4">
      <div className="flex items-baseline gap-3">
        <h3 className="text-lg font-bold">Overall Team Vibe:</h3>
        <span className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>
          {scores.overall} / 5.0
        </span>
      </div>
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        scores.overall <= 2.0 ? "bg-destructive/20 text-destructive" :
        scores.overall <= 3.0 ? "bg-primary/20 text-primary" :
        scores.overall <= 4.0 ? "bg-green-500/20 text-green-400" :
        "bg-green-600/20 text-green-500"
      }`}>
        {scores.riskEmoji} {scores.riskLevel}
      </div>

      <div className="space-y-2 pt-2">
        {questionLabels.map((label, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Q{i + 1} — {label}:
            </span>
            <span className={`font-medium ${getScoreColor(qScores[i])}`}>
              {qScores[i].toFixed(1)} {getScoreEmoji(qScores[i])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
