import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INDUSTRIES = ["Hotel", "Restaurant", "Resort", "Other"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Signup() {
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const orgCode = slugify(orgName);

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // 2. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert({
          org_name: orgName,
          org_code: orgCode,
          manager_email: email,
          industry,
        })
        .select("id")
        .single();
      if (orgError) throw orgError;

      // 3. Link manager to organization
      const { error: managerError } = await supabase
        .from("managers")
        .insert({
          email,
          name,
          organization_id: orgData.id,
        });
      if (managerError) throw managerError;

      // Store welcome data for the modal
      const pulseLink = `${window.location.origin}/pulse?org=${orgCode}`;
      sessionStorage.setItem(
        "welcome_data",
        JSON.stringify({ orgName, pulseLink, orgCode })
      );

      navigate("/pulse/dashboard");
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary">Be Connect</span>
          </div>
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set up your organization's pulse tracking
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className={inputCls}
              placeholder="Kilkea Castle"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <Button variant="gold" type="submit" disabled={loading} className="w-full text-base">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <a href="/pulse/login" className="text-primary hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
