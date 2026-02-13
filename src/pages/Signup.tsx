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
    if (!orgId) {
      toast({ title: "Please select an organization", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (signUpError) {
      toast({ title: "Signup failed", description: signUpError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Insert into managers table to link user to organization
    const { error: managerError } = await supabase
      .from("managers" as any)
      .insert({ email, organization_id: orgId } as any);

    if (managerError) {
      console.error("Failed to create manager record:", managerError);
      toast({ title: "Could not link organization", description: managerError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Also update organizations table for RLS compatibility
    await supabase
      .from("organizations")
      .update({ manager_email: email })
      .eq("id", orgId);

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
            </select>
          </div>
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
