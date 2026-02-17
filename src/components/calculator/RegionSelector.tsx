import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft } from "lucide-react";

export type Region = "ireland" | "usa" | "eu" | "uae";

export interface RegionDefaults {
  baseSalary: number;
  acqFriction: number;
  currencySymbol: string;
  label: string;
}

interface CostDriver {
  title: string;
  detail: string;
}

interface RegionData {
  id: Region;
  flag: string;
  name: string;
  defaults: RegionDefaults;
  insightHeading: string;
  costDrivers: CostDriver[];
  source: string;
  bottomText: string;
}

const REGIONS: RegionData[] = [
  {
    id: "ireland",
    flag: "🇮🇪",
    name: "Ireland",
    defaults: { baseSalary: 2100, acqFriction: 2200, currencySymbol: "€", label: "Ireland" },
    insightHeading: "Ireland: Understanding Your Costs",
    costDrivers: [
      { title: "Employer PRSI: 11.05% (2024 rate)", detail: "Adds €2,650/year per €24K employee" },
      { title: "Statutory Sick Pay: 5→10 days by 2026", detail: "Increases baseline labor cost" },
      { title: "Labor Market: 4.2% unemployment", detail: "Average 52 days to fill vacant positions" },
      { title: "Notice Periods: 4–6 weeks standard", detail: "Creates \"productivity drag\" during exit" },
    ],
    source: "Irish Hotels Federation 2024 Report",
    bottomText: "These regional factors are built into the calculations below. Every number is based on Ireland-specific benchmarks from the Irish Hotels Federation and Cornell Center for Hospitality Research.",
  },
  {
    id: "usa",
    flag: "🇺🇸",
    name: "United States",
    defaults: { baseSalary: 3200, acqFriction: 4000, currencySymbol: "$", label: "United States" },
    insightHeading: "United States: Understanding Your Costs",
    costDrivers: [
      { title: "SHRM Cost-per-Hire: $4,700 average", detail: "Industry benchmark for replacement cost" },
      { title: "Background Checks: $60–180 standard", detail: "Required for most hospitality positions" },
      { title: "At-Will Employment: No notice period mandate", detail: "Creates sudden departure risk" },
      { title: "Productivity Loss: 52% of total cost", detail: "Cornell research on new-hire ramp-up" },
    ],
    source: "Cornell Center for Hospitality Research",
    bottomText: "These regional factors are built into the calculations below. Every number is based on US-specific benchmarks from SHRM and the Cornell Center for Hospitality Research.",
  },
  {
    id: "eu",
    flag: "🇪🇺",
    name: "European Union",
    defaults: { baseSalary: 2600, acqFriction: 3000, currencySymbol: "€", label: "European Union" },
    insightHeading: "European Union: Understanding Your Costs",
    costDrivers: [
      { title: "Labor Shortage: 250K missing workers (Italy)", detail: "Severe scarcity across member states" },
      { title: "High Social Charges: 32–45% depending on country", detail: "Significantly increases true labor cost" },
      { title: "Notice Periods: 4–12 weeks standard", detail: "Extended transition creates overlap costs" },
      { title: "Vacancy Duration: Extended due to scarcity", detail: "Average 60+ days to fill roles" },
    ],
    source: "HOTREC Skills & Labour Report 2026",
    bottomText: "These regional factors are built into the calculations below. Every number is based on EU-wide benchmarks from HOTREC and the European Commission Labour Market reports.",
  },
  {
    id: "uae",
    flag: "🇦🇪",
    name: "United Arab Emirates",
    defaults: { baseSalary: 3500, acqFriction: 5000, currencySymbol: "AED ", label: "UAE" },
    insightHeading: "United Arab Emirates: Understanding Your Costs",
    costDrivers: [
      { title: "Zero-Fee Law: Employer pays ALL visa costs", detail: "AED 5,000–11,000 per hire minimum" },
      { title: "Deployment Costs: Flights, housing, onboarding", detail: "Adds 20–30% to each replacement" },
      { title: "End-of-Service Gratuity: 21–30 days per year", detail: "Mandatory payout on departure" },
      { title: "Mandatory Benefits: Health insurance, flights", detail: "Annual return flights + medical cover" },
    ],
    source: "UAE Federal Decree-Law No. 33/2021",
    bottomText: "These regional factors are built into the calculations below. Every number is based on UAE-specific benchmarks from Federal labour regulations and regional hospitality research.",
  },
];

const STORAGE_KEY = "staff-audit-region";

interface RegionSelectorProps {
  onRegionConfirmed: (region: Region, defaults: RegionDefaults) => void;
  onChangeRegion: () => void;
  isConfirmed: boolean;
  currentRegion: Region | null;
}

export default function RegionSelector({ onRegionConfirmed, onChangeRegion, isConfirmed, currentRegion }: RegionSelectorProps) {
  const [step, setStep] = useState<1 | 2>(currentRegion ? 2 : 1);
  const [selected, setSelected] = useState<Region | null>(currentRegion);
  const calcRef = useRef<HTMLDivElement>(null);

  const selectedRegion = REGIONS.find((r) => r.id === selected);

  // Sync with parent when region is cleared
  useEffect(() => {
    if (!currentRegion) {
      setStep(1);
      setSelected(null);
    }
  }, [currentRegion]);

  const handleSelect = (region: RegionData) => {
    setSelected(region.id);
    setStep(2);
    localStorage.setItem(STORAGE_KEY, region.id);
  };

  const handleBack = () => {
    setStep(1);
    setSelected(null);
    localStorage.removeItem(STORAGE_KEY);
    onChangeRegion();
  };

  const handleConfirm = () => {
    if (selectedRegion) {
      onRegionConfirmed(selectedRegion.id, selectedRegion.defaults);
    }
  };

  // If already confirmed, don't render the selector
  if (isConfirmed) return null;

  return (
    <section className="max-w-[1000px] mx-auto px-4 pb-8">
      <Card className="border-border/50 bg-secondary/30 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8 md:p-10">
          {step === 1 && (
            <div className="animate-fade-in" key="step1">
              {/* Step 1: Region Selection */}
              <div className="text-center mb-10">
                <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-2xl md:text-[28px] font-bold text-foreground mb-3">
                  Where is your property located?
                </h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Staff turnover costs vary significantly by region due to labor laws, social charges, and recruitment markets. Select your location for accurate calculations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleSelect(region)}
                    className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/60 p-8 min-h-[140px] transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <span className="text-4xl mb-3">{region.flag}</span>
                    <span className="text-sm font-semibold text-foreground">{region.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedRegion && (
            <div className="animate-fade-in" key="step2" ref={calcRef}>
              {/* Step 2: Regional Insight */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Region
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                {selectedRegion.flag} {selectedRegion.insightHeading}
              </h2>

              <div className="border-t border-border/30 pt-6 mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Key Cost Drivers</p>
                <div className="space-y-5">
                  {selectedRegion.costDrivers.map((driver, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-0.5">•</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{driver.title}</p>
                        <p className="text-sm text-muted-foreground">{driver.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/30 pt-6 mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedRegion.bottomText}
                </p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Source: {selectedRegion.source}
                </p>
              </div>

              <div className="text-center">
                <Button
                  variant="gold"
                  size="lg"
                  className="text-base px-8 py-6 shadow-lg shadow-primary/20 hover-scale"
                  onClick={handleConfirm}
                >
                  Calculate My Turnover Cost →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

/* Region badge shown above the calculator */
export function RegionBadge({ region, flag, onChangeRegion }: { region: string; flag: string; onChangeRegion: () => void }) {
  return (
    <div className="flex items-center justify-end mb-4">
      <button
        onClick={onChangeRegion}
        className="flex items-center gap-2 text-sm bg-secondary/60 border border-border/50 rounded-full px-4 py-1.5 hover:border-primary/40 transition-colors"
      >
        <span>{flag}</span>
        <span className="text-foreground font-medium">{region}</span>
        <span className="text-primary text-xs font-medium ml-1">Change</span>
      </button>
    </div>
  );
}

export { REGIONS };
