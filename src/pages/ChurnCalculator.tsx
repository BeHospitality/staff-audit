import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ChevronDown, ChevronUp, TrendingDown, Users, Clock, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(val: number) {
  return "€" + val.toLocaleString("en-IE", { maximumFractionDigits: 0 });
}

export default function ChurnCalculator() {
  const navigate = useNavigate();
  const [teamCapacity, setTeamCapacity] = useState(50);
  const [churnVelocity, setChurnVelocity] = useState(50);
  const [baseSalary, setBaseSalary] = useState(2800);
  const [rampMonths, setRampMonths] = useState(3);
  const [acqFriction, setAcqFriction] = useState(2500);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const calc = useMemo(() => {
    const departures = teamCapacity * (churnVelocity / 100);
    const annualSalary = baseSalary * 12;
    const recruitmentCost = departures * acqFriction;
    const trainingCost = departures * (baseSalary * rampMonths * 0.25);
    const productivityGap = departures * (baseSalary * rampMonths * 0.45);
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
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(216 100% 16%) 0%, hsl(216 80% 12%) 50%, hsl(0 0% 10%) 100%)" }}>
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
      <section className="text-center px-4 pt-8 pb-6 md:pt-16 md:pb-10 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
          Identify Your Hidden<br />
          <span className="text-primary">Operational Churn Tax</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Turnover isn't just HR friction—it's a direct leak on your bottom line. Use the sliders below to calculate the fiscal impact.
        </p>
      </section>

      {/* Calculator */}
      <section className="max-w-6xl mx-auto px-4 pb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <Card className="border-primary/30 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5">
          <CardContent className="p-6 md:p-10">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Sliders - Left */}
              <div className="lg:col-span-3 space-y-7">
                <SliderInput
                  label="Team Capacity"
                  icon={<Users className="w-4 h-4" />}
                  value={teamCapacity}
                  onChange={setTeamCapacity}
                  min={10} max={1000} step={5}
                  display={`${teamCapacity} Staff`}
                />
                <SliderInput
                  label="Churn Velocity — Annual Turnover Rate"
                  icon={<TrendingDown className="w-4 h-4" />}
                  value={churnVelocity}
                  onChange={setChurnVelocity}
                  min={5} max={200} step={1}
                  display={`${churnVelocity}%`}
                />
                <SliderInput
                  label="Base Monthly Compensation"
                  icon={<DollarSign className="w-4 h-4" />}
                  value={baseSalary}
                  onChange={setBaseSalary}
                  min={1500} max={10000} step={100}
                  display={formatCurrency(baseSalary)}
                />
                <SliderInput
                  label="Ramp-Up (Months)"
                  icon={<Clock className="w-4 h-4" />}
                  value={rampMonths}
                  onChange={setRampMonths}
                  min={1} max={12} step={1}
                  display={`${rampMonths} Mo`}
                />
                <SliderInput
                  label="Acquisition Friction (Cost/Hire)"
                  icon={<Target className="w-4 h-4" />}
                  value={acqFriction}
                  onChange={setAcqFriction}
                  min={500} max={10000} step={100}
                  display={formatCurrency(acqFriction)}
                />
              </div>

              {/* Results - Right */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stability Score */}
                <div className={`rounded-xl p-6 text-center ${scoreBg}`}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Stability Score</p>
                  <p className={`text-6xl md:text-7xl font-bold ${scoreColor}`}>{calc.stabilityScore}</p>
                  <p className="text-muted-foreground text-sm mt-1">/ 100</p>
                  <span className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full ${scoreBg} ${scoreColor}`}>
                    {scoreBadge}
                  </span>
                </div>

                {/* Daily Bleed */}
                <div className="bg-destructive/10 rounded-xl p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Daily Bleed</p>
                  <p className="text-2xl md:text-3xl font-bold text-destructive">
                    - {formatCurrency(Math.round(calc.dailyBleed))} / DAY
                  </p>
                </div>

                {/* Annual Churn Tax */}
                <div className="bg-primary/10 rounded-xl p-6 text-center border border-primary/20">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Annual Churn Tax</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {formatCurrency(Math.round(calc.totalAnnual))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    Based on your {calc.departures} departures and an average salary of {formatCurrency(calc.annualSalary)}, your property is losing {formatCurrency(Math.round(calc.totalAnnual))} annually.
                  </p>
                </div>

                {/* Breakdown Accordion */}
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline transition-colors"
                >
                  {showBreakdown ? "Hide" : "View"} Forensic Breakdown
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showBreakdown && (
                  <div className="space-y-3 animate-fade-in">
                    <BreakdownRow label="Recruitment & Admin" pct={Math.round(calc.recruitPct * 100)} amount={calc.recruitmentCost} />
                    <BreakdownRow label="Training & Ramp-up" pct={Math.round(calc.trainPct * 100)} amount={calc.trainingCost} />
                    <BreakdownRow label="Productivity Gap" pct={Math.round(calc.prodPct * 100)} amount={calc.productivityGap} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 pb-16 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Recover Your <span className="text-primary">{formatCurrency(Math.round(calc.totalAnnual))}</span> Annual Churn Tax
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Target Reduction" value="40%" />
          <StatCard label="Recovery Potential" value={`${formatCurrency(Math.round(calc.recoveryPotential))}/mo`} />
          <StatCard label="Implementation" value="90 Days" />
        </div>

        <div className="text-center space-y-4">
          <Button
            variant="gold"
            size="lg"
            className="text-base px-10 py-6 text-lg shadow-lg shadow-primary/20 hover-scale"
            onClick={() => navigate("/pulse/signup")}
          >
            Start Your Free Staff Audit →
          </Button>
          <p className="text-xs text-muted-foreground">Free pulse survey • No credit card • Results in 48 hours</p>
        </div>
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

function SliderInput({
  label, icon, value, onChange, min, max, step, display,
}: {
  label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; display: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {icon} {label}
        </div>
        <span className="text-sm font-bold text-primary">{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min} max={max} step={step}
        className="w-full"
      />
    </div>
  );
}

function BreakdownRow({ label, pct, amount }: { label: string; pct: number; amount: number }) {
  return (
    <div className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
      <span className="text-sm text-foreground">{label} ({pct}%)</span>
      <span className="text-sm font-bold text-primary">{formatCurrency(Math.round(amount))}</span>
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
