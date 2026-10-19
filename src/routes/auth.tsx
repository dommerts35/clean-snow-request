import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell, pageMeta } from "@/components/clean-site";

export const Route = createFileRoute("/auth")({
  head: () => pageMeta("Acceder a tu cuenta", "Inicia sesión o crea tu cuenta de cliente para ver tus citas y hablar con nuestro equipo."),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/panel", replace: true }); });
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_IN") navigate({ to: "/panel", replace: true }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")); const password = String(f.get("password"));
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error("Correo o contraseña incorrectos.");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/panel", data: { full_name: String(f.get("name")) } } });
      if (error) toast.error(error.message);
      else if (!data.session) setSent(true);
    }
    setBusy(false);
  }

  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error("No se pudo iniciar sesión.");
  }

  return (
    <SiteShell>
      <section className="container-site section">
        <div className="auth-card">
          <div className="eyebrow">Área privada</div>
          <h1>{mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h1>
          <p className="muted">Clientes, trabajadores y administradores entran desde aquí.</p>
          {sent ? (
            <p className="success-notice" role="status">Revisa tu correo y confirma tu cuenta para entrar.</p>
          ) : (
            <form onSubmit={submit} className="auth-form">
              {mode === "signup" && <div><Label htmlFor="name">Nombre</Label><Input id="name" name="name" required autoComplete="name" /></div>}
              <div><Label htmlFor="email">Correo electrónico</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
              <div><Label htmlFor="password">Contraseña</Label><Input id="password" name="password" type="password" minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>
              <Button type="submit" disabled={busy}>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</Button>
            </form>
          )}
          <div className="auth-divider"><span>o</span></div>
          <div className="auth-social">
            <Button variant="outline" onClick={() => social("google")}>Continuar con Google</Button>
            <button type="button" className="lovable-auth-button" onClick={() => social("lovable")}>Continue with Lovable</button>
          </div>
          <button type="button" className="auth-switch" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setSent(false); }}>
            {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </section>
    </SiteShell>
  );
}
