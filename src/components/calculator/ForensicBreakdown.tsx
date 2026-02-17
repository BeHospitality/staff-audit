import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { ChurnResult, CategoryBreakdown } from "@/lib/churnCalculations";

function formatCurrency(val: number, prefix = "€") {
  return prefix + val.toLocaleString("en-IE", { maximumFractionDigits: 0 });
}

function CategoryRow({ cat, currency, defaultOpen = false }: { cat: CategoryBreakdown; currency: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/40 hover:bg-secondary/60 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">
          {cat.label} <span className="text-muted-foreground">({cat.pct}%)</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{formatCurrency(Math.round(cat.annualTotal), currency)}</span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 animate-fade-in bg-card/40">
          <p className="text-xs text-muted-foreground mb-2">
            Cost per departure: {formatCurrency(cat.costPerDeparture, currency)}
          </p>
          {cat.lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{formatCurrency(item.amount, currency)}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/20 mt-3">
            {cat.source}
          </p>
        </div>
      )}
    </div>
  );
}

interface ForensicBreakdownProps {
  calc: ChurnResult;
  currency: string;
  visible: boolean;
}

export default function ForensicBreakdown({ calc, currency, visible }: ForensicBreakdownProps) {
  if (!visible) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      {calc.categories.map((cat, i) => (
        <CategoryRow key={i} cat={cat} currency={currency} />
      ))}

      {/* What you SEE vs DON'T SEE */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-foreground">What This Means</p>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">What you <span className="font-semibold text-foreground">SEE</span> on your P&L:</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(Math.round(calc.visibleCost), currency)}</p>
            <p className="text-xs text-muted-foreground">
              = {calc.totalAnnual > 0 ? Math.round((calc.visibleCost / calc.totalAnnual) * 100) : 0}% of the real cost
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">What you <span className="font-semibold text-destructive">DON'T SEE</span>:</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(Math.round(calc.hiddenCost), currency)}</p>
            <p className="text-xs text-muted-foreground">
              = {calc.totalAnnual > 0 ? Math.round((calc.hiddenCost / calc.totalAnnual) * 100) : 0}% of the real cost
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            This is why most operators underestimate turnover impact. The majority of the cost is invisible on traditional reports.
          </p>
        </div>
      </div>

      {!calc.regionSupported && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Full region-specific calculations coming soon. Currently showing general methodology.
          </p>
        </div>
      )}
    </div>
  );
}
