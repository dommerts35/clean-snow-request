import { useAccountI18n } from "@/lib/account-i18n";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


import { LogIn, LogOut, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { pickDemoLocation, totalMinutes, workedMinutes } from "@/lib/work-time";
import { useProfiles } from "./calendar-view";
import type { Role } from "@/hooks/use-account";

export function useTimeEntries() {
  return useQuery({
    queryKey: ["time_entries"],
    queryFn: async () => (await supabase.from("time_entries").select("*").order("clock_in", { ascending: false })).data ?? [],
  });
}

function mapLink(lat: number | null, lng: number | null) {
  return lat != null && lng != null ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}` : undefined;
}

export function ClockView({ role, userId }: { role: Role; userId: string }) {
  const { a, lang, date, time, duration, number, service, status, property, text } = useAccountI18n();
  const qc = useQueryClient();
  const { data: entries = [] } = useTimeEntries();
  const { data: people = [] } = useProfiles();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const mine = entries.filter((e) => e.worker_id === userId);
  const openEntry = mine.find((e) => !e.clock_out);

  const toggle = useMutation({
    mutationFn: async () => {
      const loc = pickDemoLocation(Math.floor(Math.random() * 1000));
      if (openEntry) {
        const { error } = await supabase.from("time_entries").update({ clock_out: new Date().toISOString(), out_lat: loc.lat, out_lng: loc.lng, out_label: loc.label }).eq("id", openEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("time_entries").insert({ worker_id: userId, in_lat: loc.lat, in_lng: loc.lng, in_label: loc.label });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["time_entries"] }); toast.success(openEntry ? a.clock.outSaved : a.clock.inSaved); },
    onError: () => toast.error(a.clock.fail),
  });

  const shown = role === "admin" ? entries : mine;
  const nameOf = (id: string) => people.find((p) => p.id === id)?.full_name || "—";

  return (
    <div className="stack">
      <div className="panel-card clock-card">
        <div>
          <div className="eyebrow">{openEntry ? a.clock.working : a.clock.off}</div>
          <h3 className="clock-time">{openEntry ? duration(workedMinutes(openEntry.clock_in, null, now)) : time(now)}</h3>
          <p className="muted">{openEntry ? text(a.clock.started, { time: time(openEntry.clock_in), location: openEntry.in_label ?? "" }) : a.clock.startHint}</p>
          <p className="form-notice">{a.clock.demo}</p>
        </div>
        <Button size="lg" onClick={() => toggle.mutate()} disabled={toggle.isPending} variant={openEntry ? "outline" : "default"}>
          {openEntry ? <><LogOut size={18} />{a.clock.clockOut}</> : <><LogIn size={18} />{a.clock.clockIn}</>}
        </Button>
      </div>
      <div className="panel-card">
        <h3 className="panel-h">{role === "admin" ? a.clock.team : a.clock.mine} · {a.common.total} {duration(totalMinutes(shown, now))}</h3>
        {shown.length === 0 ? <p className="muted">{a.clock.empty}</p> : (
          <div className="table-wrap"><table className="data-table">
            <thead><tr>{role === "admin" && <th>{a.common.worker}</th>}<th>{a.common.date}</th><th>{a.clock.in}</th><th>{a.clock.out}</th><th>{a.clock.duration}</th></tr></thead>
            <tbody>{shown.map((e) => (
              <tr key={e.id}>
                {role === "admin" && <td>{nameOf(e.worker_id)}</td>}
                <td>{date(e.clock_in, { day: "numeric", month: "short" })}</td>
                <td>{time(e.clock_in)} <a className="loc" href={mapLink(e.in_lat, e.in_lng)} target="_blank" rel="noreferrer"><MapPin size={12} />{e.in_label}</a></td>
                <td>{e.clock_out ? <>{time(e.clock_out)} <a className="loc" href={mapLink(e.out_lat, e.out_lng)} target="_blank" rel="noreferrer"><MapPin size={12} />{e.out_label}</a></> : <span className="badge-soft">{a.clock.ongoing}</span>}</td>
                <td>{duration(workedMinutes(e.clock_in, e.clock_out, now))}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
