import { useState } from "react";
import { Copy, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VibeCheckLinkSectionProps {
  vibeCheckCode: string | null;
  propertyName: string;
  fullName: string;
  email: string;
}

export default function VibeCheckLinkSection({ vibeCheckCode, propertyName, fullName, email }: VibeCheckLinkSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!vibeCheckCode) {
    return (
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="p-6 md:p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">📋 Setting Up Your Vibe Check</p>
          <p className="text-muted-foreground">We're setting up your Vibe Check — you'll receive the link by email within 24 hours.</p>
        </CardContent>
      </Card>
    );
  }

  const vibeCheckUrl = `https://vibecheck.be.ie/${vibeCheckCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(vibeCheckUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = vibeCheckUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Team Vibe Check — ${propertyName}`);
    const body = encodeURIComponent(
`Hi team,

I've signed us up for a quick Team Vibe Check with Be Connect. It takes 2 minutes and is completely anonymous — individual answers stay private, only team patterns are shared.

Please click the link below and answer the 5 questions:

${vibeCheckUrl}

Thanks!
${fullName}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  const steps = [
    { num: "1️⃣", title: "Send this link to your team", sub: "(WhatsApp group, email, notice board)" },
    { num: "2️⃣", title: "Each person takes a 2-minute pulse check", sub: "(5 quick questions, anonymous)" },
    { num: "3️⃣", title: "We need 80%+ of your team to respond", sub: "for accurate results" },
    { num: "4️⃣", title: "You'll receive a PIN-protected report", sub: "in 3-5 business days" },
  ];

  return (
    <Card className="border-primary/40 bg-primary/5 shadow-lg shadow-primary/10">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xl font-bold text-foreground">📋 Next Step: Team Vibe Check</p>
          <p className="text-muted-foreground text-sm">
            We've created a custom assessment for your team at <span className="text-foreground font-medium">{propertyName}</span>.
          </p>
        </div>

        {/* Link display */}
        <div className="bg-card border border-border rounded-lg p-4 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Unique Team Link</p>
          <p className="text-primary font-bold text-base md:text-lg break-all">{vibeCheckUrl}</p>
          <div className="flex justify-center gap-3">
            <Button variant="gold" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Email to Me
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">How It Works:</p>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-lg leading-none mt-0.5">{s.num}</span>
                <div>
                  <p className="text-sm text-foreground font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report details */}
        <div className="border-t border-border/30 pt-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Your report will show:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Team health score (overall risk level)</li>
            <li>✓ Retention risk analysis</li>
            <li>✓ Where your team is imbalanced</li>
            <li>✓ Specific actions to take first</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
