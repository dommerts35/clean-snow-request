import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { usePanelI18n } from "@/lib/panel-i18n";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Role } from "@/hooks/use-account";

export function RequestsView({ role }: { role: Role }) {
  const qc = useQueryClient();
  const { p, t, locale } = usePanelI18n();
  const svc = t.serviceLabels as Record<string, string>; const prop = t.propertyLabels as Record<string, string>;
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
    if (error) { toast.error(p.req.updateFail); return; }
    qc.invalidateQueries({ queryKey: ["quote_requests"] });
  }
  async function remove(id: string) {
    if (!confirm(p.req.confirm)) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) { toast.error(p.req.delFail); return; }
    toast.success(p.req.delOk);
    qc.invalidateQueries({ queryKey: ["quote_requests"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">{p.req.title}</h3>
      {data.length === 0 ? <p className="muted">{p.req.none}</p> : data.map((r) => (
        <div className="appt" key={r.id}>
          <div className="appt-top"><strong>{svc[r.service] ?? r.service} · {r.name}</strong>
            <select className="field" style={{ width: "auto" }} aria-label={p.req.statusLabel} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
              {Object.keys(p.req.status).map((s) => <option key={s} value={s}>{p.req.status[s]}</option>)}
            </select>
          </div>
          <div className="appt-meta">{format(new Date(r.created_at), p.req.dateFmt, { locale })} · <a href={`mailto:${r.email}`}>{r.email}</a> · {r.location}{r.property_type ? ` · ${prop[r.property_type] ?? r.property_type}` : ""}</div>
          {r.details && <p className="appt-meta" style={{ whiteSpace: "pre-wrap" }}>{r.details}</p>}
          {role === "admin" && <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 size={14} />{p.req.del}</Button>}
        </div>
      ))}
    </div>
  );
}
