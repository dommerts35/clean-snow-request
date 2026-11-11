import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "./calendar-view";
import { usePanelI18n } from "@/lib/panel-i18n";
import { ROLE_LABEL, type Role } from "@/hooks/use-account";

export function UsersView({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { p } = usePanelI18n();
  const { data: people = [] } = useProfiles();
  async function change(id: string, role: Role) {
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", id);
    if (error) { toast.error(p.users.roleFail); return; }
    toast.success(p.users.roleOk);
    qc.invalidateQueries({ queryKey: ["profiles"] });
  }
  async function remove(id: string, name: string) {
    if (!confirm(p.users.confirm(name))) return;
    const { error } = await supabase.rpc("admin_delete_account", { _user_id: id });
    if (error) { toast.error(p.users.delFail); return; }
    toast.success(p.users.delOk);
    qc.invalidateQueries({ queryKey: ["profiles"] });
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">{p.users.title}</h3>
      <p className="muted mb-4">{p.users.intro}</p>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>{p.users.name}</th><th>{p.users.email}</th><th>{p.users.role}</th><th></th></tr></thead>
        <tbody>{people.map((u) => (
          <tr key={u.id}><td>{u.full_name}</td><td>{u.email}</td><td>
            <select className="field" value={u.role} disabled={u.id === userId} onChange={(e) => change(u.id, e.target.value as Role)}>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{p.roles[r]}</option>)}
            </select>
          </td><td>{u.id !== userId && <Button variant="ghost" size="icon" aria-label={p.users.delLabel} onClick={() => remove(u.id, u.full_name)}><Trash2 size={16} /></Button>}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
