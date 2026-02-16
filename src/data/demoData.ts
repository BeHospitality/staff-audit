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

export const EMOJI_LABELS = {
  energy: ["😫 Exhausted", "😓 Drained", "😐 Neutral", "⚡ Energized", "🚀 Thriving"],
  support: ["🆘 Not at all", "🙏 Could be better", "👍 Good", "🤝 Very supported", "🏆 Exceptional"],
  growth: ["🧊 Stuck", "🐢 Slow progress", "📈 Some growth", "🌱 Growing well", "⭐ Unlimited potential"],
  spirit: ["😔 Isolated", "😐 Disconnected", "🙂 Getting there", "😊 Connected", "🎉 Tight-knit"],
};

export const DEPARTMENTS = ["Kitchen", "Front of House", "Housekeeping", "Management", "Other"];

// Fixed demo data that produces exact target scores for Kilkea Castle
// Kitchen: energy~2.1→42%, support~1.8→36%, growth~2.3→46%, spirit~2.0→40% → overall ~38
// FOH: energy~3.4→68%, support~3.6→72%, growth~3.2→64%, spirit~3.8→76% → overall ~68  
// HK: energy~2.8→56%, support~3.0→60%, growth~2.5→50%, spirit~2.3→46% → overall ~55

const kitchenResponses: Omit<PulseResponse, "id" | "organization_id" | "submitted_at" | "is_demo_data">[] = [
  { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Head chef micromanages everything — no autonomy" },
  { department: "Kitchen", question_1_energy: 2, question_2_support: 1, question_3_growth: 3, question_4_spirit: 2, open_feedback: "Kitchen equipment constantly breaking, causes stress" },
  { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Communication breakdown between shifts" },
  { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Training materials need updating" },
  { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Chef goes extra mile during rush hour" },
  { department: "Kitchen", question_1_energy: 2, question_2_support: 1, question_3_growth: 2, question_4_spirit: 1, open_feedback: "No clear career progression in kitchen" },
  { department: "Kitchen", question_1_energy: 2, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: null },
  { department: "Kitchen", question_1_energy: 1, question_2_support: 2, question_3_growth: 2, question_4_spirit: 2, open_feedback: "Broken equipment in the back slowing down service" },
];

const fohResponses: Omit<PulseResponse, "id" | "organization_id" | "submitted_at" | "is_demo_data">[] = [
  { department: "Front of House", question_1_energy: 3, question_2_support: 4, question_3_growth: 3, question_4_spirit: 4, open_feedback: "FOH team has great collaboration" },
  { department: "Front of House", question_1_energy: 4, question_2_support: 3, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Management is trying to improve things" },
  { department: "Front of House", question_1_energy: 3, question_2_support: 4, question_3_growth: 4, question_4_spirit: 3, open_feedback: "No clear path for promotion in FOH" },
  { department: "Front of House", question_1_energy: 4, question_2_support: 4, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Great team spirit on weekends" },
  { department: "Front of House", question_1_energy: 3, question_2_support: 3, question_3_growth: 3, question_4_spirit: 4, open_feedback: null },
  { department: "Front of House", question_1_energy: 3, question_2_support: 4, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Would love more cross-training opportunities" },
  { department: "Front of House", question_1_energy: 4, question_2_support: 3, question_3_growth: 3, question_4_spirit: 4, open_feedback: "Alex from concierge for exceptional guest service" },
];

const hkResponses: Omit<PulseResponse, "id" | "organization_id" | "submitted_at" | "is_demo_data">[] = [
  { department: "Housekeeping", question_1_energy: 3, question_2_support: 3, question_3_growth: 3, question_4_spirit: 2, open_feedback: "Room inspection standards keep changing without notice" },
  { department: "Housekeeping", question_1_energy: 3, question_2_support: 3, question_3_growth: 2, question_4_spirit: 3, open_feedback: "Housekeeping team works alone, feels isolating" },
  { department: "Housekeeping", question_1_energy: 3, question_2_support: 3, question_3_growth: 3, question_4_spirit: 2, open_feedback: "Supplies are often low, makes the job harder" },
  { department: "Housekeeping", question_1_energy: 2, question_2_support: 3, question_3_growth: 2, question_4_spirit: 2, open_feedback: null },
];

export function generateDemoData(orgId: string): PulseResponse[] {
  const now = new Date();
  const all = [...kitchenResponses, ...fohResponses, ...hkResponses];
  
  return all.map((r, i) => ({
    ...r,
    id: `demo-${orgId}-${i}`,
    organization_id: orgId,
    submitted_at: new Date(now.getTime() - (i % 7) * 86400000).toISOString(),
    is_demo_data: true,
  }));
}

// Demo org data for multi-org demo mode on the dashboard
export interface DemoOrg {
  id: string;
  org_name: string;
  org_code: string;
  responseCount: number;
  healthScore: number;
  lastPulseDate: string;
}

export function getDemoOrgs(): DemoOrg[] {
  const now = new Date().toISOString();
  return [
    {
      id: "457b9a09-f8ed-415e-b2dd-8b87d75983a5",
      org_name: "Kilkea Castle Hotel",
      org_code: "kilkea-castle",
      responseCount: 19,
      healthScore: 48,
      lastPulseDate: now,
    },
    {
      id: "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
      org_name: "Rose Hotel",
      org_code: "rose-hotel",
      responseCount: 28,
      healthScore: 73,
      lastPulseDate: now,
    },
    {
      id: "c2b3d4e5-f6a7-8901-bcde-f12345678901",
      org_name: "Demo Property",
      org_code: "demo-property",
      responseCount: 15,
      healthScore: 61,
      lastPulseDate: now,
    },
  ];
}
