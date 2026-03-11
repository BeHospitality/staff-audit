import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Loader2, CheckCircle2 } from "lucide-react";

interface ConvertToClientProps {
  lead: {
    id: string;
    property_name: string;
    full_name: string;
    email: string;
    phone: string;
    staff_count: number | null;
    turnover_rate: number | null;
    vibe_check_code: string | null;
    vibe_check_responses: number | null;
    converted_to_client?: boolean;
    created_at: string;
  };
  onConverted?: () => void;
}

function generateOrgCode(propertyName: string): string {
  return propertyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 30);
}

export default function ConvertToClient({ lead, onConverted }: ConvertToClientProps) {
  const [open, setOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const { toast } = useToast();

  if (lead.converted_to_client) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        Client (in Hub)
      </Badge>
    );
  }

  const annualCost =
    lead.staff_count && lead.turnover_rate
      ? Math.round(lead.staff_count * (lead.turnover_rate / 100) * 15000)
      : null;

  const responseCount = lead.vibe_check_responses || 0;

  const handleConvert = async () => {
    setConverting(true);
    try {
      // Fetch vibe check responses for this lead
      let vibeResponses: any[] = [];
      if (lead.id) {
        const { data } = await supabase
          .from("vibe_check_responses")
          .select("*")
          .eq("lead_id", lead.id);
        vibeResponses = data || [];
      }

      const orgCode = lead.vibe_check_code || generateOrgCode(lead.property_name);

      const payload = {
        org_code: orgCode,
        property_name: lead.property_name,
        contact_name: lead.full_name,
        contact_email: lead.email,
        contact_phone: lead.phone,
        staff_count: lead.staff_count,
        annual_turnover_cost: annualCost,
        vibe_check_responses: vibeResponses,
        turnover_data: {
          total_staff: lead.staff_count,
          turnover_rate: lead.turnover_rate,
          annual_cost: annualCost,
          calculated_at: lead.created_at,
        },
      };

      const hubUrl =
        "https://buriwmeuvujisgmqnpjr.supabase.co/functions/v1/onboard-client";

      const response = await fetch(hubUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Transfer failed" }));
        throw new Error(error.error || "Transfer failed");
      }

      await response.json();

      // Mark as converted
      await supabase
        .from("leads")
        .update({
          converted_to_client: true,
          converted_at: new Date().toISOString(),
        } as any)
        .eq("id", lead.id);

      toast({
        title: "✅ Client Onboarded!",
        description: `${lead.property_name} has been transferred to the Hub`,
      });

      setOpen(false);
      onConverted?.();

      // Open Hub in new tab
      window.open("https://hub.be.ie", "_blank");
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Rocket className="w-4 h-4" />
          Convert to Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert {lead.property_name} to Client?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                This will transfer all data to the Hub for client management:
              </p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Organisation profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Contact information
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Vibe Check responses ({responseCount} responses)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Turnover analysis data
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                The property will be marked as a paying client in the Hub.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={converting}>
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={converting} className="gap-2">
            {converting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {converting ? "Transferring…" : "Convert to Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
