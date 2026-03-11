import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ROLE_OPTIONS = ["Owner", "GM", "HR Manager", "Operations Manager", "Other"];

const CHALLENGE_OPTIONS = [
  "Can't find good people",
  "People quit in first month",
  "Team morale is low",
  "Don't know who's at risk",
  "Training takes too long",
  "Constant recruitment is exhausting",
];

function generateVibeCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function formatIrishPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("08")) {
    return "+353" + cleaned.slice(1);
  }
  return cleaned;
}

interface LeadCaptureFormProps {
  prefillStaffCount?: number;
  prefillTurnoverRate?: number;
}

interface FormErrors {
  fullName?: string;
  propertyName?: string;
  email?: string;
  phone?: string;
}

export default function LeadCaptureForm({ prefillStaffCount, prefillTurnoverRate }: LeadCaptureFormProps) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [staffCount, setStaffCount] = useState(prefillStaffCount?.toString() ?? "");
  const [turnoverRate, setTurnoverRate] = useState(prefillTurnoverRate?.toString() ?? "");
  const [turnoverNotSure, setTurnoverNotSure] = useState(false);
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (fullName.trim().length < 2) newErrors.fullName = "Name must be at least 2 characters";
    if (propertyName.trim().length < 2) newErrors.propertyName = "Property name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Please enter a valid email";
    const cleanedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
    if (!cleanedPhone || cleanedPhone.length < 7) newErrors.phone = "Please enter a valid phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const formattedPhone = formatIrishPhone(phone.trim());
      const vibeCode = generateVibeCode();
      const staffNum = staffCount ? parseInt(staffCount) : null;
      const turnoverNum = turnoverNotSure ? null : (turnoverRate ? parseInt(turnoverRate) : null);

      const leadData = {
        full_name: fullName.trim(),
        property_name: propertyName.trim(),
        role: role || null,
        email: email.trim().toLowerCase(),
        phone: formattedPhone,
        staff_count: staffNum,
        turnover_rate: turnoverNum,
        biggest_challenge: biggestChallenge || null,
        vibe_check_requested: true,
        vibe_check_code: vibeCode,
        vibe_check_responses: 0,
        vibe_check_total_staff: staffNum,
        status: "new" as const,
      };

      // Use secure RPC to capture lead and get ID back
      const { data: leadId, error } = await supabase.rpc("capture_lead", {
        p_full_name: leadData.full_name,
        p_email: leadData.email,
        p_phone: leadData.phone,
        p_property_name: leadData.property_name,
        p_role: leadData.role || null,
        p_staff_count: leadData.staff_count || null,
        p_turnover_rate: leadData.turnover_rate || null,
        p_biggest_challenge: leadData.biggest_challenge || null,
        p_vibe_check_code: leadData.vibe_check_code || null,
        p_vibe_check_total_staff: leadData.vibe_check_total_staff || null,
      });

      if (error) throw error;

      // Create organization for pulse survey using vibe_check_code as org_code
      await supabase
        .from("organizations")
        .upsert(
          { org_name: propertyName.trim(), org_code: vibeCode, manager_email: email.trim().toLowerCase() },
          { onConflict: "org_code" }
        );

      // Trigger email edge function (fire-and-forget)
      const baseUrl = import.meta.env.VITE_PUBLIC_URL || 'https://staff-audit.be.ie';
      supabase.functions.invoke("send-lead-emails", {
        body: {
          contactName: leadData.full_name,
          contactEmail: leadData.email,
          propertyName: leadData.property_name,
          vibeCheckLink: `${baseUrl}/pulse/survey?org=${vibeCode}`,
          phone: formattedPhone,
          staffCount: staffNum,
          turnoverRate: turnoverNum,
          vibeCheckCode: vibeCode,
        },
      }).catch(() => {});

      navigate(`/thank-you?id=${data.id}`);
    } catch (err: any) {
      console.error("Lead submission error:", err);
      setSubmitError("Something went wrong. Please try again or email us at team@beconnect.ie");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: keyof FormErrors) =>
    `bg-card border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full ${
      errors[field] ? "border-destructive" : "border-input"
    }`;

  const selectCls =
    "bg-card border border-input rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full";

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm shadow-xl mt-8">
      <CardContent className="p-6 md:p-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            🎯 See What's Really Going On Inside Your Team
          </h3>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Get your free Team Vibe Check — a confidential pulse assessment that reveals retention risk,
            team imbalance, and exactly where to focus first.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
          {/* Row 1: Name & Property */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Name *</Label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls("fullName")} placeholder="John Smith" />
              {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Property Name *</Label>
              <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className={inputCls("propertyName")} placeholder="Kilkea Castle" />
              {errors.propertyName && <p className="text-destructive text-xs mt-1">{errors.propertyName}</p>}
            </div>
          </div>

          {/* Row 2: Role & Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Your Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls}>
                <option value="">Select role...</option>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email *</Label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls("email")} placeholder="you@property.ie" />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Row 3: Phone & Staff Count */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Phone *</Label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls("phone")} placeholder="+353 87 123 4567" />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full-time Staff Count</Label>
              <input type="number" value={staffCount} onChange={(e) => setStaffCount(e.target.value)} className={selectCls} placeholder="e.g. 160" min={1} />
            </div>
          </div>

          {/* Row 4: Turnover Rate & Challenge */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Approx. Turnover Rate (%)</Label>
              <input
                type="number"
                value={turnoverNotSure ? "" : turnoverRate}
                onChange={(e) => setTurnoverRate(e.target.value)}
                disabled={turnoverNotSure}
                className={`${selectCls} ${turnoverNotSure ? "opacity-50" : ""}`}
                placeholder="e.g. 30"
                min={0}
                max={100}
              />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="not-sure"
                  checked={turnoverNotSure}
                  onCheckedChange={(checked) => setTurnoverNotSure(checked === true)}
                />
                <label htmlFor="not-sure" className="text-xs text-muted-foreground cursor-pointer">Not sure</label>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-1.5 block">Biggest Challenge</Label>
              <select value={biggestChallenge} onChange={(e) => setBiggestChallenge(e.target.value)} className={selectCls}>
                <option value="">Select...</option>
                {CHALLENGE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {submitError && (
            <p className="text-destructive text-sm text-center">{submitError}</p>
          )}

          <div className="text-center pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={loading}
              className="text-base px-10 py-6 text-lg shadow-lg shadow-primary/20 hover-scale w-full md:w-auto"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
              ) : (
                "Send Me My Free Vibe Check"
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">No credit card required. 100% confidential.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
