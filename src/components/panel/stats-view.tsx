import { useMemo } from "react";
import { startOfWeek } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppointments, useProfiles } from "./calendar-view";
import { useTimeEntries } from "./clock-view";
import { formatDuration, totalMinutes } from "@/lib/work-time";
import { usePanelI18n } from "@/lib/panel-i18n";
import type { Role } from "@/hooks/use-account";

export function StatsView({ role, userId }: { role: Role; userId: string }) {
  const { data: appts = [] } = useAppointments();
  const { data: entries = [] } = useTimeEntries();
  const { data: people = [] } = useProfiles();
  const { p, t } = usePanelI18n();
  const now = new Date();
  const upcoming = appts.filter((a) => new Date(a.starts_at) >= now).length;
  const past = appts.length - upcoming;
  const week = startOfWeek(now, { weekStartsOn: 1 });
  const mine = role === "admin" ? entries : entries.filter((e) => e.worker_id === userId);
  const weekMin = totalMinutes(mine.filter((e) => new Date(e.clock_in) >= week), now);

  const byService = useMemo(() => {
    const m = new Map<string, number>();
    appts.forEach((a) => m.set(p.cal.services[a.service] ?? (t.serviceLabels as Record<string, string>)[a.service] ?? a.service, (m.get(a.service) ?? 0) + 1));
    return [...m].map(([name, total]) => ({ name, total }));
  }, [appts, p, t]);
  const byWorker = useMemo(() => people.filter((p) => p.role !== "client").map((p) => ({ name: p.full_name || "—", horas: +(totalMinutes(entries.filter((e) => e.worker_id === p.id), now) / 60).toFixed(1) })), [people, entries]);

  const cards: [string, string | number][] = [[p.stats.upcoming, upcoming], [p.stats.done, past]];
  if (role !== "client") cards.push([p.stats.weekHours, formatDuration(weekMin)], [p.stats.totalHours, formatDuration(totalMinutes(mine, now))]);
  if (role === "admin") cards.push([p.stats.clients, people.filter((p) => p.role === "client").length], [p.stats.workers, people.filter((p) => p.role === "worker").length]);

  return (
    <div className="stack">
      <div className="stat-grid">{cards.map(([l, v]) => <div key={l} className="panel-card stat"><span>{l}</span><strong>{v}</strong></div>)}</div>
      <div className="panel-grid">
        <div className="panel-card"><h3 className="panel-h">{p.stats.byService}</h3>
          {byService.length === 0 ? <p className="muted">{p.stats.noData}</p> : <ResponsiveContainer width="100%" height={220}><BarChart data={byService}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="total" name={p.stats.total} fill="var(--primary)" radius={4} /></BarChart></ResponsiveContainer>}
        </div>
        {role === "admin" && <div className="panel-card"><h3 className="panel-h">{p.stats.byWorker}</h3>
          {byWorker.length === 0 ? <p className="muted">{p.stats.noData}</p> : <ResponsiveContainer width="100%" height={220}><BarChart data={byWorker}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="horas" name={p.stats.hours} fill="var(--primary)" radius={4} /></BarChart></ResponsiveContainer>}
        </div>}
      </div>
    </div>
  );
}
