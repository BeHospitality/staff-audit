import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }

    // Verify admin role
    const { data } = await supabase.functions.invoke("check-admin");
    setLoading(false);

    if (!data?.is_admin) {
      await supabase.auth.signOut();
      toast({ title: "Access denied", description: "This login is restricted to Be Connect administrators.", variant: "destructive" });
      return;
    }

    navigate("/pulse/dashboard");
  };

  const inputCls =
    "w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary">Be Connect</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Restricted to Be Connect team only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder="admin@be.ie"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <Button variant="gold" type="submit" disabled={loading} className="w-full text-base">
            {loading ? "Verifying..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
