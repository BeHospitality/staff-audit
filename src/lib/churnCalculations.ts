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

function clamp(min: number, max: number, val: number): number {
  return Math.max(min, Math.min(max, val));
}

function buildResult(departures: number, annualSalary: number, loadedAnnualCost: number, categories: CategoryBreakdown[], visibleCatIndex: number): ChurnResult {
  const totalAnnual = Math.round(categories.reduce((s, c) => s + c.annualTotal, 0));
  const cats = categories.map(c => ({
    ...c,
    pct: totalAnnual > 0 ? Math.round((c.annualTotal / totalAnnual) * 100) : 0,
  }));
  const visibleCost = Math.round(cats[visibleCatIndex]?.annualTotal ?? 0);
  const hiddenCost = totalAnnual - visibleCost;
  return {
    departures,
    annualSalary,
    loadedAnnualCost,
    totalAnnual,
    dailyBleed: totalAnnual / 365,
    monthlyCost: totalAnnual / 12,
    perDeparture: departures > 0 ? Math.round(totalAnnual / departures) : 0,
    stabilityScore: Math.max(0, Math.min(100, 100 - Math.round((annualSalary * 0 + departures * 0) * 0))),
    categories: cats,
    visibleCost,
    hiddenCost,
    invisiblePercentage: totalAnnual > 0 ? Math.round((hiddenCost / totalAnnual) * 100) : 0,
    regionSupported: true,
  };
}

// ─── IRELAND (unchanged) ───
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

  // Category 1: Recruitment & Onboarding — use blended cost × departures for consistency
  const cat1Total = Math.round(recruitmentCostPer) * departures;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Onboarding",
    costPerDeparture: Math.round(recruitmentCostPer),
    annualTotal: cat1Total,
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

  // Category 3: Productivity Loss — scales with salary, calibrated so €2,400/mo = €1,200
  const productivityCostPer = Math.round(Math.max(600, Math.min(2400, (baseMonthlySalary / 2400) * 1200)));
  const cat3Total = productivityCostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Loss",
    costPerDeparture: productivityCostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: `8–12 week ramp-up at 70% effectiveness (€${baseMonthlySalary}/mo salary)`, amount: productivityCostPer },
    ],
    source: "CSO avg weekly wage, Fáilte Ireland sector analysis",
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

// ─── USA ───
function calcUSA(teamSize: number, turnoverRate: number, baseMonthlySalary: number, agencySplit: number): ChurnResult {
  const directSplit = 100 - agencySplit;
  const departures = Math.round(teamSize * (turnoverRate / 100));
  const annualSalary = baseMonthlySalary * 12;

  const agencyRecruitmentCost = 5250;
  const directRecruitmentCost = 1950;
  const recruitmentCostPer = ((agencySplit / 100) * agencyRecruitmentCost) + ((directSplit / 100) * directRecruitmentCost);
  const agencyHires = Math.round(departures * (agencySplit / 100));
  const directHires = departures - agencyHires;

  const cat1Total = Math.round(recruitmentCostPer) * departures;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Onboarding",
    costPerDeparture: Math.round(recruitmentCostPer),
    annualTotal: cat1Total,
    pct: 0,
    lineItems: [
      { label: `Agency recruitment (${agencySplit}%): ${agencyHires} hires × $5,250`, amount: agencyHires * agencyRecruitmentCost },
      { label: `Direct recruitment (${directSplit}%): ${directHires} hires × $1,950`, amount: directHires * directRecruitmentCost },
      { label: "Includes background checks (criminal + reference + drug screen)", amount: 200 * departures },
    ],
    source: "SHRM 2025/2026 Talent Acquisition Benchmarking, BLS, AHLA",
  };

  const trainingCostPer = 500;
  const cat2Total = trainingCostPer * departures;
  const cat2: CategoryBreakdown = {
    label: "Training & Compliance",
    costPerDeparture: trainingCostPer,
    annualTotal: cat2Total,
    pct: 0,
    lineItems: [
      { label: "OSHA safety training", amount: 100 },
      { label: "Food safety (ServSafe)", amount: 120 },
      { label: "Sexual harassment training", amount: 50 },
      { label: "Alcohol service (TIPS/TAM)", amount: 40 },
      { label: "Uniform & materials", amount: 190 },
    ],
    source: "OSHA, National Restaurant Association, state compliance requirements",
  };

  const productivityCostPer = Math.round(clamp(800, 2400, (baseMonthlySalary / 3500) * 1800));
  const cat3Total = productivityCostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Loss",
    costPerDeparture: productivityCostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: `12-week ramp at 70% effectiveness ($${baseMonthlySalary.toLocaleString()}/mo salary)`, amount: productivityCostPer },
    ],
    source: "Cornell Center for Hospitality Research, SHRM onboarding benchmarks",
  };

  const earlyDepartureCostPer = 1000;
  const cat4Total = earlyDepartureCostPer * departures;
  const cat4: CategoryBreakdown = {
    label: "Early Departure Risk",
    costPerDeparture: earlyDepartureCostPer,
    annualTotal: cat4Total,
    pct: 0,
    lineItems: [
      { label: "25% fail within first 90 days × $5,500 sunk cost", amount: 1000 },
    ],
    source: "BLS JOLTS data, SHRM cost-of-bad-hire benchmarks",
  };

  const totalAnnual = Math.round(cat1Total + cat2Total + cat3Total + cat4Total);
  const categories = [cat1, cat2, cat3, cat4].map(c => ({
    ...c,
    pct: totalAnnual > 0 ? Math.round((c.annualTotal / totalAnnual) * 100) : 0,
  }));

  const visibleCost = Math.round(cat1Total);
  const hiddenCost = totalAnnual - visibleCost;

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
    regionSupported: true,
  };
}

// ─── UAE ───
function calcUAE(teamSize: number, turnoverRate: number, baseMonthlySalary: number, agencySplit: number): ChurnResult {
  const directSplit = 100 - agencySplit;
  const departures = Math.round(teamSize * (turnoverRate / 100));
  const annualSalary = baseMonthlySalary * 12;

  const agencyRecruitmentCost = 17800;
  const directRecruitmentCost = 7700;
  const recruitmentCostPer = ((agencySplit / 100) * agencyRecruitmentCost) + ((directSplit / 100) * directRecruitmentCost);
  const agencyHires = Math.round(departures * (agencySplit / 100));
  const directHires = departures - agencyHires;

  const cat1Total = Math.round(recruitmentCostPer) * departures;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Deployment",
    costPerDeparture: Math.round(recruitmentCostPer),
    annualTotal: cat1Total,
    pct: 0,
    lineItems: [
      { label: `Agency deployment (${agencySplit}%): ${agencyHires} hires × AED 17,800`, amount: agencyHires * agencyRecruitmentCost },
      { label: `Direct recruitment (${directSplit}%): ${directHires} hires × AED 7,700`, amount: directHires * directRecruitmentCost },
    ],
    source: "MOHRE, Gateway Hospitality, KPMG Dubai Hospitality Report 2025",
  };

  const trainingCostPer = 3000;
  const cat2Total = trainingCostPer * departures;
  const cat2: CategoryBreakdown = {
    label: "Training & Compliance",
    costPerDeparture: trainingCostPer,
    annualTotal: cat2Total,
    pct: 0,
    lineItems: [
      { label: "Fire safety", amount: 400 },
      { label: "Food safety (HACCP)", amount: 500 },
      { label: "Dubai Municipality health", amount: 300 },
      { label: "Brand/cultural orientation", amount: 600 },
      { label: "Uniform & materials", amount: 700 },
      { label: "Language/service training", amount: 500 },
    ],
    source: "Dubai Municipality, UAE Civil Defence, DTCM service standards",
  };

  const productivityCostPer = Math.round(clamp(4000, 12000, (baseMonthlySalary / 5500) * 8000));
  const cat3Total = productivityCostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Loss",
    costPerDeparture: productivityCostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: `8-week ramp at 65% effectiveness (AED ${baseMonthlySalary.toLocaleString()}/mo)`, amount: Math.round(productivityCostPer * 0.5) },
      { label: "Language/cultural adjustment penalty", amount: 2000 },
      { label: "Housing orientation & settling period", amount: 1500 },
    ],
    source: "Emirates Academy of Hospitality Management, HFTP Middle East",
  };

  const housingCostPer = 2000;
  const cat4Total = housingCostPer * departures;
  const cat4: CategoryBreakdown = {
    label: "Housing Coordination",
    costPerDeparture: housingCostPer,
    annualTotal: cat4Total,
    pct: 0,
    lineItems: [
      { label: "Staff accommodation finding", amount: 800 },
      { label: "Housing inspection", amount: 400 },
      { label: "Lease administration", amount: 400 },
      { label: "Turnover cleaning/prep", amount: 400 },
    ],
    source: "UAE labour law — employer housing obligations, Dubai Land Department",
  };

  const endOfServiceCostPer = 3000;
  const cat5Total = endOfServiceCostPer * departures;
  const cat5: CategoryBreakdown = {
    label: "End-of-Service Risk",
    costPerDeparture: endOfServiceCostPer,
    annualTotal: cat5Total,
    pct: 0,
    lineItems: [
      { label: "25% leave within 90 days × AED 16,000 sunk cost", amount: 3000 },
    ],
    source: "UAE Federal Labour Law (Decree-Law No. 33/2021), MOHRE gratuity guidelines",
  };

  const totalAnnual = Math.round(cat1Total + cat2Total + cat3Total + cat4Total + cat5Total);
  const categories = [cat1, cat2, cat3, cat4, cat5].map(c => ({
    ...c,
    pct: totalAnnual > 0 ? Math.round((c.annualTotal / totalAnnual) * 100) : 0,
  }));

  const visibleCost = Math.round(cat1Total);
  const hiddenCost = totalAnnual - visibleCost;

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
    regionSupported: true,
  };
}

// ─── EUROPE ───
function calcEurope(teamSize: number, turnoverRate: number, baseMonthlySalary: number, agencySplit: number): ChurnResult {
  const directSplit = 100 - agencySplit;
  const departures = Math.round(teamSize * (turnoverRate / 100));
  const annualSalary = baseMonthlySalary * 12;

  const agencyRecruitmentCost = 3650;
  const directRecruitmentCost = 1230;
  const recruitmentCostPer = ((agencySplit / 100) * agencyRecruitmentCost) + ((directSplit / 100) * directRecruitmentCost);
  const agencyHires = Math.round(departures * (agencySplit / 100));
  const directHires = departures - agencyHires;

  const cat1Total = Math.round(recruitmentCostPer) * departures;
  const cat1: CategoryBreakdown = {
    label: "Recruitment & Onboarding",
    costPerDeparture: Math.round(recruitmentCostPer),
    annualTotal: cat1Total,
    pct: 0,
    lineItems: [
      { label: `Agency recruitment (${agencySplit}%): ${agencyHires} hires × €3,650`, amount: agencyHires * agencyRecruitmentCost },
      { label: `Direct recruitment (${directSplit}%): ${directHires} hires × €1,230`, amount: directHires * directRecruitmentCost },
    ],
    source: "Eurostat, HOTREC, Destatis, INSEE, ONS",
  };

  const trainingCostPer = 400;
  const cat2Total = trainingCostPer * departures;
  const cat2: CategoryBreakdown = {
    label: "Training & Compliance",
    costPerDeparture: trainingCostPer,
    annualTotal: cat2Total,
    pct: 0,
    lineItems: [
      { label: "Health & safety (EU directive)", amount: 100 },
      { label: "Food hygiene (HACCP)", amount: 80 },
      { label: "Fire safety", amount: 60 },
      { label: "GDPR data handling", amount: 30 },
      { label: "Uniform & materials", amount: 130 },
    ],
    source: "EU Framework Directive 89/391/EEC, HACCP, GDPR",
  };

  const productivityCostPer = Math.round(clamp(500, 1800, (baseMonthlySalary / 2800) * 1100));
  const cat3Total = productivityCostPer * departures;
  const cat3: CategoryBreakdown = {
    label: "Productivity Loss",
    costPerDeparture: productivityCostPer,
    annualTotal: cat3Total,
    pct: 0,
    lineItems: [
      { label: `10-week ramp at 70% effectiveness (€${baseMonthlySalary.toLocaleString()}/mo salary)`, amount: productivityCostPer },
    ],
    source: "Eurostat labour productivity data, HOTREC workforce studies",
  };

  const earlyDepartureCostPer = 700;
  const cat4Total = earlyDepartureCostPer * departures;
  const cat4: CategoryBreakdown = {
    label: "Early Departure Risk",
    costPerDeparture: earlyDepartureCostPer,
    annualTotal: cat4Total,
    pct: 0,
    lineItems: [
      { label: "20% fail within first 90 days × €4,100 sunk cost", amount: 700 },
    ],
    source: "HOTREC retention data, Eurostat job tenure statistics",
  };

  const totalAnnual = Math.round(cat1Total + cat2Total + cat3Total + cat4Total);
  const categories = [cat1, cat2, cat3, cat4].map(c => ({
    ...c,
    pct: totalAnnual > 0 ? Math.round((c.annualTotal / totalAnnual) * 100) : 0,
  }));

  const visibleCost = Math.round(cat1Total);
  const hiddenCost = totalAnnual - visibleCost;

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
  if (region === "usa") {
    return calcUSA(teamSize, turnoverRate, baseMonthlySalary, agencySplit);
  }
  if (region === "uae") {
    return calcUAE(teamSize, turnoverRate, baseMonthlySalary, agencySplit);
  }
  if (region === "eu") {
    return calcEurope(teamSize, turnoverRate, baseMonthlySalary, agencySplit);
  }
  return calcGeneric(teamSize, turnoverRate, baseMonthlySalary, acqFriction, rampMonths);
}
