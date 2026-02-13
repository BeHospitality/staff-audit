import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Dossier {
  id: string;
  organization_id: string;
  unique_code: string;
  pin_code: string;
  status: string;
  created_at: string;
  view_count: number;
  client_response: string | null;
  org_name?: string;
}

const STATUS_COLORS: Record<string, string> = {
  not_sent: "bg-muted text-muted-foreground",
  sent: "bg-primary/20 text-primary",
  viewed: "bg-accent/20 text-accent-foreground",
  interested: "bg-success/20 text-success",
  passed: "bg-destructive/20 text-destructive",
};

export default function DossierList() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("pulse_dossiers" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (!data) return;

      // Get org names
      const { data: orgs } = await supabase.from("organizations").select("id, org_name");
      const orgMap = Object.fromEntries((orgs || []).map((o) => [o.id, o.org_name]));

      setDossiers(
        (data as any[]).map((d) => ({
          ...d,
          org_name: orgMap[d.organization_id] || "Unknown",
        }))
      );
    };
    load();
  }, []);

  const getDisplayStatus = (d: Dossier) => {
    if (d.client_response === "interested") return "interested";
    if (d.client_response === "passed") return "passed";
    if (d.view_count > 0) return "viewed";
    return d.status;
  };

  const copyLink = (code: string, pin: string) => {
    const url = `${window.location.origin}/pulse/dossier/${code}`;
    navigator.clipboard.writeText(`${url}\nPIN: ${pin}`);
    toast({ title: "Copied!" });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dossiers</h1>
      <p className="text-muted-foreground text-sm mb-6">{dossiers.length} dossiers generated</p>

      {dossiers.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No dossiers generated yet. Select an organization and click "Generate Dossier".</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-3 font-medium">Organization</th>
                <th className="text-center p-3 font-medium">PIN</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-center p-3 font-medium">Views</th>
                <th className="text-center p-3 font-medium">Created</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((d) => {
                const status = getDisplayStatus(d);
                return (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="p-3 font-medium">{d.org_name}</td>
                    <td className="p-3 text-center font-mono">{d.pin_code}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[status] || STATUS_COLORS.not_sent}`}>
                        {status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-center">{d.view_count}</td>
                    <td className="p-3 text-center text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => copyLink(d.unique_code, d.pin_code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
