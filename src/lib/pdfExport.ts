import jsPDF from "jspdf";
import type { PulseResponse } from "@/data/demoData";

function scoreToLabel(score: number): string {
  if (score <= 40) return "Critical";
  if (score <= 70) return "Moderate";
  return "Healthy";
}

function avgScore(responses: PulseResponse[], key: keyof PulseResponse): number {
  const vals = responses.map((r) => r[key] as number).filter((v) => v != null);
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length / 5) * 100);
}

export function exportPDF(orgName: string, responses: PulseResponse[], dateRange: string) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`${orgName} — Team Pulse Report`, w / 2, y, { align: "center" });
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date Range: ${dateRange} | Responses: ${responses.length}`, w / 2, y, { align: "center" });
  y += 15;

  // Overall scores
  const energy = avgScore(responses, "question_1_energy");
  const support = avgScore(responses, "question_2_support");
  const growth = avgScore(responses, "question_3_growth");
  const spirit = avgScore(responses, "question_4_spirit");
  const overall = Math.round((energy + support + growth + spirit) / 4);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Overall Health Score: ${overall}/100 (${scoreToLabel(overall)})`, 20, y);
  y += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const metrics = [
    `Team Energy: ${energy}/100 (${scoreToLabel(energy)})`,
    `Management Support: ${support}/100 (${scoreToLabel(support)})`,
    `Growth Potential: ${growth}/100 (${scoreToLabel(growth)})`,
    `Team Spirit: ${spirit}/100 (${scoreToLabel(spirit)})`,
  ];
  metrics.forEach((m) => {
    doc.text(m, 20, y);
    y += 8;
  });
  y += 5;

  // Department breakdown
  const depts = [...new Set(responses.map((r) => r.department).filter(Boolean))] as string[];
  if (depts.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Department Breakdown", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    depts.forEach((dept) => {
      const deptR = responses.filter((r) => r.department === dept);
      const de = avgScore(deptR, "question_1_energy");
      const ds = avgScore(deptR, "question_2_support");
      const dg = avgScore(deptR, "question_3_growth");
      const avg = Math.round((de + ds + dg) / 3);
      doc.text(`${dept}: ${deptR.length} responses | Energy: ${de} | Support: ${ds} | Growth: ${dg} | Overall: ${avg}`, 20, y);
      y += 7;
    });
    y += 5;
  }

  // Feedback highlights
  const feedbacks = responses.map((r) => r.open_feedback).filter(Boolean) as string[];
  if (feedbacks.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Feedback Highlights", 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    feedbacks.slice(0, 10).forEach((f) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`• ${f}`, w - 40);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 2;
    });
  }

  // Footer
  y = 280;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Powered by Be Connect Intelligence — Operational Stability Solutions", w / 2, y, { align: "center" });

  doc.save(`${orgName.replace(/\s+/g, "_")}_Pulse_Report.pdf`);
}
