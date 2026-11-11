import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brand, LangSwitch } from "@/components/clean-site";
import { useAccount } from "@/hooks/use-account";
import { usePanelI18n } from "@/lib/panel-i18n";
import { CalendarView } from "@/components/panel/calendar-view";
import { ChatView } from "@/components/panel/chat-view";
import { ClockView } from "@/components/panel/clock-view";
import { StatsView } from "@/components/panel/stats-view";
import { UsersView } from "@/components/panel/users-view";
import { useChatData } from "@/hooks/use-unread";
import { UnreadBadge } from "@/components/panel/unread-badge";
import { RequestsView } from "@/components/panel/requests-view";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({ meta: [{ title: "Mi panel | ClearView Solutions" }, { name: "description", content: "Tus citas, mensajes, estadísticas y fichajes en ClearView Solutions." }, { property: "og:title", content: "Mi panel | ClearView Solutions" }, { property: "og:description", content: "Área privada de clientes y equipo de ClearView Solutions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Panel,
});

/** Applies the profile's saved language once, then saves later changes back to the profile. */
function useProfileLanguage(userId: string | undefined, saved: string | null | undefined, loaded: boolean) {
  const { lang, setLang } = usePanelI18n();
  const applied = useRef(false);
  useEffect(() => {
    if (!userId || !loaded) return;
    if (!applied.current) {
      applied.current = true;
      if (saved === "es" || saved === "en") { if (saved !== lang) setLang(saved); return; }
    }
    if (saved !== lang) void supabase.from("profiles").update({ preferred_language: lang }).eq("id", userId).then(() => {});
  }, [userId, saved, loaded, lang, setLang]);
}

function Panel() {
  const { user, profile, role, loading } = useAccount();
  const { p } = usePanelI18n();
  useProfileLanguage(user?.id, (profile as { preferred_language?: string | null } | null)?.preferred_language, !loading && !!profile);
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  if (loading || !user || !role) return <div className="container-site section muted">{p.loading}</div>;
  const staff = role !== "client";
  return (
    <div className="panel-page">
      <header className="container-site site-header"><Brand /><div className="panel-user"><LangSwitch /><span>{profile?.full_name}<small>{p.roles[role]}</small></span><Button variant="ghost" onClick={signOut}><LogOut size={16} />{p.signOut}</Button></div></header>
      <main className="container-site panel-main">
        <h1 className="panel-title">{p.hello(profile?.full_name?.split(" ")[0] || p.welcome)}</h1>
        <Tabs defaultValue="calendar">
          <TabsList className="panel-tabs">
            <TabsTrigger value="calendar">{p.tabs.calendar}</TabsTrigger>
            <TabsTrigger value="chat">{staff ? p.tabs.support : p.tabs.chat}<ChatTabBadge userId={user.id} /></TabsTrigger>
            {staff && <TabsTrigger value="requests">{p.tabs.requests}</TabsTrigger>}
            <TabsTrigger value="stats">{p.tabs.stats}</TabsTrigger>
            {staff && <TabsTrigger value="clock">{p.tabs.clock}</TabsTrigger>}
            {role === "admin" && <TabsTrigger value="users">{p.tabs.users}</TabsTrigger>}
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

function ChatTabBadge({ userId }: { userId: string }) {
  const { total } = useChatData(userId);
  return <UnreadBadge count={total} />;
}
