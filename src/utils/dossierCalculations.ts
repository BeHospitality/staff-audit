import { questions } from "@/config/vibeCheckQuestions";
import { departments, roleLevels, tenureOptions, employmentTypes } from "@/config/demographics";

export interface VibeResponse {
  id: string;
  lead_id: string;
  anonymous_id: string;
  department: string;
  role_level: string;
  tenure: string;
  employment_type: string;
  q1_score: number;
  q2_score: number;
  q3_score: number;
  q4_score: number;
  q5_score: number;
  created_at: string;
}

export interface SegmentScore {
  label: string;
  count: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  overall: number;
}

const MIN_SEGMENT_SIZE = 3;

const labelMap: Record<string, string> = {};
departments.forEach(d => { labelMap[d.value] = d.label; });
roleLevels.forEach(d => { labelMap[d.value] = d.label; });
tenureOptions.forEach(d => { labelMap[d.value] = d.label; });
employmentTypes.forEach(d => { labelMap[d.value] = d.label; });

export function getLabel(value: string): string {
  return labelMap[value] || value;
}

function avgScore(responses: VibeResponse[], key: keyof VibeResponse): number {
  if (responses.length === 0) return 0;
  const sum = responses.reduce((s, r) => s + (r[key] as number), 0);
  return Number((sum / responses.length).toFixed(1));
}

function calcSegmentScore(label: string, responses: VibeResponse[]): SegmentScore {
  return {
    label,
    count: responses.length,
    q1: avgScore(responses, "q1_score"),
    q2: avgScore(responses, "q2_score"),
    q3: avgScore(responses, "q3_score"),
    q4: avgScore(responses, "q4_score"),
    q5: avgScore(responses, "q5_score"),
    overall: Number(
      (
        (avgScore(responses, "q1_score") +
          avgScore(responses, "q2_score") +
          avgScore(responses, "q3_score") +
          avgScore(responses, "q4_score") +
          avgScore(responses, "q5_score")) /
        5
      ).toFixed(1)
    ),
  };
}

export function groupByField(
  responses: VibeResponse[],
  field: keyof VibeResponse
): SegmentScore[] {
  const groups: Record<string, VibeResponse[]> = {};
  const suppressed: VibeResponse[] = [];

  responses.forEach((r) => {
    const key = r[field] as string;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const result: SegmentScore[] = [];
  Object.entries(groups).forEach(([key, items]) => {
    if (items.length < MIN_SEGMENT_SIZE) {
      suppressed.push(...items);
    } else {
      result.push(calcSegmentScore(getLabel(key), items));
    }
  });

  if (suppressed.length >= MIN_SEGMENT_SIZE) {
    result.push(calcSegmentScore("Other", suppressed));
  }

  return result.sort((a, b) => a.overall - b.overall);
}

export function calcOverallScores(responses: VibeResponse[]) {
  const q1 = avgScore(responses, "q1_score");
  const q2 = avgScore(responses, "q2_score");
  const q3 = avgScore(responses, "q3_score");
  const q4 = avgScore(responses, "q4_score");
  const q5 = avgScore(responses, "q5_score");
  const overall = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(1));

  let riskLevel: string;
  let riskEmoji: string;
  if (overall <= 2.0) { riskLevel = "Critical"; riskEmoji = "🔴"; }
  else if (overall <= 3.0) { riskLevel = "At Risk"; riskEmoji = "🟡"; }
  else if (overall <= 4.0) { riskLevel = "Stable"; riskEmoji = "🟢"; }
  else { riskLevel = "Strong"; riskEmoji = "💚"; }

  return { q1, q2, q3, q4, q5, overall, riskLevel, riskEmoji };
}

export function getScoreEmoji(score: number): string {
  const q = questions[0]; // just for reference structure
  if (score <= 1.5) return "😰";
  if (score <= 2.5) return "😟";
  if (score <= 3.5) return "😐";
  if (score <= 4.5) return "😊";
  return "😍";
}

export function getScoreColor(score: number): string {
  if (score <= 2.0) return "text-destructive";
  if (score <= 2.5) return "text-orange-400";
  if (score <= 3.5) return "text-primary";
  return "text-green-400";
}

export function getOverallIndicator(score: number): { emoji: string; color: string } {
  if (score <= 2.5) return { emoji: "🔴", color: "text-destructive" };
  if (score <= 3.5) return { emoji: "🟡", color: "text-primary" };
  if (score <= 4.0) return { emoji: "🟢", color: "text-green-400" };
  return { emoji: "💚", color: "text-green-500" };
}

export function getSizeLabel(count: number): string {
  if (count < 10) return "Small team";
  if (count < 25) return "Medium";
  return "Large";
}

export function generateRiskFlags(responses: VibeResponse[]): { severity: "red" | "yellow"; text: string }[] {
  const flags: { severity: "red" | "yellow"; text: string }[] = [];
  const scores = calcOverallScores(responses);
  const deptBreakdown = groupByField(responses, "department");

  // Flag 1: Any department critical
  deptBreakdown.forEach((dept) => {
    if (dept.overall <= 2.5) {
      flags.push({
        severity: "red",
        text: `${dept.label} is in critical territory (${dept.overall}/5). Immediate attention needed.`,
      });
    }
  });

  // Flag 2: Q1 (filling roles) below 2.0
  if (scores.q1 < 2.0) {
    flags.push({
      severity: "red",
      text: `Recruitment is a crisis — team rates ability to fill roles at ${scores.q1}/5.`,
    });
  }

  // Flag 3: Q3 (competitor risk) below 2.5
  if (scores.q3 < 2.5) {
    flags.push({
      severity: "red",
      text: `High poaching risk — team confidence in staying if competitors offer more is only ${scores.q3}/5.`,
    });
  }

  // Flag 4: Q4 (90-day retention) below 2.5
  if (scores.q4 < 2.5) {
    flags.push({
      severity: "red",
      text: `New hire retention is failing — 90-day survival rated at ${scores.q4}/5.`,
    });
  }

  // Flag 5: Perception gap between managers and team members
  const roleBreakdown = groupByField(responses, "role_level");
  const managerSeg = roleBreakdown.find((r) => r.label === "Manager");
  const teamSeg = roleBreakdown.find((r) => r.label === "Team Member");
  if (managerSeg && teamSeg && managerSeg.overall - teamSeg.overall > 1.0) {
    flags.push({
      severity: "yellow",
      text: `Perception gap: Managers rate team health at ${managerSeg.overall}/5, team members at ${teamSeg.overall}/5. Leadership may be disconnected.`,
    });
  }

  // Flag 6: New starters vs tenured
  const tenureBreakdown = groupByField(responses, "tenure");
  const newStarters = tenureBreakdown.find((t) => t.label === "Less than 6 months");
  const tenured = tenureBreakdown.find((t) => t.label === "3+ years");
  if (newStarters && tenured && newStarters.overall < tenured.overall - 0.8) {
    flags.push({
      severity: "yellow",
      text: `New starter experience is poor (${newStarters.overall}/5 vs ${tenured.overall}/5 for 3yr+ staff). Onboarding needs work.`,
    });
  }

  return flags;
}

export const questionLabels = [
  "Filling roles",
  "Would rehire",
  "Competitor risk",
  "90-day retention",
  "Monday energy",
];
