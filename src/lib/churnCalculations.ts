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
  const employerPRSI = annualSalary * 0.1125;
  const loadedAnnualCost = annualSalary + employerPRSI;

  // Category 1: Recruitment & Admin — €2,600 per departure
  const cat1CostPer = 2600;
  const cat1Total = cat1CostPer * departures;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Admin",
    costPerDeparture: cat1CostPer,
    annualTotal: cat1Total,
    pct: 0,
    lineItems: [
      { label: "Direct Costs (jobs.ie, Indeed Ireland)", amount: 400 },
      { label: "Background Screening", amount: 150 },
      { label: "HR Time (12 hours @ €42/hr)", amount: 504 },
      { label: "Manager Time (6 hours @ €52/hr)", amount: 312 },
      { label: "Onboarding Admin (PRSI, Pension, SSP setup)", amount: 1234 },
    ],
    source: "Based on ITIC March 2024 Cost Analysis and Excel Recruitment 2026 Salary Guide (€3,500 benchmark)",
  };

  // Category 2: Training & Ramp-Up — €3,100 per departure
  const cat2CostPer = 3100;
  const cat2Total = cat2CostPer * departures;
  const cat2: CategoryBreakdown = {
    label: "Training & Ramp-Up",
    costPerDeparture: cat2CostPer,
    annualTotal: cat2Total,
    pct: 0,
    lineItems: [
      { label: "Trainer Time (32 hours @ €30/hr)", amount: 960 },
      { label: "Materials & Uniforms", amount: 280 },
      { label: "Peer Mentoring (20 hours @ €24/hr)", amount: 480 },
      { label: "Shadow Period (3 weeks dual payroll)", amount: 900 },
      { label: "Productivity Ramp-Up Loss", amount: 480 },
    ],
    source: "Based on Fáilte Ireland sector research and Shadow Hours methodology (dual payroll during training period)",
  };

  // Category 3: Productivity Gap — €10,800 per departure
  const cat3CostPer = 10800;
  const cat3Total = cat3CostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Gap",
    costPerDeparture: cat3CostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: "Position Vacancy Cost (45 days @ 50%)", amount: 2475 },
      { label: "Overtime Coverage (4 staff × 16hrs × 1.5x)", amount: 1728 },
      { label: "Notice Period Productivity Loss (4 wks @ 30%)", amount: 720 },
      { label: "Service Quality Impact (1% RevPAR, 2 months)", amount: 2400 },
      { label: "Labor Market Scarcity Premium (4.2% unemployment)", amount: 630 },
      { label: "Structural Labor Shortage Extension", amount: 2847 },
    ],
    source: "Based on CSO unemployment data (4.2%), IHF labor shortage research (29% hiring difficulty), Fáilte Ireland sector analysis (8.5% labor hour decline), and ITIC operational cost study",
  };

  // Category 4: Notice Period Overhead — €1,500 per departure
  const cat4CostPer = 1500;
  const cat4Total = cat4CostPer * departures;
  const cat4: CategoryBreakdown = {
    label: "Notice Period Overhead",
    costPerDeparture: cat4CostPer,
    annualTotal: cat4Total,
    pct: 0,
    lineItems: [
      { label: "6-week notice @ 40% productivity loss", amount: 1440 },
      { label: "Transition admin", amount: 60 },
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
