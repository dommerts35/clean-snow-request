import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "worker" | "client";

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

export function useAccount() {
  const { user, ready } = useSessionUser();
  const query = useQuery({
    queryKey: ["account", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profile }, { data: roleRow }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, preferred_language")
          .eq("id", user!.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user!.id).maybeSingle(),
      ]);
      return { profile, role: (roleRow?.role ?? "client") as Role };
    },
  });
  return {
    user,
    ready,
    profile: query.data?.profile ?? null,
    role: query.data?.role,
    loading: !ready || (!!user && query.isLoading),
  };
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  worker: "Trabajador",
  client: "Cliente",
};
