import { Dna, ClipboardList, Target, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const protocols = [
  {
    value: "protocol-1",
    icon: <Dna className="w-5 h-5 text-primary" />,
    title: "DNA-Matched Hiring",
    subtitle: "Prevent cultural misfits before they join",
    content: [
      "60% of early turnover is caused by cultural misfit — hiring people whose work style clashes with your team DNA.",
      "The Problem: Traditional recruitment focuses on skills but ignores personality fit. A talented chef who needs autonomy will fail in a micromanaged kitchen, no matter how skilled.",
      "The Science: Our Tribe-Viral assessment identifies work archetypes — Lions (autonomy-driven), Whales (collaboration-focused), and Falcons (precision-oriented). Teams with balanced archetype composition have 3.2× lower turnover.",
      "The Solution: Every candidate completes a 12-question assessment. Our AI analyzes their archetype against your team composition and recommends optimal placements with 85% compatibility scoring.",
    ],
    diy: "Use our free Tribe-Viral assessment tool",
    diyTime: "30 minutes per candidate + manual analysis",
    whiteGlove: "Automated in Hub with AI buddy matching",
  },
  {
    value: "protocol-2",
    icon: <ClipboardList className="w-5 h-5 text-primary" />,
    title: "The 72-Hour Velocity Tracker",
    subtitle: "Prevent ghosting in the critical first week",
    content: [
      "80% of new hire ghosting happens within the first 72 hours — before they even complete their first shift.",
      "The Problem: New hires feel anxious, disconnected, and question their decision. A single bad first impression triggers instant regret and ghosting.",
      "The Science: The 'Breaking of Bread Protocol' creates emotional commitment before Day 1. Offering a welcome gift activates reciprocity psychology. Combined with structured check-ins after each of the first 5 shifts, we catch disconnection before it becomes ghosting.",
      "The Solution: Manager generates a personalized welcome message with gift choice, sends via WhatsApp. System provides scripts for the 'Safety Call' (within 24 hours), 'Hero's Welcome' (first 30 minutes on Day 1), and automated check-in links after Shifts 1–5, then weekly, then monthly.",
    ],
    diy: "Use our free 72-Hour Velocity Tracker",
    diyTime: "8 hours setup + 2 hours per week per new hire",
    whiteGlove: "Automated in Hub Engagement Monitor",
  },
  {
    value: "protocol-3",
    icon: <Target className="w-5 h-5 text-primary" />,
    title: "Weekly Pulse Monitoring",
    subtitle: "Predict resignations 6 weeks before they happen",
    content: [
      "Exit interviews are too late — by the time someone resigns, they've been mentally checked out for weeks.",
      "The Problem: Managers only learn about dissatisfaction after the resignation letter arrives. By then, the damage is done and the employee is gone.",
      "The Science: The real data is in weekly sentiment deltas. Our 'Friday Pulse' 5-question survey measures team energy, management support, growth potential, and team spirit. Behavioral signals predict churn with 85% accuracy, giving you 6 weeks to intervene.",
      "The Solution: Every Friday, your team receives a 60-second emoji survey via WhatsApp or email. Anonymous responses reveal department-level health scores and friction points. When scores drop, you receive instant alerts with specific issues to address.",
    ],
    diy: "Use this Staff Audit Pulse tool (you're using it now!)",
    diyTime: "4 hours setup + 1 hour per week ongoing",
    whiteGlove: "Automated monitoring + weekly executive reports",
  },
  {
    value: "protocol-4",
    icon: <Mic className="w-5 h-5 text-primary" />,
    title: "Exit Interview Intelligence",
    subtitle: "Learn from departures to prevent repeats",
    content: [
      "When people leave, you need to know WHY — not the polite exit interview lie, but the real reason.",
      "The Problem: Direct exit interviews with managers yield sanitized responses. Employees don't want to burn bridges, so they cite 'personal reasons' when the real issue is a toxic manager or broken system.",
      "The Science: Neutral 3rd-party exit surveys yield 4× more honest feedback. When employees know you won't see their raw responses, they tell the truth.",
      "The Solution: When someone resigns, we send a confidential exit survey. We analyze patterns across all your departures and identify systemic issues. Example: If 5 kitchen staff cite 'micromanagement,' the problem isn't the staff — it's the head chef.",
    ],
    diy: "Exit interview template available",
    diyTime: "2 hours per exit + quarterly analysis (6 hours)",
    whiteGlove: "We conduct + analyze all exit interviews",
  },
];

export default function ProtocolDossier() {
  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-foreground mb-1 uppercase tracking-wider">Your Complete Retention System</h3>
      <p className="text-sm text-muted-foreground mb-6">Four interconnected solutions that reduce turnover by 60%</p>
      <Accordion type="single" collapsible className="space-y-4">
        {protocols.map((p) => (
          <AccordionItem key={p.value} value={p.value} className="border border-primary/30 rounded-xl overflow-hidden bg-card/60">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                {p.icon}
                <div>
                  <span className="font-semibold text-foreground block">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.subtitle}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="space-y-3 mb-5">
                {p.content.map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs bg-secondary/40 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-foreground mb-1">DIY Approach</p>
                  <p className="text-muted-foreground">{p.diy}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Time Investment</p>
                  <p className="text-muted-foreground">{p.diyTime}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">White-Glove</p>
                  <p className="text-primary">{p.whiteGlove}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
