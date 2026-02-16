import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Eye, FileText, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrgDetailView from "@/components/dashboard/OrgDetailView";
import DossierList from "@/components/dashboard/DossierList";
import GenerateDossierModal from "@/components/dashboard/GenerateDossierModal";
import WelcomeModal from "@/components/dashboard/WelcomeModal";

interface Org {
  id: string;
  org_name: string;
  org_code: string;
  responseCount: number;
  healthScore: number;
  lastPulseDate: string | null;
}

export default function PulseDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [showDossiers, setShowDossiers] = useState(false);
  const [dossierModal, setDossierModal] = useState<{ orgId: string; orgName: string } | null>(null);
  const [welcomeData, setWelcomeData] = useState<{ orgName: string; pulseLink: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem("beconnect_demo_mode") === "true");
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleDemo = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem("beconnect_demo_mode", String(next));
    toast({ title: next ? "Demo Mode ON" : "Demo Mode OFF", description: next ? "Showing sample data for presentations" : "Showing real data" });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/pulse/login"); return; }
      setUser(session.user);
      await loadOrgs();
      setLoading(false);

      supabase.functions.invoke("check-admin").then(({ data }) => {
        if (data?.is_admin) setIsAdmin(true);
      });

      const raw = sessionStorage.getItem("welcome_data");
      if (raw) {
        setWelcomeData(JSON.parse(raw));
        sessionStorage.removeItem("welcome_data");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/pulse/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadOrgs = async () => {
    const { data: allOrgs } = await supabase.from("organizations").select("*");
    if (!allOrgs) return;

    const { data: allResponses } = await supabase
      .from("pulse_responses")
      .select("organization_id, question_1_energy, question_2_support, question_3_growth, question_4_spirit, submitted_at")
      .eq("is_demo_data", false);

    const orgsWithStats: Org[] = allOrgs.map((o) => {
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
      const dates = orgResponses.map((r) => r.submitted_at).sort().reverse();
      return {
        id: o.id,
        org_name: o.org_name,
        org_code: o.org_code,
        responseCount: count,
        healthScore,
        lastPulseDate: dates[0] || null,
      };
    });

    setOrgs(orgsWithStats.sort((a, b) => b.responseCount - a.responseCount));
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const scoreColor = (score: number) => {
    if (score <= 40) return "text-destructive";
    if (score <= 70) return "text-primary";
    return "text-success";
  };

  const scoreBadge = (score: number) => {
    if (score === 0) return { text: "No data", cls: "bg-muted text-muted-foreground" };
    if (score <= 40) return { text: "Critical", cls: "bg-destructive/20 text-destructive" };
    if (score <= 70) return { text: "Moderate", cls: "bg-primary/20 text-primary" };
    return { text: "Healthy", cls: "bg-success/20 text-success" };
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
      <>
        <OrgDetailView
          orgId={selectedOrg}
          orgName={org?.org_name || ""}
          orgCode={org?.org_code || ""}
          onBack={() => setSelectedOrg(null)}
          onGenerateDossier={() => setDossierModal({ orgId: selectedOrg, orgName: org?.org_name || "" })}
          demoMode={demoMode}
        />
        {dossierModal && (
          <GenerateDossierModal
            orgId={dossierModal.orgId}
            orgName={dossierModal.orgName}
            onClose={() => { setDossierModal(null); loadOrgs(); }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-primary text-sm">Be Connect</span>
          <span className="text-muted-foreground text-sm hidden md:inline">| Command Centre</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemo}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 ${
              demoMode
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {demoMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Demo
          </button>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate("/pulse/admin")} className="hover-scale">
              <Shield className="w-4 h-4 mr-1" /> Admin
            </Button>
          )}
          <Button
            variant={showDossiers ? "gold" : "outline"}
            size="sm"
            onClick={() => setShowDossiers(!showDossiers)}
            className="hover-scale"
          >
            <FileText className="w-4 h-4 mr-1" />
            {showDossiers ? "Orgs" : "Dossiers"}
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
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold">All Organizations</h1>
              <p className="text-muted-foreground text-sm mt-1">{orgs.length} organizations tracked</p>
            </div>

            {orgs.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center animate-fade-in">
                <p className="text-lg font-medium mb-2">No organizations yet</p>
                <p className="text-muted-foreground text-sm">Organizations will appear here once they sign up.</p>
              </div>
            )}

            <div className="grid gap-4">
              {orgs.map((org, i) => {
                const badge = scoreBadge(demoMode ? 52 : org.healthScore);
                return (
                  <div
                    key={org.id}
                    className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:border-primary/30 animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg truncate">{org.org_name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>{badge.text}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{demoMode ? "19" : org.responseCount} responses</span>
                        {(demoMode || org.healthScore > 0) && (
                          <span className={scoreColor(demoMode ? 52 : org.healthScore)}>
                            Health: {demoMode ? "52" : org.healthScore}/100
                          </span>
                        )}
                        {org.lastPulseDate && (
                          <span>Last pulse: {new Date(org.lastPulseDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrg(org.id)} className="hover-scale">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button variant="gold" size="sm" onClick={() => setDossierModal({ orgId: org.id, orgName: org.org_name })} className="hover-scale">
                        <FileText className="w-4 h-4 mr-1" /> Dossier
                      </Button>
                    </div>
                  </div>
                );
              })}
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
      {welcomeData && (
        <WelcomeModal
          orgName={welcomeData.orgName}
          pulseLink={welcomeData.pulseLink}
          email={welcomeData.email}
          onClose={() => setWelcomeData(null)}
        />
      )}
    </div>
  );
}
