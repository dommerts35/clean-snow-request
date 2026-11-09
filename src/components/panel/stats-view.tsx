import { useAccountI18n } from "@/lib/account-i18n";
import { useMemo } from "react";
import { startOfWeek } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppointments, useProfiles } from "./calendar-view";
import { useTimeEntries } from "./clock-view";
import { totalMinutes } from "@/lib/work-time";
import type { Role } from "@/hooks/use-account";

export function StatsView({ role, userId }: { role: Role; userId: string }) {
  const { a, lang, date, time, duration, number, service, status, property, text } = useAccountI18n();
  const { data: appts = [] } = useAppointments();
  const { data: entries = [] } = useTimeEntries();
  const { data: people = [] } = useProfiles();
  const now = new Date();
  const upcoming = appts.filter((a) => new Date(a.starts_at) >= now).length;
  const past = appts.length - upcoming;
  const week = startOfWeek(now, { weekStartsOn: 1 });
  const mine = role === "admin" ? entries : entries.filter((e) => e.worker_id === userId);
  const weekMin = totalMinutes(mine.filter((e) => new Date(e.clock_in) >= week), now);

  const byService = useMemo(() => {
    const m = new Map<string, number>();
    appts.forEach((a) => m.set(a.service, (m.get(a.service) ?? 0) + 1));
    return [...m].map(([name, total]) => ({ name: service(name), total }));
  }, [appts, lang]);
  const byWorker = useMemo(() => people.filter((p) => p.role !== "client").map((p) => ({ name: p.full_name || "—", horas: +(totalMinutes(entries.filter((e) => e.worker_id === p.id), now) / 60).toFixed(1) })), [people, entries]);

  const cards: [string, string | number][] = [[a.stats.upcoming, number(upcoming)], [a.stats.past, number(past)]];
  if (role !== "client") cards.push([a.stats.week, duration(weekMin)], [a.stats.all, duration(totalMinutes(mine, now))]);
  if (role === "admin") cards.push([a.stats.clients, people.filter((p) => p.role === "client").length], [a.stats.workers, people.filter((p) => p.role === "worker").length]);

  return (
    <div className="stack">
      <div className="stat-grid">{cards.map(([l, v]) => <div key={l} className="panel-card stat"><span>{l}</span><strong>{v}</strong></div>)}</div>
      <div className="panel-grid">
        <div className="panel-card"><h3 className="panel-h">{a.stats.service}</h3>
          {byService.length === 0 ? <p className="muted">{a.common.noData}</p> : <ResponsiveContainer width="100%" height={220}><BarChart data={byService}><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip formatter={(value: number) => number(value)} /><Bar name={a.common.total} dataKey="total" fill="var(--primary)" radius={4} /></BarChart></ResponsiveContainer>}
        </div>
        {role === "admin" && <div className="panel-card"><h3 className="panel-h">{a.stats.worker}</h3>
          {byWorker.length === 0 ? <p className="muted">{a.common.noData}</p> : <ResponsiveContainer width="100%" height={220}><BarChart data={byWorker}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(value: number) => number(value)} /><Bar name={a.common.hours} dataKey="horas" fill="var(--primary)" radius={4} /></BarChart></ResponsiveContainer>}
        </div>}
      </div>
    </div>
  );
}
