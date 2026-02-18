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
  monthlyCost: number;
  perDeparture: number;
  stabilityScore: number;
  categories: CategoryBreakdown[];
  visibleCost: number;
  hiddenCost: number;
  invisiblePercentage: number;
  regionSupported: boolean;
}

function calcIreland(
  teamSize: number,
  turnoverRate: number,
  baseMonthlySalary: number,
  agencySplit: number,
): ChurnResult {
  const directSplit = 100 - agencySplit;
  const departures = Math.round(teamSize * (turnoverRate / 100));
  const annualSalary = baseMonthlySalary * 12;
  const employerPRSI = annualSalary * 0.1125;
  const loadedAnnualCost = annualSalary + employerPRSI;

  // Recruitment cost (blended)
  const agencyRecruitmentCost = 3880; // Agency fee €3,500 + HR €200 + onboarding €180
  const directRecruitmentCost = 1280; // Job boards €400 + HR screening €400 + manager interviews €300 + onboarding €180
  const recruitmentCostPer = ((agencySplit / 100) * agencyRecruitmentCost) + ((directSplit / 100) * directRecruitmentCost);

  const agencyHires = Math.round(departures * (agencySplit / 100));
  const directHires = departures - agencyHires;

  // Category 1: Recruitment & Onboarding
  const cat1Total = departures * recruitmentCostPer;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Onboarding",
    costPerDeparture: Math.round(recruitmentCostPer),
    annualTotal: Math.round(cat1Total),
    pct: 0,
    lineItems: [
      { label: `Agency recruitment (${agencySplit}%): ${agencyHires} hires × €3,880`, amount: agencyHires * agencyRecruitmentCost },
      { label: `Direct recruitment (${directSplit}%): ${directHires} hires × €1,280`, amount: directHires * directRecruitmentCost },
    ],
    source: "IHF, Excel Recruitment 2026 Salary Guide, ITIC March 2024",
  };

  // Category 2: Training & Compliance — €350 per departure
  const trainingCostPer = 350;
  const cat2Total = trainingCostPer * departures;
  const cat2: CategoryBreakdown = {
    label: "Training & Compliance",
    costPerDeparture: trainingCostPer,
    annualTotal: cat2Total,
    pct: 0,
    lineItems: [
      { label: "Fire Safety", amount: 80 },
      { label: "Manual Handling", amount: 60 },
      { label: "HACCP / Food Safety", amount: 60 },
      { label: "Uniform & Materials", amount: 150 },
    ],
    source: "Fáilte Ireland mandatory compliance requirements",
  };

  // Category 3: Productivity Loss — €1,200 per departure
  const productivityCostPer = 1200;
  const cat3Total = productivityCostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Loss",
    costPerDeparture: productivityCostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: "8–12 week ramp-up at 70% effectiveness", amount: 1200 },
    ],
    source: "CSO avg weekly wage: €615/week, Fáilte Ireland sector analysis",
  };

  // Category 4: Early Departure Risk — €800 per departure
  const earlyDepartureCostPer = 800;
  const cat4Total = earlyDepartureCostPer * departures;
  const cat4: CategoryBreakdown = {
    label: "Early Departure Risk",
    costPerDeparture: earlyDepartureCostPer,
    annualTotal: cat4Total,
    pct: 0,
    lineItems: [
      { label: "20% failure rate × €3,990 sunk cost", amount: 800 },
    ],
    source: "IHF labour retention data, Fáilte Ireland 90-day attrition studies",
  };

  const totalAnnual = Math.round(cat1Total + cat2Total + cat3Total + cat4Total);
  const categories = [cat1, cat2, cat3, cat4].map(c => ({
    ...c,
    pct: totalAnnual > 0 ? Math.round((c.annualTotal / totalAnnual) * 100) : 0,
  }));

  const visibleCost = Math.round(cat1Total);
  const hiddenCost = totalAnnual - visibleCost;
  const invisiblePercentage = totalAnnual > 0 ? Math.round((hiddenCost / totalAnnual) * 100) : 0;

  return {
    departures,
    annualSalary,
    loadedAnnualCost,
    totalAnnual,
    dailyBleed: totalAnnual / 365,
    monthlyCost: totalAnnual / 12,
    perDeparture: departures > 0 ? Math.round(totalAnnual / departures) : 0,
    stabilityScore: Math.max(0, Math.min(100, 100 - turnoverRate)),
    categories,
    visibleCost,
    hiddenCost,
    invisiblePercentage,
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
  const totalAnnual = Math.round(recruitmentCost + trainingCost + productivityGap);

  const visibleCost = recruitmentCost;
  const hiddenCost = totalAnnual - visibleCost;

  const categories: CategoryBreakdown[] = [
    {
      label: "Recruitment & Onboarding",
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
    monthlyCost: totalAnnual / 12,
    perDeparture: departures > 0 ? Math.round(totalAnnual / departures) : 0,
    stabilityScore: Math.max(0, Math.min(100, 100 - turnoverRate)),
    categories,
    visibleCost,
    hiddenCost,
    invisiblePercentage: totalAnnual > 0 ? Math.round((hiddenCost / totalAnnual) * 100) : 0,
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
  agencySplit: number = 60,
): ChurnResult {
  if (region === "ireland") {
    return calcIreland(teamSize, turnoverRate, baseMonthlySalary, agencySplit);
  }
  return calcGeneric(teamSize, turnoverRate, baseMonthlySalary, acqFriction, rampMonths);
}
