export const HUMAN_PAUSE_MINUTES = 30;

type Msg = { sender_id: string | null; is_ai: boolean; created_at: string };

/** Decide whether the AI may answer: last message is the client's and no staff member wrote in the last 30 min. */
export function shouldReply(history: Msg[], clientId: string, now: Date): { ok: boolean; reason?: string } {
  const last = history[history.length - 1];
  if (!last || last.is_ai || last.sender_id !== clientId) return { ok: false, reason: "not_client_turn" };
  const cutoff = now.getTime() - HUMAN_PAUSE_MINUTES * 60_000;
  const humanRecent = history.some((m) => !m.is_ai && m.sender_id && m.sender_id !== clientId && new Date(m.created_at).getTime() >= cutoff);
  if (humanRecent) return { ok: false, reason: "human_active" };
  return { ok: true };
}
