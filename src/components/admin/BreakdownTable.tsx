import type { SegmentScore } from "@/utils/dossierCalculations";
import { getOverallIndicator, getScoreColor, getSizeLabel } from "@/utils/dossierCalculations";

interface BreakdownTableProps {
  title: string;
  segments: SegmentScore[];
  shareable?: boolean;
}

function ScoreCell({ score }: { score: number }) {
  return (
    <td className={`p-2 md:p-3 text-center font-medium ${getScoreColor(score)}`}>
      {score.toFixed(1)}
    </td>
  );
}

export default function BreakdownTable({ title, segments, shareable = false }: BreakdownTableProps) {
  if (segments.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left p-2 md:p-3 font-medium">{title.replace(" Breakdown", "")}</th>
              <th className="text-center p-2 md:p-3 font-medium">{shareable ? "Size" : "Count"}</th>
              <th className="text-center p-2 md:p-3 font-medium">Q1</th>
              <th className="text-center p-2 md:p-3 font-medium">Q2</th>
              <th className="text-center p-2 md:p-3 font-medium">Q3</th>
              <th className="text-center p-2 md:p-3 font-medium">Q4</th>
              <th className="text-center p-2 md:p-3 font-medium">Q5</th>
              <th className="text-center p-2 md:p-3 font-medium">Overall</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg) => {
              const indicator = getOverallIndicator(seg.overall);
              return (
                <tr key={seg.label} className="border-b border-border/50">
                  <td className="p-2 md:p-3 font-medium text-foreground">{seg.label}</td>
                  <td className="p-2 md:p-3 text-center text-muted-foreground">
                    {shareable ? getSizeLabel(seg.count) : seg.count}
                  </td>
                  <ScoreCell score={seg.q1} />
                  <ScoreCell score={seg.q2} />
                  <ScoreCell score={seg.q3} />
                  <ScoreCell score={seg.q4} />
                  <ScoreCell score={seg.q5} />
                  <td className={`p-2 md:p-3 text-center font-bold ${indicator.color}`}>
                    {seg.overall.toFixed(1)} {indicator.emoji}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>🔴 Critical (≤2.5)</span>
        <span>🟡 At Risk (2.6-3.5)</span>
        <span>🟢 Stable (3.6-4.0)</span>
        <span>💚 Strong (4.1+)</span>
      </div>
    </div>
  );
}
