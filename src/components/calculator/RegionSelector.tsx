import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

export type Region = "ireland" | "usa" | "eu" | "uae";

export interface RegionDefaults {
  baseSalary: number;
  acqFriction: number;
  currencySymbol: string;
  label: string;
}

const REGIONS: { id: Region; flag: string; name: string; defaults: RegionDefaults; insight: string }[] = [
  {
    id: "ireland",
    flag: "🇮🇪",
    name: "Ireland",
    defaults: { baseSalary: 2800, acqFriction: 2500, currencySymbol: "€", label: "Ireland" },
    insight: "Irish employers face high PRSI costs (11.05%) and statutory redundancy obligations. The hospitality sector averages 30% annual turnover, with recruitment agency fees typically 15–20% of salary.",
  },
  {
    id: "usa",
    flag: "🇺🇸",
    name: "United States",
    defaults: { baseSalary: 3200, acqFriction: 4000, currencySymbol: "$", label: "United States" },
    insight: "US employers face at-will employment with high rehiring velocity. Average cost-per-hire is $4,700 (SHRM), and hospitality turnover exceeds 73% annually — the highest of any sector.",
  },
  {
    id: "eu",
    flag: "🇪🇺",
    name: "European Union",
    defaults: { baseSalary: 2600, acqFriction: 3000, currencySymbol: "€", label: "European Union" },
    insight: "EU labour protections (notice periods, severance) increase the true cost of each departure. Social charges average 25–35% on top of gross salary across member states.",
  },
  {
    id: "uae",
    flag: "🇦🇪",
    name: "United Arab Emirates",
    defaults: { baseSalary: 3500, acqFriction: 5000, currencySymbol: "AED ", label: "UAE" },
    insight: "UAE employers bear visa processing, end-of-service gratuity, and repatriation costs per employee. Sponsorship turnover in hospitality can add 20–30% to replacement costs.",
  },
];

interface RegionSelectorProps {
  onSelect: (region: Region, defaults: RegionDefaults) => void;
}

export default function RegionSelector({ onSelect }: RegionSelectorProps) {
  const [selected, setSelected] = useState<Region | null>(null);
  const selectedRegion = REGIONS.find((r) => r.id === selected);

  const handleSelect = (region: (typeof REGIONS)[number]) => {
    setSelected(region.id);
    onSelect(region.id, region.defaults);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pb-8">
      <Card className="border-border/50 bg-secondary/30 backdrop-blur-sm">
        <CardContent className="p-6 md:p-10">
          <div className="text-center mb-8">
            <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
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
                className={`group flex flex-col items-center justify-center rounded-xl border bg-card/60 p-8 min-h-[140px] transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 ${
                  selected === region.id
                    ? "border-primary shadow-lg shadow-primary/15 ring-1 ring-primary/30"
                    : "border-border/50"
                }`}
              >
                <span className="text-4xl mb-3">{region.flag}</span>
                <span className="text-sm font-semibold text-foreground">{region.name}</span>
              </button>
            ))}
          </div>

          {selectedRegion && (
            <div className="mt-8 animate-fade-in">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6 text-center max-w-lg mx-auto">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="text-primary font-semibold">{selectedRegion.flag} {selectedRegion.name}:</span>{" "}
                  {selectedRegion.insight}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Default values adjusted for your region. Scroll down to fine-tune.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
