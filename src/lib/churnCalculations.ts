import type { Region } from "@/components/calculator/RegionSelector";

export interface LineItem {
  label: string;
  amount: number;
}

export interface CategoryBreakdown {
  label: string;
  costPerDeparture: number;
  annualTotal: number;
  pct: number;
  lineItems: LineItem[];
  source: string;
}

export interface ChurnResult {
  departures: number;
  annualSalary: number;
  loadedAnnualCost: number;
  totalAnnual: number;
  dailyBleed: number;
  perDeparture: number;
  stabilityScore: number;
  categories: CategoryBreakdown[];
  visibleCost: number;
  hiddenCost: number;
  regionSupported: boolean;
}

function calcIreland(teamSize: number, turnoverRate: number, baseMonthlySalary: number): ChurnResult {
  const departures = Math.round(teamSize * (turnoverRate / 100));
  const annualSalary = baseMonthlySalary * 12;
  const employerPRSI = annualSalary * 0.1105;
  const loadedAnnualCost = annualSalary + employerPRSI;

  // Category 1: Recruitment & Admin — €2,200 per departure
  const cat1CostPer = 2200;
  const cat1Total = cat1CostPer * departures;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Admin",
    costPerDeparture: cat1CostPer,
    annualTotal: cat1Total,
    pct: 0,
    lineItems: [
      { label: "Direct Costs (job boards, screening)", amount: 500 },
      { label: "HR Time (15 hours @ €40/hr)", amount: 600 },
      { label: "Manager Time (8 hours @ €50/hr)", amount: 400 },
      { label: "Onboarding Admin (PRSI setup, contracts)", amount: 700 },
    ],
    source: "Based on Irish Hotels Federation 2024 Cost Analysis and CIPD UK Cost-per-Hire Calculator",
  };

  // Category 2: Training & Ramp-Up — €2,600 per departure
  const cat2CostPer = 2600;
  const cat2Total = cat2CostPer * departures;
  const cat2: CategoryBreakdown = {
    label: "Training & Ramp-Up",
    costPerDeparture: cat2CostPer,
    annualTotal: cat2Total,
    pct: 0,
    lineItems: [
      { label: "Trainer time (35 hours @ €28/hr)", amount: 980 },
      { label: "Materials & uniforms", amount: 220 },
      { label: "Peer Mentoring (25 hours @ €22/hr)", amount: 550 },
      { label: "Ramp-Up Productivity Loss (3 weeks @ 50%)", amount: 850 },
    ],
    source: "Based on Cornell Center for Hospitality Research ramp-time studies and Irish frontline wage data",
  };

  // Category 3: Productivity Gap — €12,400 per departure
  const cat3CostPer = 12400;
  const cat3Total = cat3CostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Gap",
    costPerDeparture: cat3CostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: "Position Vacancy Cost (52 days × scarcity ×1.15)", amount: 4724 },
      { label: "Team Productivity Drain (5 staff, 15% drop, 2 months)", amount: 3600 },
      { label: "Departing Employee Disengagement (6 weeks, 30% drop)", amount: 1080 },
      { label: "Service Quality Impact (1% revenue loss, 2 months)", amount: 3000 },
    ],
    source: "Cornell CHR benchmark: 52% of turnover cost is productivity loss. Our calculation: 67% accounts for Ireland's 4.2% unemployment and extended vacancy periods.",
  };

  // Category 4: Notice Period Overhead — €1,320 per departure
  const cat4CostPer = 1320;
  const cat4Total = cat4CostPer * departures;
  const cat4: CategoryBreakdown = {
    label: "Notice Period Overhead",
    costPerDeparture: cat4CostPer,
    annualTotal: cat4Total,
    pct: 0,
    lineItems: [
      { label: "Notice Period (6 weeks avg, 40% productivity drop)", amount: 1320 },
    ],
    source: "Based on Irish employment law standard notice periods and productivity research during exit transitions",
  };

  const totalAnnual = cat1Total + cat2Total + cat3Total + cat4Total;
  const categories = [cat1, cat2, cat3, cat4].map(c => ({
    ...c,
    pct: totalAnnual > 0 ? Math.round((c.annualTotal / totalAnnual) * 100) : 0,
  }));

  return {
    departures,
    annualSalary,
    loadedAnnualCost,
    totalAnnual,
    dailyBleed: totalAnnual / 365,
    perDeparture: departures > 0 ? Math.round(totalAnnual / departures) : 0,
    stabilityScore: Math.max(0, Math.min(100, 100 - turnoverRate)),
    categories,
    visibleCost: cat1Total,
    hiddenCost: cat2Total + cat3Total + cat4Total,
    regionSupported: true,
  };
}

/** Fallback generic calculation for unsupported regions */
function calcGeneric(teamSize: number, turnoverRate: number, baseMonthlySalary: number, acqFriction: number, rampMonths: number): ChurnResult {
  const departures = Math.round(teamSize * (turnoverRate / 100));
  const annualSalary = baseMonthlySalary * 12;
  const rampFactor = rampMonths / 3;
  const recruitmentCost = departures * acqFriction;
  const trainingCost = departures * (annualSalary * 0.25 * rampFactor);
  const productivityGap = departures * (annualSalary * 0.2756 * rampFactor);
  const totalAnnual = recruitmentCost + trainingCost + productivityGap;

  const categories: CategoryBreakdown[] = [
    {
      label: "Recruitment & Admin",
      costPerDeparture: departures > 0 ? Math.round(recruitmentCost / departures) : 0,
      annualTotal: recruitmentCost,
      pct: totalAnnual > 0 ? Math.round((recruitmentCost / totalAnnual) * 100) : 0,
      lineItems: [{ label: "Acquisition friction per hire", amount: acqFriction }],
      source: "General industry estimates",
    },
    {
      label: "Training & Ramp-Up",
      costPerDeparture: departures > 0 ? Math.round(trainingCost / departures) : 0,
      annualTotal: trainingCost,
      pct: totalAnnual > 0 ? Math.round((trainingCost / totalAnnual) * 100) : 0,
      lineItems: [{ label: `Training cost (${rampMonths} month ramp)`, amount: departures > 0 ? Math.round(trainingCost / departures) : 0 }],
      source: "General industry estimates",
    },
    {
      label: "Productivity Gap",
      costPerDeparture: departures > 0 ? Math.round(productivityGap / departures) : 0,
      annualTotal: productivityGap,
      pct: totalAnnual > 0 ? Math.round((productivityGap / totalAnnual) * 100) : 0,
      lineItems: [{ label: "Lost productivity during vacancy and ramp", amount: departures > 0 ? Math.round(productivityGap / departures) : 0 }],
      source: "General industry estimates",
    },
  ];

  return {
    departures,
    annualSalary,
    loadedAnnualCost: annualSalary,
    totalAnnual,
    dailyBleed: totalAnnual / 365,
    perDeparture: departures > 0 ? Math.round(totalAnnual / departures) : 0,
    stabilityScore: Math.max(0, Math.min(100, 100 - turnoverRate)),
    categories,
    visibleCost: recruitmentCost,
    hiddenCost: trainingCost + productivityGap,
    regionSupported: false,
  };
}

export function calculateChurn(
  region: Region | null,
  teamSize: number,
  turnoverRate: number,
  baseMonthlySalary: number,
  acqFriction: number,
  rampMonths: number,
): ChurnResult {
  if (region === "ireland") {
    return calcIreland(teamSize, turnoverRate, baseMonthlySalary);
  }
  // Other regions use generic for now
  return calcGeneric(teamSize, turnoverRate, baseMonthlySalary, acqFriction, rampMonths);
}
