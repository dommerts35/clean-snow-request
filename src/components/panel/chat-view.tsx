import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatData } from "@/hooks/use-unread";
import { UnreadBadge } from "./unread-badge";
import { format } from "date-fns";
import { usePanelI18n } from "@/lib/panel-i18n";
import { Send, Bot } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { requestAssistantReply } from "@/lib/assistant.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfiles } from "./calendar-view";
import type { Role } from "@/hooks/use-account";

export function ChatView({ role, userId }: { role: Role; userId: string }) {
  const qc = useQueryClient();
  const staff = role !== "client";
  const { p, locale, timeFmt } = usePanelI18n();
  const { data: people = [] } = useProfiles();
  const { msgs, unread, markRead } = useChatData(userId);
  const [active, setActive] = useState<string | null>(staff ? null : userId);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const askAssistant = useServerFn(requestAssistantReply);
  const endRef = useRef<HTMLDivElement>(null);

  const clients = useMemo(() => people.filter((p) => p.role === "client"), [people]);
  const thread = msgs.filter((m) => m.client_id === active);
  const lastAt = thread.length ? (thread[thread.length - 1]?.created_at ?? null) : null;
  useEffect(() => {
    if (active && lastAt) void markRead(active, lastAt);
  }, [active, lastAt, markRead]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [thread.length, typing]);
  const nameOf = (id: string | null) =>
    !id
      ? p.chat.team
      : id === userId
        ? p.chat.you
        : people.find((x) => x.id === id)?.full_name || p.chat.team;

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const body = text.trim();
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ client_id: active, sender_id: userId, body });
    qc.invalidateQueries({ queryKey: ["messages"] });
    if (error || staff) return;
    setTyping(true);
    try {
      await askAssistant({ data: { clientId: active } });
    } catch (err) {
      console.error(err);
    } finally {
      setTyping(false);
      qc.invalidateQueries({ queryKey: ["messages"] });
    }
  }

  return (
    <div className={staff ? "chat-layout" : ""}>
      {staff && (
        <div className="panel-card chat-list">
          <h3 className="panel-h">{p.chat.clients}</h3>
          {clients.length === 0 && <p className="muted">{p.chat.noClients}</p>}
          {clients.map((c) => {
            const last = [...msgs].reverse().find((m) => m.client_id === c.id);
            return (
              <button
                key={c.id}
                className={`chat-item ${active === c.id ? "is-active" : ""}`}
                onClick={() => setActive(c.id)}
              >
                <strong className="chat-item-name">
                  {c.full_name || c.email}
                  <UnreadBadge count={unread[c.id] ?? 0} />
                </strong>
                <span>{last?.body ?? p.chat.noMessages}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="panel-card chat-box">
        <h3 className="panel-h">
          {staff
            ? active
              ? p.chat.with(people.find((x) => x.id === active)?.full_name ?? "")
              : p.chat.pickClient
            : p.chat.support}
        </h3>
        <div className="chat-messages">
          {active && thread.length === 0 && (
            <p className="muted">{staff ? p.chat.empty : p.chat.clientIntro}</p>
          )}
          {thread.map((m) => (
            <div
              key={m.id}
              className={`bubble ${m.sender_id === userId ? "mine" : ""} ${m.is_ai ? "is-ai" : ""}`}
            >
              <small>
                {m.is_ai ? (
                  <>
                    <span className="ai-badge">
                      <Bot size={12} aria-hidden="true" />
                      {p.chat.aiBadge}
                    </span>{" "}
                    {p.chat.ai}
                  </>
                ) : (
                  nameOf(m.sender_id)
                )}{" "}
                · {format(new Date(m.created_at), `P ${timeFmt}`, { locale })}
              </small>
              <p>{m.body}</p>
            </div>
          ))}
          {typing && (
            <div className="bubble is-ai typing" role="status">
              <small>
                <span className="ai-badge">
                  <Bot size={12} aria-hidden="true" />
                  {p.chat.aiBadge}
                </span>{" "}
                {p.chat.ai}
              </small>
              <p className="typing-dots" aria-label={p.chat.typing}>
                <span />
                <span />
                <span />
              </p>
            </div>
          )}
          <div ref={endRef} />
        </div>
        {active && (
          <form onSubmit={send} className="chat-form">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={p.chat.placeholder}
              maxLength={2000}
            />
            <Button type="submit" size="icon" aria-label={p.chat.send}>
              <Send size={16} />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
