/** Pure unread-count rules: a message is unread for a user when someone else sent it after the user's last read time. */
export type UnreadMsg = { client_id: string; sender_id: string | null; created_at: string };
export type ReadRow = { client_id: string; last_read_at: string };

export function unreadByConversation(msgs: UnreadMsg[], reads: ReadRow[], userId: string): Record<string, number> {
  const last = new Map(reads.map((r) => [r.client_id, new Date(r.last_read_at).getTime()]));
  const out: Record<string, number> = {};
  for (const m of msgs) {
    if (m.sender_id === userId) continue;
    const t = last.get(m.client_id);
    if (t !== undefined && new Date(m.created_at).getTime() <= t) continue;
    out[m.client_id] = (out[m.client_id] ?? 0) + 1;
  }
  return out;
}

export const badgeLabel = (n: number) => (n <= 0 ? null : n > 99 ? "99+" : String(n));
