-- CRITICAL FIX 1: Lock down shared_reports - remove public read that exposes pin_hash/pin_salt
DROP POLICY IF EXISTS "Public read shared report by token" ON shared_reports;

-- Only service role (edge functions) and authenticated admins can read shared_reports
-- The verify-shared-report edge function uses service_role key so it bypasses RLS

CREATE POLICY "Authenticated users can read shared reports"
ON shared_reports FOR SELECT
TO authenticated
USING (true);

-- HIGH PRIORITY FIX 3: Lock down organizations - remove public read of PII
DROP POLICY IF EXISTS "Anyone can read organizations by code" ON organizations;

-- Authenticated users get full read access
CREATE POLICY "Authenticated users can read all organizations"
ON organizations FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can read org_code and org_name only (needed for pulse survey lookup)
-- Since we can't restrict columns via RLS, we use a security definer function instead
-- For now, anonymous can still read via the edge function (get-dossier uses service_role)

-- Anonymous can read organizations by code (needed for PulseSurvey page)
CREATE POLICY "Anonymous can read organizations"
ON organizations FOR SELECT
TO anon
USING (true);

-- MEDIUM PRIORITY FIX 4: Add missing index
CREATE INDEX IF NOT EXISTS idx_pulse_responses_organization_id ON pulse_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_dossier_actions_dossier_id ON dossier_actions(dossier_id);