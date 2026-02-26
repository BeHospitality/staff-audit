import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, Loader2 } from "lucide-react";

interface PinEntryProps {
  propertyName: string;
  onSubmit: (pin: string) => Promise<boolean>;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

function getAttemptState(): { count: number; lockedUntil: number | null } {
  try {
    const raw = sessionStorage.getItem("pin_attempts");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, lockedUntil: null };
}

function setAttemptState(count: number, lockedUntil: number | null) {
  sessionStorage.setItem("pin_attempts", JSON.stringify({ count, lockedUntil }));
}

export default function PinEntry({ propertyName, onSubmit }: PinEntryProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  const checkLockout = useCallback(() => {
    const state = getAttemptState();
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      setLocked(true);
      return true;
    }
    if (state.lockedUntil && Date.now() >= state.lockedUntil) {
      setAttemptState(0, null);
      setLocked(false);
    }
    return false;
  }, []);

  const handleSubmit = async () => {
    if (pin.length !== 4 || loading) return;
    if (checkLockout()) return;

    setLoading(true);
    setError("");

    const success = await onSubmit(pin);

    if (success) {
      setAttemptState(0, null);
    } else {
      const state = getAttemptState();
      const newCount = state.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        setAttemptState(newCount, Date.now() + LOCKOUT_MS);
        setLocked(true);
      } else {
        setAttemptState(newCount, null);
        setError("Incorrect PIN. Please try again.");
      }
      setPin("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm text-center space-y-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Be Connect</p>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">Your Team Insights Report</h1>
          <p className="text-sm text-muted-foreground">
            This report was prepared exclusively for <strong className="text-foreground">{propertyName}</strong>.
          </p>
        </div>

        {locked ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive font-medium">
              Too many attempts. Please try again in 5 minutes or contact team@beconnect.ie
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter your access PIN to continue.</p>

            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={(val) => {
                  setPin(val);
                  setError("");
                }}
                inputMode="numeric"
                pattern="[0-9]*"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              variant="gold"
              className="w-full"
              disabled={pin.length !== 4 || loading}
              onClick={handleSubmit}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              View My Report →
            </Button>
          </div>
        )}

        <div className="space-y-1 pt-2">
          <p className="text-xs text-muted-foreground">
            Your PIN was provided by your Be Connect partner.
          </p>
          <p className="text-xs text-muted-foreground">
            Don't have one? Contact <span className="text-foreground">team@beconnect.ie</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5" />
          <span>Confidential</span>
        </div>
      </div>
    </div>
  );
}
