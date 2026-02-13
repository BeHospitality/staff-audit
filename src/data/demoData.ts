export interface PulseResponse {
  id: string;
  organization_id: string;
  department: string | null;
  question_1_energy: number;
  question_2_support: number;
  question_3_growth: number;
  question_4_spirit: number | null;
  open_feedback: string | null;
  submitted_at: string;
  is_demo_data: boolean;
}

const depts = ["Kitchen", "Front of House", "Housekeeping"];

const kitchenFeedback = [
  "Communication breakdown on shift changes — nobody knows what's happening.",
  "Equipment failures causing stress, the fryer has been broken for 2 weeks.",
  "Need better training materials for new hires.",
  "Management doesn't listen to our concerns about understaffing.",
  "Broken equipment in the back slowing down service.",
  null,
  "Lack of clear communication on new menu deadlines.",
];

const fohFeedback = [
  "The chef going the extra mile during the rush — really appreciated.",
  "Great team spirit on weekends, we all pull together.",
  null,
  "Would love more cross-training opportunities.",
  "Alex from concierge for exceptional guest service.",
  null,
];

const hkFeedback = [
  "Training materials need updating badly.",
  null,
  "Room inspection standards keep changing without notice.",
  "Supplies are often low, makes the job harder.",
  null,
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDemoData(orgId: string): PulseResponse[] {
  const responses: PulseResponse[] = [];
  const now = new Date();

  // Kitchen: 8 responses, mostly low scores
  for (let i = 0; i < 8; i++) {
    responses.push({
      id: crypto.randomUUID(),
      organization_id: orgId,
      department: "Kitchen",
      question_1_energy: rand(1, 3),
      question_2_support: rand(1, 3),
      question_3_growth: rand(1, 3),
      question_4_spirit: rand(1, 3),
      open_feedback: kitchenFeedback[i % kitchenFeedback.length],
      submitted_at: new Date(now.getTime() - rand(0, 7) * 86400000).toISOString(),
      is_demo_data: true,
    });
  }

  // Front of House: 6 responses, moderate-good scores
  for (let i = 0; i < 6; i++) {
    responses.push({
      id: crypto.randomUUID(),
      organization_id: orgId,
      department: "Front of House",
      question_1_energy: rand(3, 5),
      question_2_support: rand(3, 5),
      question_3_growth: rand(2, 4),
      question_4_spirit: rand(3, 5),
      open_feedback: fohFeedback[i % fohFeedback.length],
      submitted_at: new Date(now.getTime() - rand(0, 7) * 86400000).toISOString(),
      is_demo_data: true,
    });
  }

  // Housekeeping: 5 responses, moderate scores
  for (let i = 0; i < 5; i++) {
    responses.push({
      id: crypto.randomUUID(),
      organization_id: orgId,
      department: "Housekeeping",
      question_1_energy: rand(2, 4),
      question_2_support: rand(2, 4),
      question_3_growth: rand(2, 3),
      question_4_spirit: rand(2, 4),
      open_feedback: hkFeedback[i % hkFeedback.length],
      submitted_at: new Date(now.getTime() - rand(0, 7) * 86400000).toISOString(),
      is_demo_data: true,
    });
  }

  return responses;
}

export const EMOJI_LABELS = {
  energy: ["😫 Exhausted", "😓 Drained", "😐 Neutral", "⚡ Energized", "🚀 Thriving"],
  support: ["🆘 Not at all", "🙏 Could be better", "👍 Good", "🤝 Very supported", "🏆 Exceptional"],
  growth: ["🧊 Stuck", "🐢 Slow progress", "📈 Some growth", "🌱 Growing well", "⭐ Unlimited potential"],
  spirit: ["😔 Isolated", "😐 Disconnected", "🙂 Getting there", "😊 Connected", "🎉 Tight-knit"],
};

export const DEPARTMENTS = ["Kitchen", "Front of House", "Housekeeping", "Management", "Other"];
