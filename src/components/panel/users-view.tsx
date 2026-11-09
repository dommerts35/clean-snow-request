import { useAccountI18n } from "@/lib/account-i18n";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfiles } from "./calendar-view";
import { type Role } from "@/hooks/use-account";

export function UsersView({ userId }: { userId: string }) {
  const { a, lang, date, time, duration, number, service, status, property, text } = useAccountI18n();
  const qc = useQueryClient();
  const { data: people = [] } = useProfiles();
  async function change(id: string, role: Role) {
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", id);
    if (error) { toast.error(a.users.roleFail); return; }
    toast.success(a.users.roleSaved);
    qc.invalidateQueries({ queryKey: ["profiles"] });
  }
  async function remove(id: string, name: string) {
    if (!confirm(text(a.users.confirmDelete, { name: name || a.users.fallback }))) return;
    const { error } = await supabase.rpc("admin_delete_account", { _user_id: id });
    if (error) { toast.error(a.users.deleteFail); return; }
    toast.success(a.users.deleted);
    qc.invalidateQueries({ queryKey: ["profiles"] });
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }
  return (
    <div className="panel-card">
      <h3 className="panel-h">{a.users.title}</h3>
      <p className="muted mb-4">{a.users.intro}</p>
      <div className="table-wrap"><table className="data-table">
        <thead><tr><th>{a.common.name}</th><th>{a.common.email}</th><th>{a.common.role}</th><th></th></tr></thead>
        <tbody>{people.map((p) => (
          <tr key={p.id}><td>{p.full_name}</td><td>{p.email}</td><td>
            <select className="field" aria-label={text(a.users.roleLabel, { name: p.full_name })} value={p.role} disabled={p.id === userId} onChange={(e) => change(p.id, e.target.value as Role)}>
              {(Object.keys(a.roles) as Role[]).map((r) => <option key={r} value={r}>{a.roles[r]}</option>)}
            </select>
          </td><td>{p.id !== userId && <Button variant="ghost" size="icon" aria-label={a.users.deleteLabel} onClick={() => remove(p.id, p.full_name)}><Trash2 size={16} /></Button>}</td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}
