import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Eye, FileText, Download, Mail, StickyNote, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrgDetailView from "@/components/dashboard/OrgDetailView";
import DossierList from "@/components/dashboard/DossierList";
import GenerateDossierModal from "@/components/dashboard/GenerateDossierModal";

interface AdminOrg {
  id: string;
  org_name: string;
  org_code: string;
  industry: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
  responseCount: number;
  healthScore: number;
}

export default function AdminDashboard() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [showDossiers, setShowDossiers] = useState(false);
  const [dossierModal, setDossierModal] = useState<{ orgId: string; orgName: string } | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin"); return; }

      // Check admin via edge function
      const { data, error } = await supabase.functions.invoke("check-admin");
      if (error || !data?.is_admin) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadOrgs();
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadOrgs = async () => {
    const { data: allOrgs } = await supabase.from("organizations").select("*");
    if (!allOrgs) return;

    const { data: allResponses } = await supabase
      .from("pulse_responses")
      .select("organization_id, question_1_energy, question_2_support, question_3_growth, question_4_spirit")
      .eq("is_demo_data", false);

    const orgsWithStats: AdminOrg[] = allOrgs.map((o: any) => {
      const orgResponses = (allResponses || []).filter((r) => r.organization_id === o.id);
      const count = orgResponses.length;
      let healthScore = 0;
      if (count > 0) {
        const avg = (key: string) => {
          const vals = orgResponses.map((r) => (r as any)[key] as number).filter((v) => v != null);
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length / 5 * 100 : 0;
        };
        healthScore = Math.round((avg("question_1_energy") + avg("question_2_support") + avg("question_3_growth") + avg("question_4_spirit")) / 4);
      }
      return {
        id: o.id,
        org_name: o.org_name,
        org_code: o.org_code,
        industry: o.industry || null,
        status: o.status || "active",
        internal_notes: o.internal_notes || null,
        created_at: o.created_at,
        responseCount: count,
        healthScore,
      };
    });

    setOrgs(orgsWithStats.sort((a, b) => b.responseCount - a.responseCount));
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const updateOrgStatus = async (orgId: string, newStatus: string) => {
    await supabase.from("organizations").update({ status: newStatus } as any).eq("id", orgId);
    setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, status: newStatus } : o));
    toast({ title: `Status updated to ${newStatus}` });
  };

  const saveNotes = async (orgId: string) => {
    await supabase.from("organizations").update({ internal_notes: notesValue } as any).eq("id", orgId);
    setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, internal_notes: notesValue } : o));
    setEditingNotes(null);
    toast({ title: "Notes saved" });
  };

  const exportCSV = (org?: AdminOrg) => {
    const rows = org ? [org] : orgs;
    const headers = ["Organization", "Industry", "Status", "Responses", "Health Score", "Sign Up Date"];
    const csv = [
      headers.join(","),
      ...rows.map((o) => [o.org_name, o.industry || "", o.status, o.responseCount, o.healthScore, new Date(o.created_at).toLocaleDateString()].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = org ? `${org.org_code}-data.csv` : "all-organizations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendFollowUp = (org: AdminOrg) => {
    const subject = encodeURIComponent(`Follow-up: ${org.org_name} Team Health Report`);
    const body = encodeURIComponent(`Hi,\n\nI wanted to follow up on the Team Health Report we prepared for ${org.org_name}.\n\nWould you have time for a brief call this week to discuss the findings and how Be Connect can help?\n\nBest regards,\nBe Connect Team`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const scoreColor = (score: number) => {
    if (score <= 40) return "text-destructive";
    if (score <= 70) return "text-primary";
    return "text-success";
  };

  const statusColors: Record<string, string> = {
    active: "bg-success/20 text-success",
    needs_follow_up: "bg-primary/20 text-primary",
    converted: "bg-accent/20 text-accent-foreground",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (selectedOrg) {
    const org = orgs.find((o) => o.id === selectedOrg);
    return (
      <div>
        <OrgDetailView
          orgId={selectedOrg}
          orgName={org?.org_name || ""}
          orgCode={org?.org_code || ""}
          onBack={() => setSelectedOrg(null)}
          onGenerateDossier={() => setDossierModal({ orgId: selectedOrg, orgName: org?.org_name || "" })}
        />
        {/* Admin-only: Internal Notes */}
        {org && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8 space-y-4">
            <div className="bg-card border border-primary/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm">Internal Notes (Admin Only)</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateOrgStatus(org.id, "converted")}>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Converted
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendFollowUp(org)}>
                    <Mail className="w-3 h-3 mr-1" /> Send Follow-Up
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(org)}>
                    <Download className="w-3 h-3 mr-1" /> Export CSV
                  </Button>
                </div>
              </div>
              {editingNotes === org.id ? (
                <div className="space-y-2">
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Add internal notes about this organization..."
                  />
                  <div className="flex gap-2">
                    <Button variant="gold" size="sm" onClick={() => saveNotes(org.id)}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingNotes(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => { setEditingNotes(org.id); setNotesValue(org.internal_notes || ""); }}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground min-h-[40px] p-2 rounded bg-secondary/30"
                >
                  {org.internal_notes || "Click to add notes..."}
                </div>
              )}
            </div>
          </div>
        )}
        {dossierModal && (
          <GenerateDossierModal
            orgId={dossierModal.orgId}
            orgName={dossierModal.orgName}
            onClose={() => { setDossierModal(null); loadOrgs(); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary text-sm">Be Connect</span>
          <span className="text-muted-foreground text-sm hidden md:inline">| Admin Centre</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/pulse/dashboard")}>
            My Dashboard
          </Button>
          <Button
            variant={showDossiers ? "gold" : "outline"}
            size="sm"
            onClick={() => setShowDossiers(!showDossiers)}
          >
            <FileText className="w-4 h-4 mr-1" />
            {showDossiers ? "View Orgs" : "All Dossiers"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCSV()}>
            <Download className="w-4 h-4 mr-1" /> Export All
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {showDossiers ? (
          <DossierList />
        ) : (
          <>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">All Organizations</h1>
              <p className="text-muted-foreground text-sm mt-1">{orgs.length} organizations tracked</p>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-3 font-medium">Organization</th>
                    <th className="text-center p-3 font-medium">Industry</th>
                    <th className="text-center p-3 font-medium">Sign Up</th>
                    <th className="text-center p-3 font-medium">Responses</th>
                    <th className="text-center p-3 font-medium">Health</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr key={org.id} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedOrg(org.id)}
                          className="font-medium text-foreground hover:text-primary transition-colors text-left"
                        >
                          {org.org_name}
                        </button>
                        {org.internal_notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]" title={org.internal_notes}>📝 {org.internal_notes}</p>
                        )}
                      </td>
                      <td className="p-3 text-center text-muted-foreground">{org.industry || "—"}</td>
                      <td className="p-3 text-center text-muted-foreground">{new Date(org.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-center">{org.responseCount}</td>
                      <td className={`p-3 text-center font-bold ${org.healthScore > 0 ? scoreColor(org.healthScore) : "text-muted-foreground"}`}>
                        {org.healthScore > 0 ? `${org.healthScore}/100` : "—"}
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={org.status}
                          onChange={(e) => updateOrgStatus(org.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${statusColors[org.status] || statusColors.active}`}
                        >
                          <option value="active">Active</option>
                          <option value="needs_follow_up">Needs Follow-Up</option>
                          <option value="converted">Converted</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrg(org.id)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDossierModal({ orgId: org.id, orgName: org.org_name })}>
                            <FileText className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => sendFollowUp(org)}>
                            <Mail className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {dossierModal && (
        <GenerateDossierModal
          orgId={dossierModal.orgId}
          orgName={dossierModal.orgName}
          onClose={() => { setDossierModal(null); loadOrgs(); }}
        />
      )}
    </div>
  );
}
