import { useAccountI18n } from "@/lib/account-i18n";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Send, Bot } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { requestAssistantReply } from "@/lib/assistant.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfiles } from "./calendar-view";
import type { Role } from "@/hooks/use-account";

export function ChatView({ role, userId }: { role: Role; userId: string }) {
  const { a, lang, date, time, duration, number, service, status, property, text } = useAccountI18n();
  const qc = useQueryClient();
  const staff = role !== "client";
  const { data: people = [] } = useProfiles();
  const { data: msgs = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => (await supabase.from("messages").select("*").order("created_at")).data ?? [],
  });
  const [active, setActive] = useState<string | null>(staff ? null : userId);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const askAssistant = useServerFn(requestAssistantReply);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ch = supabase.channel("messages-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const clients = useMemo(() => people.filter((p) => p.role === "client"), [people]);
  const thread = msgs.filter((m) => m.client_id === active);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [thread.length, typing]);
  const nameOf = (id: string | null) => !id ? a.chat.team : (id === userId ? a.chat.you : people.find((p) => p.id === id)?.full_name || a.chat.team);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const body = text.trim(); setText("");
    const { error } = await supabase.from("messages").insert({ client_id: active, sender_id: userId, body });
    qc.invalidateQueries({ queryKey: ["messages"] });
    if (error || staff) return;
    setTyping(true);
    try { await askAssistant({ data: { clientId: active } }); } catch (err) { console.error(err); }
    finally { setTyping(false); qc.invalidateQueries({ queryKey: ["messages"] }); }
  }

  return (
    <div className={staff ? "chat-layout" : ""}>
      {staff && (
        <div className="panel-card chat-list">
          <h3 className="panel-h">{a.chat.clients}</h3>
          {clients.length === 0 && <p className="muted">{a.chat.noClients}</p>}
          {clients.map((c) => {
            const last = [...msgs].reverse().find((m) => m.client_id === c.id);
            return <button key={c.id} className={`chat-item ${active === c.id ? "is-active" : ""}`} onClick={() => setActive(c.id)}><strong>{c.full_name || c.email}</strong><span>{last?.body ?? a.chat.noMessages}</span></button>;
          })}
        </div>
      )}
      <div className="panel-card chat-box">
        <h3 className="panel-h">{staff ? (active ? text(a.chat.conversation, { name: people.find((p) => p.id === active)?.full_name ?? "" }) : a.chat.choose) : a.nav.support}</h3>
        <div className="chat-messages">
          {active && thread.length === 0 && <p className="muted">{staff ? a.chat.empty : a.chat.intro}</p>}
          {thread.map((m) => (
            <div key={m.id} className={`bubble ${m.sender_id === userId ? "mine" : ""} ${m.is_ai ? "is-ai" : ""}`}>
              <small>{m.is_ai ? <><span className="ai-badge"><Bot size={12} aria-hidden="true" />{a.chat.ai}</span> {a.chat.assistant}</> : nameOf(m.sender_id)} · {date(m.created_at, { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })}</small>
              <p>{m.body}</p>
            </div>
          ))}
          {typing && <div className="bubble is-ai typing" role="status"><small><span className="ai-badge"><Bot size={12} aria-hidden="true" />{a.chat.ai}</span> {a.chat.assistant}</small><p className="typing-dots" aria-label={a.chat.typing}><span /><span /><span /></p></div>}
          <div ref={endRef} />
        </div>
        {active && (
          <form onSubmit={send} className="chat-form">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={a.chat.placeholder} aria-label={a.chat.placeholder} maxLength={2000} />
            <Button type="submit" size="icon" aria-label={a.chat.send}><Send size={16} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}
