import { useAccountI18n } from "@/lib/account-i18n";
import { useQuery, useQueryClient } from "@tanstack/react-query";


import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Role } from "@/hooks/use-account";

export function RequestsView({ role }: { role: Role }) {
  const { a, lang, date, time, duration, number, service, status, property, text } = useAccountI18n();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["quote_requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) { toast.error(a.requests.updateFail); return; }
    qc.invalidateQueries({ queryKey: ["quote_requests"] });
  }
  async function remove(id: string) {
    if (!confirm(a.requests.confirmDelete)) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) { toast.error(a.requests.deleteFail); return; }
    toast.success(a.requests.deleted);
    qc.invalidateQueries({ queryKey: ["quote_requests"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">{a.requests.title}</h3>
      {data.length === 0 ? <p className="muted">{a.requests.empty}</p> : data.map((r) => (
        <div className="appt" key={r.id}>
          <div className="appt-top"><strong>{service(r.service)} · {r.name}</strong>
            <select className="field" style={{ width: "auto" }} aria-label={text(a.requests.status, { name: r.name })} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
              <option value="nueva">{a.statuses.nueva}</option><option value="contactada">{a.statuses.contactada}</option><option value="cerrada">{a.statuses.cerrada}</option>
            </select>
          </div>
          <div className="appt-meta">{date(r.created_at, { dateStyle: "medium", timeStyle: "short" })} · <a href={`mailto:${r.email}`}>{r.email}</a> · {r.location}{r.property_type ? ` · ${property(r.property_type)}` : ""}</div>
          {r.details && <p className="appt-meta" style={{ whiteSpace: "pre-wrap" }}>{r.details}</p>}
          {role === "admin" && <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 size={14} />{a.common.delete}</Button>}
        </div>
      ))}
    </div>
  );
}
