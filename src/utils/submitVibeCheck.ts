import { supabase } from "@/integrations/supabase/client";
import type { Demographics } from "@/config/demographics";

export async function submitVibeCheck(
  leadId: string,
  demographics: Demographics,
  answers: Record<number, number>
) {
  const anonymousId = crypto.randomUUID();

  const { error: insertError } = await supabase
    .from("vibe_check_responses" as any)
    .insert({
      lead_id: leadId,
      anonymous_id: anonymousId,
      department: demographics.department,
      role_level: demographics.role_level,
      tenure: demographics.tenure,
      employment_type: demographics.employment_type,
      q1_score: answers[1],
      q2_score: answers[2],
      q3_score: answers[3],
      q4_score: answers[4],
      q5_score: answers[5],
    });

  if (insertError) throw insertError;

  // Increment counter on leads table
  await supabase.rpc("increment_vibe_check_responses" as any, {
    lead_uuid: leadId,
  });
}
