import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Search, ArrowUpDown } from "lucide-react";

interface LeadRow {
  id: string;
  property_name: string;
  full_name: string;
  email: string;
  staff_count: number | null;
  vibe_check_responses: number | null;
  vibe_check_code: string | null;
  created_at: string;
  status: string;
}

function getStatus(responses: number, staffCount: number | null) {
  if (!staffCount || staffCount === 0) return { label: "⚪ New", sort: 3 };
  const rate = responses / staffCount;
  if (responses === 0) return { label: "⚪ New", sort: 3 };
  if (rate < 0.5) return { label: "🟡 Low", sort: 2 };
  if (rate < 0.8) return { label: "🟠 Building", sort: 1 };
  return { label: "🟢 Ready", sort: 0 };
}

export default function DossierIndex() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"status" | "property" | "responses" | "date">("status");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, property_name, full_name, email, staff_count, vibe_check_responses, vibe_check_code, created_at, status")
        .eq("vibe_check_requested", true)
        .order("created_at", { ascending: false });
      setLeads((data as LeadRow[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.property_name.toLowerCase().includes(search.toLowerCase()) ||
      l.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "status") {
      const sa = getStatus(a.vibe_check_responses || 0, a.staff_count);
      const sb = getStatus(b.vibe_check_responses || 0, b.staff_count);
      return sa.sort - sb.sort || (b.vibe_check_responses || 0) - (a.vibe_check_responses || 0);
    }
    if (sortKey === "property") return a.property_name.localeCompare(b.property_name);
    if (sortKey === "responses") return (b.vibe_check_responses || 0) - (a.vibe_check_responses || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  return (
    <AdminRouteGuard>
      <div className="min-h-screen">
        <nav className="border-b border-border px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary text-sm">Be Connect</span>
            <span className="text-muted-foreground text-sm">| Dossier Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/pulse/admin")}>
              Super Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">📊 Dossier Admin</h1>
              <p className="text-sm text-muted-foreground">{leads.length} leads with Vibe Check requested</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search property or contact..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading leads...</div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <SortHeader label="Status" sortKey="status" current={sortKey} onSort={setSortKey} />
                    <SortHeader label="Property" sortKey="property" current={sortKey} onSort={setSortKey} />
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-center p-3 font-medium">Staff</th>
                    <SortHeader label="Responses" sortKey="responses" current={sortKey} onSort={setSortKey} className="text-center" />
                    <SortHeader label="Date" sortKey="date" current={sortKey} onSort={setSortKey} className="text-center" />
                    <th className="text-center p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((lead) => {
                    const resp = lead.vibe_check_responses || 0;
                    const staff = lead.staff_count || 0;
                    const status = getStatus(resp, lead.staff_count);
                    const pct = staff > 0 ? Math.round((resp / staff) * 100) : 0;

                    return (
                      <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="p-3 text-sm">{status.label}</td>
                        <td className="p-3 font-medium text-foreground">{lead.property_name}</td>
                        <td className="p-3">
                          <div className="text-foreground text-sm">{lead.full_name}</div>
                          <div className="text-xs text-muted-foreground">{lead.email}</div>
                        </td>
                        <td className="p-3 text-center text-muted-foreground">{staff || "—"}</td>
                        <td className="p-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm">{resp}/{staff}</span>
                            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center text-muted-foreground text-xs">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/dossier/${lead.id}`)}
                          >
                            Open →
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sorted.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No leads found.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </AdminRouteGuard>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  onSort,
  className = "text-left",
}: {
  label: string;
  sortKey: string;
  current: string;
  onSort: (k: any) => void;
  className?: string;
}) {
  return (
    <th className={`p-3 font-medium ${className}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 cursor-pointer hover:text-foreground ${
          current === sortKey ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </button>
    </th>
  );
}
