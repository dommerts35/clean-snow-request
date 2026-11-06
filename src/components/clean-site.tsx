import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, Send, Grid2X2, Leaf, Menu, ShieldCheck, Snowflake, Sparkles, UserRound, X } from 'lucide-react';
import { useSessionUser } from '@/hooks/use-account';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SERVICE_VALUES, dictionaries, useI18n, type Dict, type ServiceValue } from '@/lib/i18n';
import logoUrl from '@/assets/logo.svg';
import heroPhoto from '@/assets/window-winter.jpg';
import snowPhoto from '@/assets/snow-removal.jpg';

const QuoteContext = createContext<(service?: ServiceValue) => void>(() => {});
export function QuoteButton({ children, service, className, label }: { children?: ReactNode; service?: ServiceValue; className?: string; label?: string }) {
  const open = useContext(QuoteContext); const { t } = useI18n();
  return <Button className={className} aria-label={label} onClick={() => open(service)}>{children ?? t.quote}<ArrowRight size={16} aria-hidden="true"/></Button>;
}
function AccountLink({ onClick }: { onClick: () => void }) { const { user } = useSessionUser(); const { t } = useI18n(); return user ? <Link to="/panel" className="account-link" onClick={onClick}><UserRound size={15} className="inline mr-1" aria-hidden="true"/>{t.nav.panel}</Link> : <Link to="/auth" className="account-link" onClick={onClick}><UserRound size={15} className="inline mr-1" aria-hidden="true"/>{t.nav.login}</Link>; }
export function Brand() { const { t } = useI18n(); return <Link to="/" className="brand" aria-label={t.brandLabel}><img src={logoUrl} className="brand-icon" width={415} height={326} alt="" aria-hidden="true"/><span aria-hidden="true">clearview<span>.</span><small>{t.brandTag}</small></span></Link>; }
export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return <div role="group" aria-label="Idioma / Language" className={`lang-switch ${className}`}>
    <button type="button" lang="en" aria-label="English" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
    <span aria-hidden="true">|</span>
    <button type="button" lang="es" aria-label="Español" aria-pressed={lang === 'es'} onClick={() => setLang('es')}>ES</button>
  </div>;
}
export function SiteShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [menu, setMenu] = useState(false); const [open, setOpen] = useState(false); const [service, setService] = useState<ServiceValue>('Limpieza de ventanas');
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [menu]);
  const close = () => setMenu(false);
  return <QuoteContext.Provider value={(value) => { setService(value || 'Limpieza de ventanas'); setOpen(true); }}>
  <a href="#contenido" className="skip-link">{t.skip}</a>
  <header className="container-site site-header"><Brand/><nav id="menu-principal" aria-label={t.nav.main} className={`nav-links ${menu ? 'is-open' : ''}`}><Link to="/" activeOptions={{ exact: true }} onClick={close}>{t.nav.home}</Link><Link to="/servicios" onClick={close}>{t.nav.services}</Link><Link to="/nosotros" onClick={close}>{t.nav.about}</Link><Link to="/contacto" onClick={close}>{t.nav.contact}</Link><AccountLink onClick={close}/></nav><LangSwitch/><QuoteButton className="header-cta"/><Button ref={toggleRef} variant="ghost" size="icon" className="mobile-menu min-h-11 min-w-11" aria-label={menu ? t.nav.close : t.nav.open} aria-expanded={menu} aria-controls="menu-principal" onClick={() => setMenu(!menu)}>{menu ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</Button></header>
  <main id="contenido" tabIndex={-1}>{children}</main><footer className="footer"><div className="container-site footer-inner"><Brand/><p>{t.footer}</p><p>© {new Date().getFullYear()} ClearView Solutions.</p></div></footer>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="quote-dialog"><DialogHeader><DialogTitle>{t.dialog.title}</DialogTitle><DialogDescription>{t.dialog.desc}</DialogDescription></DialogHeader><QuoteForm initialService={service}/></DialogContent></Dialog>
  </QuoteContext.Provider>;
}
const Req = ({ t }: { t: Dict }) => <span className="req"> {t.form.req}</span>;
/** Maps a submitted select value to the stable stored value. */
export function toStoredService(value: string): ServiceValue { return (SERVICE_VALUES as readonly string[]).includes(value) ? value as ServiceValue : 'Limpieza de ventanas'; }
export function QuoteForm({ initialService = 'Limpieza de ventanas' }: { initialService?: ServiceValue }) {
  const { t } = useI18n(); const f = t.form;
  const [ready, setReady] = useState(false); const [sending, setSending] = useState(false); const [failed, setFailed] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (ready) successRef.current?.focus(); }, [ready]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setSending(true); setFailed(false); setReady(false);
    const { error } = await supabase.from('quote_requests').insert({ name: String(data.get('name')), email: String(data.get('email')), service: toStoredService(String(data.get('service'))), location: String(data.get('location')), details: String(data.get('details')) });
    setSending(false); if (error) { setFailed(true); return; } form.reset(); setReady(true); }
  return <form className="quote-form" onSubmit={submit} onInput={() => { setReady(false); setFailed(false); }}>
    <label>{f.name}<Req t={t}/><input name="name" autoComplete="name" placeholder={f.namePh} maxLength={200} required aria-required="true"/></label>
    <label>{f.email}<Req t={t}/><input name="email" type="email" inputMode="email" autoComplete="email" placeholder={f.emailPh} maxLength={255} required aria-required="true"/></label>
    <label>{f.service}<Req t={t}/><select name="service" defaultValue={initialService} required aria-required="true">{SERVICE_VALUES.map(v => <option key={v} value={v}>{t.serviceLabels[v]}</option>)}</select></label>
    <label>{f.location}<Req t={t}/><input name="location" autoComplete="address-level2" placeholder={f.locationPh} maxLength={300} required aria-required="true"/></label>
    <label>{f.details}<Req t={t}/><textarea name="details" autoComplete="off" placeholder={f.detailsPh} maxLength={3000} required aria-required="true"/></label>
    <Button type="submit" disabled={sending}><Send aria-hidden="true"/>{sending ? f.sending : f.send}</Button>
    <div aria-live="polite">{ready && <p ref={successRef} tabIndex={-1} className="success-notice" role="status"><Check className="inline mr-2" size={16} aria-hidden="true"/>{f.ok}</p>}</div>
    {failed && <p className="form-error" role="alert">{f.fail}</p>}
  </form>;
}
export function Services() {
  const { t } = useI18n(); const s = t.services;
  const cards = [{ value: 'Limpieza de ventanas' as const, icon: Grid2X2, img: heroPhoto, c: s.windows, cls: '' }, { value: 'Retiro de nieve' as const, icon: Snowflake, img: snowPhoto, c: s.snow, cls: 'snow-image' }];
  return <div className="service-grid">{cards.map(({ value, icon: Icon, img, c, cls }) => { const title = t.serviceLabels[value]; return <article className="service-card" key={value}><img src={img} loading="lazy" width={1536} height={1024} alt={c.alt} className={`service-image ${cls}`}/><div className="service-body"><div className="service-title"><Icon size={25} strokeWidth={1.5} aria-hidden="true"/><h3>{title}</h3></div><p>{c.text}</p><ul className="service-list">{c.features.map(f => <li key={f}><Check aria-hidden="true"/>{f}</li>)}</ul><QuoteButton service={value} label={`${s.consultLabel}${title}`}>{s.consult}</QuoteButton></div></article>; })}</div>;
}
export function Process() { const { t } = useI18n(); const p = t.process; return <section className="process-band"><div className="container-site section"><div className="section-heading"><div><div className="eyebrow">{p.eyebrow}</div><h2>{p.title}</h2></div><p>{p.l1}<br/>{p.l2}</p></div><ol className="process-grid">{p.steps.map(([title, text], i) => <li key={i}><span className="step-number" aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>; }
export function FinalCTA() { const { t } = useI18n(); return <section className="container-site final-band"><div><h2>{t.cta.title}</h2><p>{t.cta.text}</p></div><QuoteButton/></section>; }
export function TrustStrip() { const { t } = useI18n(); const icons = [ShieldCheck, Sparkles, Leaf, Snowflake]; return <section className="trust-strip" aria-label={t.trust.label}><ul className="container-site trust-inner">{t.trust.items.map((text, i) => { const I = icons[i] ?? icons[0]!; return <li className="trust-item" key={i}><I strokeWidth={1.6} aria-hidden="true"/><span>{text}</span></li>; })}</ul></section>; }
export const sitePhoto = heroPhoto;
/** SSR head uses Spanish (default); usePageMeta swaps title/description on the client. */
export function pageMeta(key: keyof Dict['meta']) { const [title, description] = dictionaries.es.meta[key]; return { meta: [{title: `${title} | ClearView Solutions`},{name:'description',content:description},{property:'og:title',content:`${title} | ClearView Solutions`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }; }
