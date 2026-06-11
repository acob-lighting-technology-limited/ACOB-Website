/**
 * Best-effort logging of public-website AcoBot conversations into the ACOB ERP's
 * Supabase `acobot_logs` table (source = "website"), so the ERP dev console can
 * review website chats alongside internal ones.
 *
 * Uses the ERP Supabase REST endpoint with the ERP's anon key. An RLS policy on
 * acobot_logs only permits anon INSERTs of website rows (and anon has no read
 * access), so no service-role key is shipped to the public site.
 * Never throws — a logging failure must never break the chat.
 */
export interface AcobotWebsiteLog {
  question: string;
  answer: string;
  hadContext: boolean;
  model: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export async function logAcobotWebsiteTurn(
  entry: AcobotWebsiteLog,
): Promise<void> {
  const url = process.env.ACOB_ERP_SUPABASE_URL;
  const key = process.env.ACOB_ERP_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return;
  }

  try {
    await fetch(`${url}/rest/v1/acobot_logs`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        source: 'website',
        question: entry.question,
        answer: entry.answer,
        had_context: entry.hadContext,
        model: entry.model,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
      }),
    });
  } catch {
    // Swallow — logging is best-effort and must not affect the user's chat.
  }
}
