import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function generateCode(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface Props {
  orgId: string;
  orgName: string;
  onClose: () => void;
}

export default function GenerateDossierModal({ orgId, orgName, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; pin: string } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    const uniqueCode = generateCode(8);
    const pinCode = generatePin();

    const { error } = await supabase
      .from("pulse_dossiers" as any)
      .insert({
        organization_id: orgId,
        unique_code: uniqueCode,
        pin_code: pinCode,
        status: "not_sent",
      } as any);

    setLoading(false);

    if (error) {
      toast({ title: "Failed to create dossier", description: error.message, variant: "destructive" });
      return;
    }

    const url = `${window.location.origin}/pulse/dossier/${uniqueCode}`;
    setResult({ url, pin: pinCode });
  };

  const handleCopyLink = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.url);
    toast({ title: "Link copied!" });
  };

  const handleCopyPin = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.pin);
    toast({ title: "PIN copied!" });
  };

  const handleWhatsApp = () => {
    if (!result) return;
    const msg = encodeURIComponent(
      `Hi, your ${orgName} Team Health Report is ready.\n\n📊 View here: ${result.url}\n🔐 PIN: ${result.pin}\n\nThis is a confidential report prepared by Be Connect.`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Generate Dossier</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a PIN-protected dossier for <strong className="text-foreground">{orgName}</strong>.
              The client will receive a unique link and PIN to view their team health report.
            </p>
            <Button variant="gold" className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate Dossier"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Dossier Created!</span>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Dossier URL</label>
              <input readOnly value={result.url} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">PIN Code</label>
              <div className="text-3xl font-mono font-bold text-primary tracking-widest">{result.pin}</div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-1" /> Copy Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCopyPin}>
                <Copy className="w-4 h-4 mr-1" /> Copy PIN
              </Button>
            </div>
            <div>
              <Button variant="gold" className="w-full" onClick={handleWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
