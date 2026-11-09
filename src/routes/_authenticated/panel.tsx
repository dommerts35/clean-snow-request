import { useEffect } from "react";
import { useAccountI18n } from "@/lib/account-i18n";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brand, LangSwitch } from "@/components/clean-site";
import { useAccount } from "@/hooks/use-account";
import { CalendarView } from "@/components/panel/calendar-view";
import { ChatView } from "@/components/panel/chat-view";
import { ClockView } from "@/components/panel/clock-view";
import { StatsView } from "@/components/panel/stats-view";
import { UsersView } from "@/components/panel/users-view";
import { RequestsView } from "@/components/panel/requests-view";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({ meta: [{ title: "Mi panel | ClearView Solutions" }, { name: "description", content: "Tus citas, mensajes, estadísticas y fichajes en ClearView Solutions." }, { property: "og:title", content: "Mi panel | ClearView Solutions" }, { property: "og:description", content: "Área privada de clientes y equipo de ClearView Solutions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Panel,
});

function Panel() {
  const { a, text } = useAccountI18n();
  useEffect(() => { document.title = `${a.meta.title} | ClearView Solutions`; document.querySelector('meta[name="description"]')?.setAttribute("content", a.meta.description); }, [a.meta]);
  const { user, profile, role, loading } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  if (loading || !user || !role) return <div className="container-site section muted">{a.common.loading}</div>;
  const staff = role !== "client";
  return (
    <div className="panel-page">
      <header className="container-site site-header"><Brand /><div className="panel-user"><span>{profile?.full_name}<small>{a.roles[role]}</small></span><LangSwitch /><Button variant="ghost" onClick={signOut}><LogOut size={16} />{a.common.signOut}</Button></div></header>
      <main className="container-site panel-main">
        <h1 className="panel-title">{text(a.common.hello, { name: profile?.full_name?.split(" ")[0] || a.common.welcome })}</h1>
        <Tabs defaultValue="calendar">
          <TabsList className="panel-tabs">
            <TabsTrigger value="calendar">{a.nav.calendar}</TabsTrigger>
            <TabsTrigger value="chat">{staff ? a.nav.support : a.nav.chat}</TabsTrigger>
            {staff && <TabsTrigger value="requests">{a.nav.requests}</TabsTrigger>}
            <TabsTrigger value="stats">{a.nav.stats}</TabsTrigger>
            {staff && <TabsTrigger value="clock">{a.nav.clock}</TabsTrigger>}
            {role === "admin" && <TabsTrigger value="users">{a.nav.users}</TabsTrigger>}
          </TabsList>
          <TabsContent value="calendar"><CalendarView role={role} userId={user.id} /></TabsContent>
          <TabsContent value="chat"><ChatView role={role} userId={user.id} /></TabsContent>
          {staff && <TabsContent value="requests"><RequestsView role={role} /></TabsContent>}
          <TabsContent value="stats"><StatsView role={role} userId={user.id} /></TabsContent>
          {staff && <TabsContent value="clock"><ClockView role={role} userId={user.id} /></TabsContent>}
          {role === "admin" && <TabsContent value="users"><UsersView userId={user.id} /></TabsContent>}
        </Tabs>
      </main>
    </div>
  );
}
