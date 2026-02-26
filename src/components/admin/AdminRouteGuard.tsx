import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldX } from "lucide-react";

const ADMIN_EMAILS = ["hello@be.ie", "info@be.ie"];

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "authorized" | "denied">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }
      if (ADMIN_EMAILS.includes(session.user.email || "")) {
        setState("authorized");
      } else {
        setState("denied");
      }
    };
    check();
  }, [navigate]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <ShieldX className="w-14 h-14 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This area is restricted to Be Connect administrators.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
