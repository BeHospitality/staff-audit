
-- RPC: Capture a lead (upsert) and return the ID — replaces anon SELECT after upsert
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
  p_vibe_check_total_staff integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lead_id uuid;
BEGIN
  INSERT INTO public.leads (
    full_name, email, phone, property_name, role,
    staff_count, turnover_rate, biggest_challenge,
    vibe_check_requested, vibe_check_code, vibe_check_responses,
    vibe_check_total_staff, status
  ) VALUES (
    p_full_name, p_email, p_phone, p_property_name, p_role,
    p_staff_count, p_turnover_rate, p_biggest_challenge,
    true, p_vibe_check_code, 0,
    p_vibe_check_total_staff, 'new'
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
    vibe_check_total_staff = EXCLUDED.vibe_check_total_staff
  RETURNING id INTO lead_id;
  
  RETURN lead_id;
END;
$$;

-- RPC: Get limited lead info for Thank You page — no PII exposure
CREATE OR REPLACE FUNCTION public.get_thank_you_data(p_lead_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  property_name text,
  email text,
  staff_count integer,
  turnover_rate integer,
  vibe_check_code text,
  vibe_check_responses integer,
  vibe_check_total_staff integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.full_name, l.property_name, l.email,
         l.staff_count, l.turnover_rate, l.vibe_check_code,
         l.vibe_check_responses, l.vibe_check_total_staff
  FROM public.leads l
  WHERE l.id = p_lead_id
  LIMIT 1;
END;
$$;

-- RPC: Get lead data for shared report display
CREATE OR REPLACE FUNCTION public.get_lead_report_data(p_lead_id uuid)
RETURNS TABLE(
  property_name text,
  staff_count integer,
  turnover_rate integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT l.property_name, l.staff_count, l.turnover_rate
  FROM public.leads l
  WHERE l.id = p_lead_id
  LIMIT 1;
END;
$$;
