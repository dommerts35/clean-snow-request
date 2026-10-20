import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Role } from "@/hooks/use-account";

export function RequestsView({ role }: { role: Role }) {
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
    if (error) return toast.error("No se pudo actualizar.");
    qc.invalidateQueries({ queryKey: ["quote_requests"] });
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) return toast.error("No se pudo eliminar.");
    toast.success("Solicitud eliminada");
    qc.invalidateQueries({ queryKey: ["quote_requests"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">Solicitudes de presupuesto</h3>
      {data.length === 0 ? <p className="muted">Aún no hay solicitudes.</p> : data.map((r) => (
        <div className="appt" key={r.id}>
          <div className="appt-top"><strong>{r.service} · {r.name}</strong>
            <select className="field" style={{ width: "auto" }} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
              <option value="nueva">Nueva</option><option value="contactada">Contactada</option><option value="cerrada">Cerrada</option>
            </select>
          </div>
          <div className="appt-meta">{format(new Date(r.created_at), "d MMM yyyy, HH:mm", { locale: es })} · <a href={`mailto:${r.email}`}>{r.email}</a> · {r.location}</div>
          <p className="appt-meta" style={{ whiteSpace: "pre-wrap" }}>{r.details}</p>
          {role === "admin" && <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 size={14} />Eliminar</Button>}
        </div>
      ))}
    </div>
  );
}
