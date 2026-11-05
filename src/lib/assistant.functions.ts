import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const AI_RATE_LIMIT = 10; // replies per client
export const AI_RATE_WINDOW_MIN = 10;
export const HUMAN_PAUSE_MIN = 30;

export const requestAssistantReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ clientId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ replied: boolean; reason?: string }> => {
    // Caller must be the client of this thread (and have the client role).
    if (context.userId !== data.clientId) return { replied: false, reason: "forbidden" };
    const { data: roleRow } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).maybeSingle();
    if (roleRow?.role !== "client") return { replied: false, reason: "not_client" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateAssistantReply, shouldReply } = await import("./assistant.server");

    const { data: rows, error } = await supabaseAdmin
      .from("messages").select("sender_id, body, is_ai, created_at")
      .eq("client_id", data.clientId).order("created_at", { ascending: false }).limit(20);
    if (error || !rows?.length) return { replied: false, reason: "no_messages" };
    const history = [...rows].reverse();

    const decision = shouldReply(history, data.clientId, new Date());
    if (!decision.ok) return { replied: false, reason: decision.reason };

    const since = new Date(Date.now() - AI_RATE_WINDOW_MIN * 60_000).toISOString();
    const { count } = await supabaseAdmin.from("messages").select("id", { count: "exact", head: true })
      .eq("client_id", data.clientId).eq("is_ai", true).gte("created_at", since);
    if ((count ?? 0) >= AI_RATE_LIMIT) return { replied: false, reason: "rate_limited" };

    try {
      const reply = await generateAssistantReply(history, data.clientId);
      if (!reply) return { replied: false, reason: "empty" };
      const { error: insErr } = await supabaseAdmin.from("messages")
        .insert({ client_id: data.clientId, sender_id: null, is_ai: true, body: reply.slice(0, 2000) });
      if (insErr) { console.error("assistant insert", insErr); return { replied: false, reason: "insert_failed" }; }
      return { replied: true };
    } catch (e) {
      console.error("assistant AI error", e);
      return { replied: false, reason: "ai_failed" };
    }
  });
