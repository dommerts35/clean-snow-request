import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfiles } from "./calendar-view";
import type { Role } from "@/hooks/use-account";

export function ChatView({ role, userId }: { role: Role; userId: string }) {
  const qc = useQueryClient();
  const staff = role !== "client";
  const { data: people = [] } = useProfiles();
  const { data: msgs = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => (await supabase.from("messages").select("*").order("created_at")).data ?? [],
  });
  const [active, setActive] = useState<string | null>(staff ? null : userId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ch = supabase.channel("messages-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const clients = useMemo(() => people.filter((p) => p.role === "client"), [people]);
  const thread = msgs.filter((m) => m.client_id === active);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [thread.length]);
  const nameOf = (id: string) => (id === userId ? "Tú" : people.find((p) => p.id === id)?.full_name || "Equipo Clara");

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const body = text.trim(); setText("");
    await supabase.from("messages").insert({ client_id: active, sender_id: userId, body });
    qc.invalidateQueries({ queryKey: ["messages"] });
  }

  return (
    <div className={staff ? "chat-layout" : ""}>
      {staff && (
        <div className="panel-card chat-list">
          <h3 className="panel-h">Clientes</h3>
          {clients.length === 0 && <p className="muted">Sin clientes todavía.</p>}
          {clients.map((c) => {
            const last = [...msgs].reverse().find((m) => m.client_id === c.id);
            return <button key={c.id} className={`chat-item ${active === c.id ? "is-active" : ""}`} onClick={() => setActive(c.id)}><strong>{c.full_name || c.email}</strong><span>{last?.body ?? "Sin mensajes"}</span></button>;
          })}
        </div>
      )}
      <div className="panel-card chat-box">
        <h3 className="panel-h">{staff ? (active ? `Conversación con ${people.find((p) => p.id === active)?.full_name ?? ""}` : "Elige un cliente") : "Servicio al cliente"}</h3>
        <div className="chat-messages">
          {active && thread.length === 0 && <p className="muted">{staff ? "Aún no hay mensajes." : "Escríbenos y nuestro equipo te responderá aquí."}</p>}
          {thread.map((m) => (
            <div key={m.id} className={`bubble ${m.sender_id === userId ? "mine" : ""}`}>
              <small>{nameOf(m.sender_id)} · {format(new Date(m.created_at), "d/MM HH:mm")}</small>
              <p>{m.body}</p>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {active && (
          <form onSubmit={send} className="chat-form">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" maxLength={2000} />
            <Button type="submit" size="icon" aria-label="Enviar"><Send size={16} /></Button>
          </form>
        )}
      </div>
    </div>
  );
}
