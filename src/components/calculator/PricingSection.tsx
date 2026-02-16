import { Wrench, UserCheck, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PricingSectionProps {
  onCTA: () => void;
}

export default function PricingSection({ onCTA }: PricingSectionProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">Choose Your Path</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* DIY Column */}
        <Card className="border-border/50 bg-card/60">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="w-7 h-7 text-muted-foreground" />
              <h4 className="text-lg font-bold text-foreground">Implement Yourself</h4>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What You Get</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Free access to all DIY tools",
                  "Onboarding Audit app",
                  "Tribe-Viral assessment tool",
                  "Weekly Pulse survey system",
                  "Exit interview templates",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Time Investment</p>
              <p className="text-sm text-foreground">Setup: 20 hours</p>
              <p className="text-sm text-foreground">Ongoing: 380+ hours/year</p>
              <p className="text-lg font-bold text-destructive mt-2">400+ hours annually</p>
            </div>

            <p className="text-xs text-muted-foreground">Best for: Small teams with dedicated HR resources</p>
          </CardContent>
        </Card>

        {/* White-Glove Column */}
        <Card className="border-primary/40 bg-card/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-7 h-7 text-primary" />
              <h4 className="text-lg font-bold text-foreground">White-Glove Concierge</h4>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What We Do</p>
              <ul className="space-y-2 text-sm text-foreground">
                {[
                  "DNA-matched recruitment",
                  "Automated onboarding tracking",
                  "Weekly pulse monitoring",
                  "Exit interview analysis",
                  "Dedicated account manager",
                  "Quarterly strategy sessions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Standard Rate</p>
                <p className="text-sm text-foreground">Up to 250 employees: €2,250/mo</p>
                <p className="text-sm text-foreground">Over 250 employees: €3,500/mo</p>
              </div>
              <div className="border-t border-border/30 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Charter Partner Offer</p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">First 10 Clients Only</p>
                <p className="text-sm font-bold text-primary">Up to 250: €1,500/mo (€15,600/yr)</p>
                <p className="text-sm font-bold text-primary">Over 250: €2,400/mo (€26,000/yr)</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />35% permanent discount — rate locked forever</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />Early access to new features</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />Priority support + quarterly reviews</li>
                  <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />Founding member recognition</li>
                </ul>
                <p className="text-xs font-semibold text-destructive mt-3">Only 7 Slots Remaining</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Best for: Any team serious about retention</p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center space-y-3 pt-4">
        <Button variant="gold" size="lg" className="text-base px-10 py-6 text-lg shadow-lg shadow-primary/20 hover-scale" onClick={onCTA}>
          Book Your Free Strategy Session →
        </Button>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Let's audit your team health and create a custom retention plan. No cost, no obligation.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Prefer to start with DIY? Access free tools immediately — no signup required.
        </p>
      </div>
    </div>
  );
}
