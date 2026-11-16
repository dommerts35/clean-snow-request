import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { usePanelI18n } from "@/lib/panel-i18n";
import { LogIn, LogOut, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDuration, pickDemoLocation, totalMinutes, workedMinutes } from "@/lib/work-time";
import { useProfiles } from "./calendar-view";
import type { Role } from "@/hooks/use-account";

export function useTimeEntries() {
  return useQuery({
    queryKey: ["time_entries"],
    queryFn: async () =>
      (await supabase.from("time_entries").select("*").order("clock_in", { ascending: false }))
        .data ?? [],
  });
}

function mapLink(lat: number | null, lng: number | null) {
  return lat != null && lng != null
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
    : undefined;
}

export function ClockView({ role, userId }: { role: Role; userId: string }) {
  const qc = useQueryClient();
  const { p, locale, timeFmt } = usePanelI18n();
  const { data: entries = [] } = useTimeEntries();
  const { data: people = [] } = useProfiles();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const mine = entries.filter((e) => e.worker_id === userId);
  const openEntry = mine.find((e) => !e.clock_out);

  const toggle = useMutation({
    mutationFn: async () => {
      const loc = pickDemoLocation(Math.floor(Math.random() * 1000));
      if (openEntry) {
        const { error } = await supabase
          .from("time_entries")
          .update({
            clock_out: new Date().toISOString(),
            out_lat: loc.lat,
            out_lng: loc.lng,
            out_label: loc.label,
          })
          .eq("id", openEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("time_entries")
          .insert({ worker_id: userId, in_lat: loc.lat, in_lng: loc.lng, in_label: loc.label });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      toast.success(openEntry ? p.clock.outOk : p.clock.inOk);
    },
    onError: () => toast.error(p.clock.fail),
  });

  const shown = role === "admin" ? entries : mine;
  const nameOf = (id: string) => people.find((p) => p.id === id)?.full_name || "—";

  return (
    <div className="stack">
      <div className="panel-card clock-card">
        <div>
          <div className="eyebrow">{openEntry ? p.clock.working : p.clock.off}</div>
          <h3 className="clock-time">
            {openEntry
              ? formatDuration(workedMinutes(openEntry.clock_in, null, now))
              : format(now, timeFmt, { locale })}
          </h3>
          <p className="muted">
            {openEntry
              ? p.clock.inAt(
                  format(new Date(openEntry.clock_in), timeFmt, { locale }),
                  openEntry.in_label ?? "",
                )
              : p.clock.hint}
          </p>
          <p className="form-notice">{p.clock.demo}</p>
        </div>
        <Button
          size="lg"
          onClick={() => toggle.mutate()}
          disabled={toggle.isPending}
          variant={openEntry ? "outline" : "default"}
        >
          {openEntry ? (
            <>
              <LogOut size={18} />
              {p.clock.clockOut}
            </>
          ) : (
            <>
              <LogIn size={18} />
              {p.clock.clockIn}
            </>
          )}
        </Button>
      </div>
      <div className="panel-card">
        <h3 className="panel-h">
          {role === "admin" ? p.clock.team : p.clock.mine} · {p.clock.total}{" "}
          {formatDuration(totalMinutes(shown, now))}
        </h3>
        {shown.length === 0 ? (
          <p className="muted">{p.clock.none}</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {role === "admin" && <th>{p.clock.worker}</th>}
                  <th>{p.clock.date}</th>
                  <th>{p.clock.in}</th>
                  <th>{p.clock.out}</th>
                  <th>{p.clock.time}</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id}>
                    {role === "admin" && <td>{nameOf(e.worker_id)}</td>}
                    <td>{format(new Date(e.clock_in), p.clock.dateFmt, { locale })}</td>
                    <td>
                      {format(new Date(e.clock_in), timeFmt, { locale })}{" "}
                      <a
                        className="loc"
                        href={mapLink(e.in_lat, e.in_lng)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MapPin size={12} />
                        {e.in_label}
                      </a>
                    </td>
                    <td>
                      {e.clock_out ? (
                        <>
                          {format(new Date(e.clock_out), timeFmt, { locale })}{" "}
                          <a
                            className="loc"
                            href={mapLink(e.out_lat, e.out_lng)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MapPin size={12} />
                            {e.out_label}
                          </a>
                        </>
                      ) : (
                        <span className="badge-soft">{p.clock.ongoing}</span>
                      )}
                    </td>
                    <td>{formatDuration(workedMinutes(e.clock_in, e.clock_out, now))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
