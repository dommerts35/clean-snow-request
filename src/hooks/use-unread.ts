import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { unreadByConversation } from "@/lib/unread";

/** Shared messages + read-state queries with live updates; RLS limits both to what the user may see. */
export function useChatData(userId: string) {
  const qc = useQueryClient();
  const { data: msgs = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => (await supabase.from("messages").select("*").order("created_at")).data ?? [],
  });
  const { data: reads = [] } = useQuery({
    queryKey: ["chat_reads", userId],
    queryFn: async () => (await supabase.from("chat_reads").select("client_id,last_read_at").eq("user_id", userId)).data ?? [],
  });
  useEffect(() => {
    const ch = supabase.channel(`chat-live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_reads" }, () => qc.invalidateQueries({ queryKey: ["chat_reads", userId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, userId]);
  const unread = useMemo(() => unreadByConversation(msgs, reads, userId), [msgs, reads, userId]);
  const total = useMemo(() => Object.values(unread).reduce((a, b) => a + b, 0), [unread]);
  const markRead = useCallback(async (clientId: string, upTo: string) => {
    const cur = reads.find((r) => r.client_id === clientId);
    if (cur && new Date(cur.last_read_at) >= new Date(upTo)) return;
    await supabase.from("chat_reads").upsert({ user_id: userId, client_id: clientId, last_read_at: upTo });
    qc.invalidateQueries({ queryKey: ["chat_reads", userId] });
  }, [reads, userId, qc]);
  return { msgs, unread, total, markRead };
}
