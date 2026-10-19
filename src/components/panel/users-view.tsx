import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "./calendar-view";
import { ROLE_LABEL, type Role } from "@/hooks/use-account";

export function UsersView({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: people = [] } = useProfiles();
  async function change(id: string, role: Role) {
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", id);
    if (error) return toast.error("No se pudo cambiar el rol.");
    toast.success("Rol actualizado");
    qc.invalidateQueries({ queryKey: ["profiles"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">Cuentas</h3>
      <p className="muted mb-4">Los nuevos registros entran como clientes. Cambia aquí a trabajador o administrador.</p>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead>
        <tbody>{people.map((p) => (
          <tr key={p.id}><td>{p.full_name}</td><td>{p.email}</td><td>
            <select className="field" value={p.role} disabled={p.id === userId} onChange={(e) => change(p.id, e.target.value as Role)}>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
