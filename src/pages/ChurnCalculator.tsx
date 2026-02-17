import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ChevronDown, ChevronUp, TrendingDown, Users, Clock, DollarSign, Target, ClipboardList, BarChart3, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProtocolDossier from "@/components/calculator/ProtocolDossier";
import PricingSection from "@/components/calculator/PricingSection";
import RegionSelector, { type Region, type RegionDefaults } from "@/components/calculator/RegionSelector";

function formatCurrency(val: number, prefix = "€") {
  return prefix + val.toLocaleString("en-IE", { maximumFractionDigits: 0 });
}

export default function ChurnCalculator() {
  const navigate = useNavigate();
  const [teamCapacity, setTeamCapacity] = useState(50);
  const [churnVelocity, setChurnVelocity] = useState(50);
  const [baseSalary, setBaseSalary] = useState(2800);
  const [rampMonths, setRampMonths] = useState(3);
  const [acqFriction, setAcqFriction] = useState(2500);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("€");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handleRegionSelect = (region: Region, defaults: RegionDefaults) => {
    setSelectedRegion(region);
    setBaseSalary(defaults.baseSalary);
    setAcqFriction(defaults.acqFriction);
    setCurrencySymbol(defaults.currencySymbol);
  };

  const fmt = (val: number) => formatCurrency(val, currencySymbol);

  const calc = useMemo(() => {
    const departures = teamCapacity * (churnVelocity / 100);
    const annualSalary = baseSalary * 12;
    const rampFactor = rampMonths / 3;
    const recruitmentCost = departures * acqFriction;
    const trainingCost = departures * (annualSalary * 0.25 * rampFactor);
    const productivityGap = departures * (annualSalary * 0.2756 * rampFactor);
    const totalAnnual = recruitmentCost + trainingCost + productivityGap;
    const dailyBleed = totalAnnual / 365;
    const stabilityScore = Math.max(0, Math.min(100, 100 - churnVelocity));
    const recoveryPotential = totalAnnual * 0.4 / 12;

    return {
      departures: Math.round(departures),
      recruitmentCost,
      trainingCost,
      productivityGap,
      totalAnnual,
      dailyBleed,
      stabilityScore,
      annualSalary,
      recoveryPotential,
      recruitPct: totalAnnual > 0 ? recruitmentCost / totalAnnual : 0,
      trainPct: totalAnnual > 0 ? trainingCost / totalAnnual : 0,
      prodPct: totalAnnual > 0 ? productivityGap / totalAnnual : 0,
    };
  }, [teamCapacity, churnVelocity, baseSalary, rampMonths, acqFriction]);

  const scoreColor = calc.stabilityScore <= 40 ? "text-destructive" : calc.stabilityScore <= 70 ? "text-primary" : "text-success";
  const scoreBg = calc.stabilityScore <= 40 ? "bg-destructive/15" : calc.stabilityScore <= 70 ? "bg-primary/15" : "bg-success/15";
  const scoreBadge = calc.stabilityScore <= 40 ? "Critical Alert" : calc.stabilityScore <= 70 ? "Moderate Risk" : "Stabilization Recommended";

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary text-lg tracking-wide">Be Connect</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/pulse/login")} className="text-muted-foreground hover:text-foreground">
          Manager Login →
        </Button>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 pt-8 pb-6 md:pt-12 md:pb-8 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Identify Your Hidden<br />
          <span className="text-primary">Operational Churn Tax</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Turnover isn't just HR friction — it's a direct leak on your bottom line.
        </p>
      </section>

      {/* Tabs */}
      <RegionSelector onSelect={handleRegionSelect} />

      {/* Tabs */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <Tabs defaultValue="diagnostic" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8 bg-secondary/60 h-12">
            <TabsTrigger value="diagnostic" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-semibold">
              Diagnostic
            </TabsTrigger>
            <TabsTrigger value="mastery" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-semibold">
              Mastery
            </TabsTrigger>
            <TabsTrigger value="toolbox" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-semibold">
              DIY Toolbox
            </TabsTrigger>
          </TabsList>

          {/* ───── TAB 1: DIAGNOSTIC ───── */}
          <TabsContent value="diagnostic" className="animate-fade-in">
            <Card className="border-primary/30 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5">
              <CardContent className="p-6 md:p-10">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                  {/* Sliders */}
                  <div className="lg:col-span-3 space-y-7">
                    <SliderInput label="Team Capacity" icon={<Users className="w-4 h-4" />} value={teamCapacity} onChange={setTeamCapacity} min={10} max={1000} step={5} display={`${teamCapacity} Staff`} />
                    <SliderInput label="Churn Velocity — Annual Turnover Rate" icon={<TrendingDown className="w-4 h-4" />} value={churnVelocity} onChange={setChurnVelocity} min={5} max={200} step={1} display={`${churnVelocity}%`} />
                    <SliderInput label="Base Monthly Compensation" icon={<DollarSign className="w-4 h-4" />} value={baseSalary} onChange={setBaseSalary} min={1500} max={10000} step={100} display={fmt(baseSalary)} />
                    <SliderInput label="Ramp-Up (Months)" icon={<Clock className="w-4 h-4" />} value={rampMonths} onChange={setRampMonths} min={1} max={12} step={1} display={`${rampMonths} Mo`} />
                    <SliderInput label="Acquisition Friction (Cost/Hire)" icon={<Target className="w-4 h-4" />} value={acqFriction} onChange={setAcqFriction} min={500} max={10000} step={100} display={fmt(acqFriction)} />
                  </div>

                  {/* Results */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className={`rounded-xl p-6 text-center ${scoreBg}`}>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Stability Score</p>
                      <p className={`text-6xl md:text-7xl font-bold ${scoreColor}`}>{calc.stabilityScore}</p>
                      <p className="text-muted-foreground text-sm mt-1">/ 100</p>
                      <span className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full ${scoreBg} ${scoreColor}`}>{scoreBadge}</span>
                    </div>
                    <div className="bg-destructive/10 rounded-xl p-5 text-center">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Daily Bleed</p>
                      <p className="text-2xl md:text-3xl font-bold text-destructive">- {fmt(Math.round(calc.dailyBleed))} / DAY</p>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-6 text-center border border-primary/20">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Annual Churn Tax</p>
                      <p className="text-4xl md:text-5xl font-bold text-primary">{fmt(Math.round(calc.totalAnnual))}</p>
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        Based on {calc.departures} annual departures and an average salary of {fmt(calc.annualSalary)}, your organisation is losing {fmt(Math.round(calc.totalAnnual))} every year to preventable turnover.
                      </p>
                    </div>
                    <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline transition-colors">
                      {showBreakdown ? "Hide" : "View"} Forensic Breakdown
                      {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showBreakdown && (
                      <div className="space-y-3 animate-fade-in">
                        <BreakdownRow label="Recruitment & Admin" pct={Math.round(calc.recruitPct * 100)} amount={calc.recruitmentCost} currency={currencySymbol} />
                        <BreakdownRow label="Training & Ramp-up" pct={Math.round(calc.trainPct * 100)} amount={calc.trainingCost} currency={currencySymbol} />
                        <BreakdownRow label="Productivity Gap" pct={Math.round(calc.prodPct * 100)} amount={calc.productivityGap} currency={currencySymbol} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───── TAB 2: MASTERY ───── */}
          <TabsContent value="mastery" className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Recover Your <span className="text-primary">{fmt(Math.round(calc.totalAnnual))}</span> Annual Churn Tax
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">A proven system to reduce turnover and reclaim lost revenue</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <StatCard label="Target Reduction" value="40%" />
              <StatCard label="Recovery Potential" value={`${fmt(Math.round(calc.recoveryPotential))}/mo`} />
              <StatCard label="Implementation" value="90 Days" />
            </div>

            <ProtocolDossier />
            <PricingSection onCTA={() => navigate("/pulse/signup")} />
          </TabsContent>

          {/* ───── TAB 3: DIY TOOLBOX ───── */}
          <TabsContent value="toolbox" className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">DIY Toolbox</h2>
              <p className="text-muted-foreground mt-2">Manual tools to implement these protocols yourself</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <ToolboxCard
                icon={<ClipboardList className="w-8 h-8 text-primary" />}
                title="Churn-Proof Onboarding Audit"
                description="A standardized 30-day ramp-up plan to ensure efficiency from day one."
                highlight="We'll process your first 20 responses and send you a 'Stability Snapshot' report for free."
                time="Setup: 8 hours | Ongoing: 2 hours/week"
              />
              <ToolboxCard
                icon={<BarChart3 className="w-8 h-8 text-primary" />}
                title="Weekly Churn Pulse Audit"
                description="The 'Friday Pulse' 5-question survey to gauge team sentiment instantly."
                highlight="We'll process your first 20 responses and send you a 'Stability Snapshot' report for free."
                time="Setup: 4 hours | Ongoing: 1 hour/week"
              />
              <ToolboxCard
                icon={<Mic className="w-8 h-8 text-primary" />}
                title="Churn Forensic Exit Audit"
                description="A neutral 3rd party tool allowing staff to be truthful without friction."
                time="Setup: 6 hours | Ongoing: 3 hours/month"
              />
            </div>

            <Card className="border-primary/20 bg-card/60 mb-10">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-muted-foreground text-sm">Total annual time investment:</p>
                <p className="text-2xl font-bold text-destructive">400+ hours/year</p>
                <p className="text-muted-foreground text-sm">Or let Be Connect handle it:</p>
                <p className="text-2xl font-bold text-primary">€24,000/year</p>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <Button variant="gold" size="lg" className="text-base px-10 py-6 text-lg shadow-lg shadow-primary/20 hover-scale" onClick={() => navigate("/pulse/signup")}>
                Start With Free Team Health Check →
              </Button>
              <p className="text-xs text-muted-foreground">No credit card required. See what's really happening.</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Be Connect</span>
        </div>
        <p className="text-xs text-muted-foreground">Staff Audit Pulse™ — Understand your team before they leave.</p>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function SliderInput({ label, icon, value, onChange, min, max, step, display }: {
  label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">{icon} {label}</div>
        <span className="text-sm font-bold text-primary">{display}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} className="w-full" />
    </div>
  );
}

function BreakdownRow({ label, pct, amount, currency = "€" }: { label: string; pct: number; amount: number; currency?: string }) {
  return (
    <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
      <span className="text-sm text-foreground">{label} ({pct}%)</span>
      <span className="text-sm font-bold text-primary">{formatCurrency(Math.round(amount), currency)}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-card/60 border-border/50 hover-scale">
      <CardContent className="p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}

function ToolboxCard({ icon, title, description, highlight, time }: {
  icon: React.ReactNode; title: string; description: string; highlight?: string; time: string;
}) {
  return (
    <Card className="bg-card/60 border-border/50">
      <CardContent className="p-6 space-y-3">
        <div className="mb-2">{icon}</div>
        <h4 className="font-bold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        {highlight && <p className="text-xs text-primary font-medium">{highlight}</p>}
        <p className="text-xs text-muted-foreground">{time}</p>
      </CardContent>
    </Card>
  );
}
