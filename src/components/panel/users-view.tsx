import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "./calendar-view";
import { ROLE_LABEL, type Role } from "@/hooks/use-account";

export function UsersView({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: people = [] } = useProfiles();
  async function change(id: string, role: Role) {
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", id);
    if (error) { toast.error("No se pudo cambiar el rol."); return; }
    toast.success("Rol actualizado");
    qc.invalidateQueries({ queryKey: ["profiles"] });
  }
  async function remove(id: string, name: string) {
    if (!confirm(`¿Eliminar la cuenta de ${name || "este usuario"}? Se borrarán sus citas, mensajes y fichajes.`)) return;
    const { error } = await supabase.rpc("admin_delete_account", { _user_id: id });
    if (error) { toast.error("No se pudo eliminar la cuenta."); return; }
    toast.success("Cuenta eliminada");
    qc.invalidateQueries({ queryKey: ["profiles"] });
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">Cuentas</h3>
      <p className="muted mb-4">Los nuevos registros entran como clientes. Cambia aquí a trabajador o administrador.</p>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr></thead>
        <tbody>{people.map((p) => (
          <tr key={p.id}><td>{p.full_name}</td><td>{p.email}</td><td>
            <select className="field" value={p.role} disabled={p.id === userId} onChange={(e) => change(p.id, e.target.value as Role)}>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </td><td>{p.id !== userId && <Button variant="ghost" size="icon" aria-label="Eliminar cuenta" onClick={() => remove(p.id, p.full_name)}><Trash2 size={16} /></Button>}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
