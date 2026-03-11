
-- Add GDPR consent columns to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS gdpr_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consent_given_at timestamptz;

-- Update capture_lead RPC to accept and validate consent
CREATE OR REPLACE FUNCTION public.capture_lead(
  p_full_name text,
  p_email text,
  p_phone text,
  p_property_name text,
  p_role text DEFAULT NULL,
  p_staff_count integer DEFAULT NULL,
  p_turnover_rate integer DEFAULT NULL,
  p_biggest_challenge text DEFAULT NULL,
  p_vibe_check_code text DEFAULT NULL,
  p_vibe_check_total_staff integer DEFAULT NULL,
  p_gdpr_consent boolean DEFAULT false,
  p_consent_given_at timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_id uuid;
BEGIN
  -- Validate GDPR consent is given
  IF NOT p_gdpr_consent THEN
    RAISE EXCEPTION 'GDPR consent is required to submit lead data';
  END IF;

  INSERT INTO public.leads (
    full_name, email, phone, property_name, role,
    staff_count, turnover_rate, biggest_challenge,
    vibe_check_requested, vibe_check_code, vibe_check_responses,
    vibe_check_total_staff, status, gdpr_consent, consent_given_at
  ) VALUES (
    p_full_name, p_email, p_phone, p_property_name, p_role,
    p_staff_count, p_turnover_rate, p_biggest_challenge,
    true, p_vibe_check_code, 0,
    p_vibe_check_total_staff, 'new', p_gdpr_consent, p_consent_given_at
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    property_name = EXCLUDED.property_name,
    role = EXCLUDED.role,
    staff_count = EXCLUDED.staff_count,
    turnover_rate = EXCLUDED.turnover_rate,
    biggest_challenge = EXCLUDED.biggest_challenge,
    vibe_check_requested = EXCLUDED.vibe_check_requested,
    vibe_check_code = EXCLUDED.vibe_check_code,
    vibe_check_total_staff = EXCLUDED.vibe_check_total_staff,
    gdpr_consent = EXCLUDED.gdpr_consent,
    consent_given_at = EXCLUDED.consent_given_at
  RETURNING id INTO lead_id;
  
  RETURN lead_id;
END;
$$;
