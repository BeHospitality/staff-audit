import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Org {
  id: string;
  org_name: string;
}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("organizations").select("id, org_name").then(({ data }) => {
      if (data) setOrgs(data);
    });
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    let finalOrgId = orgId;

    // If "Other" selected, create new org first
    if (orgId === "other") {
      if (!newOrgName.trim()) {
        toast({ title: "Please enter your organization name", variant: "destructive" });
        return;
      }
      const orgCode = newOrgName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({ org_name: newOrgName.trim(), org_code: orgCode, manager_email: email })
        .select("id")
        .single();

      if (orgError || !newOrg) {
        console.error("Failed to create organization:", orgError);
        toast({ title: "Failed to create organization", description: orgError?.message, variant: "destructive" });
        return;
      }
      console.log("Created new organization:", newOrg.id, orgCode);
      finalOrgId = newOrg.id;
    }

    if (!finalOrgId || finalOrgId === "other") {
      toast({ title: "Please select an organization", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signUpError) {
      toast({ title: "Signup failed", description: signUpError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Insert into managers table
    const { data: managerRecord, error: managerError } = await supabase
      .from("managers" as any)
      .insert({ email, organization_id: finalOrgId } as any)
      .select("*")
      .single();

    if (managerError) {
      console.error("Failed to create manager record:", managerError);
      toast({ title: "Could not link organization", description: managerError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    console.log("Manager record created:", managerRecord);
    console.log("Manager organization_id saved:", (managerRecord as any)?.organization_id);

    // Also update organizations table for RLS compatibility
    await supabase
      .from("organizations")
      .update({ manager_email: email })
      .eq("id", finalOrgId);

    setLoading(false);
    toast({ title: "Account created!", description: "Please check your email to verify your account, then log in." });
    navigate("/pulse/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary">Be Connect</span>
          </div>
          <h1 className="text-2xl font-bold">Manager Sign Up</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account to access the team pulse dashboard</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="manager@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Organization</label>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              required
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select your organization</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.org_name}</option>
              ))}
              <option value="other">Other (create new)</option>
            </select>
          </div>
          {orgId === "other" && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Enter your organization name</label>
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Acme Hotel"
              />
            </div>
          )}
          <Button variant="gold" type="submit" disabled={loading} className="w-full text-base">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/pulse/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
