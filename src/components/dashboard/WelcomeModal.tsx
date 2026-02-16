import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WelcomeModalProps {
  orgName: string;
  pulseLink: string;
  email?: string;
  onClose: () => void;
}

export default function WelcomeModal({ orgName, pulseLink, email, onClose }: WelcomeModalProps) {
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(pulseLink);
    toast({ title: "Link copied!" });
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey team! Please take 30 seconds to share how you're feeling at work. It's completely anonymous.\n\n${pulseLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Welcome to Be Connect Pulse!</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 space-y-3">
          <p className="text-sm font-medium text-success flex items-center gap-1.5">
            ✅ Account Created Successfully!
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
            <p className="font-medium text-primary mb-1">⚠️ Important: Check your email to verify your account before logging in.</p>
            <p className="text-muted-foreground">
              We've sent a verification email to <strong>{email || 'your email'}</strong>. Click the link in that email to activate your account.
            </p>
            <p className="text-muted-foreground mt-1">Once verified, you can log in to access your dashboard.</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Your Team Pulse Link
          </label>
          <div className="bg-muted rounded-lg p-3 text-sm font-mono break-all">
            {pulseLink}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" className="flex-1" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-1" /> Copy Link
          </Button>
          <Button variant="gold" size="sm" className="flex-1" onClick={shareWhatsApp}>
            <MessageCircle className="w-4 h-4 mr-1" /> Share on WhatsApp
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Share this link with your team to collect anonymous pulse responses.
        </p>
      </div>
    </div>
  );
}
