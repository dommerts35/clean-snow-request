import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { usePanelI18n } from "@/lib/panel-i18n";
import { Plus, MapPin, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Role } from "@/hooks/use-account";

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*").order("starts_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").order("full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleOf = new Map((roles ?? []).map((r) => [r.user_id, r.role as Role]));
      return (profiles ?? []).map((p) => ({ ...p, role: roleOf.get(p.id) ?? ("client" as Role) }));
    },
  });
}

export function CalendarView({ role, userId }: { role: Role; userId: string }) {
  const { data: appts = [] } = useAppointments();
  const { data: people = [] } = useProfiles();
  const [day, setDay] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const nameOf = (id: string) => people.find((p) => p.id === id)?.full_name || "—";
  const upcoming = useMemo(
    () => appts.filter((a) => new Date(a.starts_at) >= new Date(new Date().setHours(0, 0, 0, 0))),
    [appts],
  );
  const dayAppts = appts.filter((a) => day && isSameDay(new Date(a.starts_at), day));
  const staff = role !== "client";
  const { p, locale } = usePanelI18n();

  return (
    <div className="panel-grid">
      <div className="panel-card">
        <Calendar
          mode="single"
          selected={day}
          onSelect={setDay}
          locale={locale}
          modifiers={{ booked: appts.map((a) => new Date(a.starts_at)) }}
          modifiersClassNames={{ booked: "day-booked" }}
          className="p-3 pointer-events-auto"
        />
        {staff && (
          <Button className="w-full mt-3" onClick={() => setOpen(true)}>
            <Plus size={16} />
            {p.cal.newAppt}
          </Button>
        )}
      </div>
      <div className="panel-card">
        <h3 className="panel-h">{day ? format(day, p.cal.dayFmt, { locale }) : p.cal.pickDay}</h3>
        {dayAppts.length === 0 ? (
          <p className="muted">{p.cal.noneToday}</p>
        ) : (
          dayAppts.map((a) => <ApptItem key={a.id} a={a} nameOf={nameOf} role={role} />)
        )}
        <h3 className="panel-h mt-6">{p.cal.upcoming}</h3>
        {upcoming.length === 0 ? (
          <p className="muted">{p.cal.noneUpcoming}</p>
        ) : (
          upcoming
            .slice(0, 8)
            .map((a) => <ApptItem key={a.id} a={a} nameOf={nameOf} role={role} showDate />)
        )}
      </div>
      {staff && (
        <NewAppointment
          open={open}
          onOpenChange={setOpen}
          role={role}
          userId={userId}
          people={people}
          defaultDay={day}
        />
      )}
    </div>
  );
}

type Appt = {
  id: string;
  client_id: string;
  worker_id: string;
  service: string;
  starts_at: string;
  duration_minutes: number;
  address: string;
  notes: string;
  status: string;
};
function ApptItem({
  a,
  nameOf,
  role,
  showDate,
}: {
  a: Appt;
  nameOf: (id: string) => string;
  role: Role;
  showDate?: boolean;
}) {
  const qc = useQueryClient();
  const { p, locale, timeFmt } = usePanelI18n();
  async function remove() {
    if (!confirm(p.cal.confirmDelete)) return;
    const { error } = await supabase.from("appointments").delete().eq("id", a.id);
    if (error) {
      toast.error(p.cal.deleteFail);
      return;
    }
    toast.success(p.cal.deleted);
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }
  return (
    <div className="appt">
      <div className="appt-top">
        <strong>{p.cal.services[a.service] ?? a.service}</strong>
        <span className="flex items-center gap-1">
          <span className="badge-soft">{p.cal.status[a.status] ?? a.status}</span>
          {role === "admin" && (
            <Button variant="ghost" size="icon" aria-label={p.cal.deleteLabel} onClick={remove}>
              <Trash2 size={15} />
            </Button>
          )}
        </span>
      </div>
      <div className="appt-meta">
        <Clock size={13} />
        {format(new Date(a.starts_at), showDate ? p.cal.shortFmt : timeFmt, { locale })} ·{" "}
        {a.duration_minutes} min
      </div>
      {a.address && (
        <div className="appt-meta">
          <MapPin size={13} />
          {a.address}
        </div>
      )}
      <div className="appt-meta">
        {role === "client"
          ? `${p.cal.worker}: ${nameOf(a.worker_id)}`
          : `${p.cal.client}: ${nameOf(a.client_id)}${role === "admin" ? ` · ${p.cal.worker}: ${nameOf(a.worker_id)}` : ""}`}
      </div>
    </div>
  );
}

function NewAppointment({
  open,
  onOpenChange,
  role,
  userId,
  people,
  defaultDay,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: Role;
  userId: string;
  people: { id: string; full_name: string; role: Role }[];
  defaultDay?: Date | undefined;
}) {
  const qc = useQueryClient();
  const { p } = usePanelI18n();
  const clients = people.filter((p) => p.role === "client");
  const workers = people.filter((p) => p.role !== "client");
  const create = useMutation({
    mutationFn: async (row: {
      client_id: string;
      worker_id: string;
      service: string;
      starts_at: string;
      duration_minutes: number;
      address: string;
      notes: string;
    }) => {
      const { error } = await supabase.from("appointments").insert(row);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success(p.cal.created);
      onOpenChange(false);
    },
    onError: () => toast.error(p.cal.createFail),
  });
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate({
      client_id: String(f.get("client")),
      worker_id: role === "admin" ? String(f.get("worker")) : userId,
      service: String(f.get("service")),
      starts_at: new Date(`${f.get("date")}T${f.get("time")}`).toISOString(),
      duration_minutes: Number(f.get("duration")),
      address: String(f.get("address")),
      notes: String(f.get("notes")),
    });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="quote-dialog">
        <DialogHeader>
          <DialogTitle>{p.cal.newAppt}</DialogTitle>
        </DialogHeader>
        {clients.length === 0 ? (
          <p className="muted">{p.cal.noClients}</p>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <div>
              <Label>{p.cal.client}</Label>
              <select name="client" className="field" required>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.id}
                  </option>
                ))}
              </select>
            </div>
            {role === "admin" && (
              <div>
                <Label>{p.cal.worker}</Label>
                <select name="worker" className="field" defaultValue={userId}>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>{p.cal.service}</Label>
              <select name="service" className="field">
                {Object.keys(p.cal.services).map((v) => (
                  <option key={v} value={v}>
                    {p.cal.services[v]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <div>
                <Label>{p.cal.date}</Label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={format(defaultDay ?? new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div>
                <Label>{p.cal.time}</Label>
                <Input name="time" type="time" required defaultValue="09:00" />
              </div>
              <div>
                <Label>{p.cal.minutes}</Label>
                <Input name="duration" type="number" min={15} step={15} defaultValue={60} />
              </div>
            </div>
            <div>
              <Label>{p.cal.address}</Label>
              <Input name="address" placeholder={p.cal.addressPh} />
            </div>
            <div>
              <Label>{p.cal.notes}</Label>
              <Textarea name="notes" />
            </div>
            <Button type="submit" disabled={create.isPending}>
              {p.cal.save}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
