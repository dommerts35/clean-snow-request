import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, Send, Grid2X2, Leaf, Menu, ShieldCheck, Snowflake, Sparkles, UserRound, X } from 'lucide-react';
import { useSessionUser } from '@/hooks/use-account';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import heroPhoto from '@/assets/window-winter.jpg';
import snowPhoto from '@/assets/snow-removal.jpg';

const QuoteContext = createContext<(service?: string) => void>(() => {});
export function QuoteButton({ children = 'Solicitar presupuesto', service, className, label }: { children?: ReactNode; service?: string; className?: string; label?: string }) {
  const open = useContext(QuoteContext);
  return <Button className={className} aria-label={label} onClick={() => open(service)}>{children}<ArrowRight size={16} aria-hidden="true"/></Button>;
}
function AccountLink({ onClick }: { onClick: () => void }) { const { user } = useSessionUser(); return user ? <Link to="/panel" className="account-link" onClick={onClick}><UserRound size={15} className="inline mr-1" aria-hidden="true"/>Mi panel</Link> : <Link to="/auth" className="account-link" onClick={onClick}><UserRound size={15} className="inline mr-1" aria-hidden="true"/>Acceder</Link>; }
export function Brand() { return <Link to="/" className="brand" aria-label="Clara, inicio"><Sparkles className="brand-icon" strokeWidth={1.7} aria-hidden="true"/><span aria-hidden="true">clara<span>.</span><small>Ventanas & nieve</small></span></Link>; }
export function SiteShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false); const [open, setOpen] = useState(false); const [service, setService] = useState('Limpieza de ventanas');
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); toggleRef.current?.focus(); } };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [menu]);
  const close = () => setMenu(false);
  return <QuoteContext.Provider value={(value) => { setService(value || 'Limpieza de ventanas'); setOpen(true); }}>
  <a href="#contenido" className="skip-link">Saltar al contenido</a>
  <header className="container-site site-header"><Brand/><nav id="menu-principal" aria-label="Navegación principal" className={`nav-links ${menu ? 'is-open' : ''}`}><Link to="/" activeOptions={{ exact: true }} onClick={close}>Inicio</Link><Link to="/servicios" onClick={close}>Servicios</Link><Link to="/nosotros" onClick={close}>Nosotros</Link><Link to="/contacto" onClick={close}>Contacto</Link><AccountLink onClick={close}/></nav><QuoteButton className="header-cta"/><Button ref={toggleRef} variant="ghost" size="icon" className="mobile-menu min-h-11 min-w-11" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} aria-controls="menu-principal" onClick={() => setMenu(!menu)}>{menu ? <X aria-hidden="true"/> : <Menu aria-hidden="true"/>}</Button></header>
  <main id="contenido" tabIndex={-1}>{children}</main><footer className="footer"><div className="container-site footer-inner"><Brand/><p>Cuidamos los detalles. En cada estación.</p><p>© {new Date().getFullYear()} Clara.</p></div></footer>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="quote-dialog"><DialogHeader><DialogTitle>Tu próximo espacio impecable</DialogTitle><DialogDescription>Cuéntanos qué necesitas para preparar tu solicitud.</DialogDescription></DialogHeader><QuoteForm initialService={service}/></DialogContent></Dialog>
  </QuoteContext.Provider>;
}
const Req = () => <span className="req"> (obligatorio)</span>;
export function QuoteForm({ initialService = 'Limpieza de ventanas' }: { initialService?: string }) {
  const [ready, setReady] = useState(false); const [sending, setSending] = useState(false); const [failed, setFailed] = useState(false);
  const successRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (ready) successRef.current?.focus(); }, [ready]);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setSending(true); setFailed(false); setReady(false);
    const { error } = await supabase.from('quote_requests').insert({ name: String(data.get('name')), email: String(data.get('email')), service: String(data.get('service')), location: String(data.get('location')), details: String(data.get('details')) });
    setSending(false); if (error) { setFailed(true); return; } form.reset(); setReady(true); }
  return <form className="quote-form" onSubmit={submit} onInput={() => { setReady(false); setFailed(false); }}>
    <label>Nombre<Req/><input name="name" autoComplete="name" placeholder="Tu nombre" maxLength={200} required aria-required="true"/></label>
    <label>Correo electrónico<Req/><input name="email" type="email" inputMode="email" autoComplete="email" placeholder="tu@correo.com" maxLength={255} required aria-required="true"/></label>
    <label>Servicio<Req/><select name="service" defaultValue={initialService} required aria-required="true"><option>Limpieza de ventanas</option><option>Retiro de nieve</option><option>Ambos servicios</option></select></label>
    <label>Ubicación<Req/><input name="location" autoComplete="address-level2" placeholder="Ciudad o zona" maxLength={300} required aria-required="true"/></label>
    <label>Cuéntanos un poco más<Req/><textarea name="details" autoComplete="off" placeholder="Tipo de propiedad, tamaño y fecha deseada…" maxLength={3000} required aria-required="true"/></label>
    <Button type="submit" disabled={sending}><Send aria-hidden="true"/>{sending ? 'Enviando…' : 'Enviar solicitud'}</Button>
    <div aria-live="polite">{ready && <p ref={successRef} tabIndex={-1} className="success-notice" role="status"><Check className="inline mr-2" size={16} aria-hidden="true"/>¡Solicitud enviada! Nuestro equipo te contactará pronto.</p>}</div>
    {failed && <p className="form-error" role="alert">No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.</p>}
  </form>;
}
export function Services() { return <div className="service-grid">{[{ title:'Limpieza de ventanas', icon: Grid2X2, img: heroPhoto, alt: 'Profesional limpiando los ventanales de una casa en un día de invierno', text:'Más luz, mejores vistas. Cuidamos tus cristales por dentro y por fuera, con atención a cada detalle.', features:['Hogares y negocios','Interior y exterior'], cls:'' }, { title:'Retiro de nieve', icon: Snowflake, img: snowPhoto, alt: 'Trabajador con pala despejando de nieve el camino de entrada a una casa', text:'Que el invierno no se interponga. Despejamos tus accesos y espacios exteriores para que sigas con tu día.', features:['Entradas y caminos','Espacios comerciales'], cls:'snow-image' }].map(({title,icon:Icon,img,alt,text,features,cls}) => <article className="service-card" key={title}><img src={img} loading="lazy" width={1536} height={1024} alt={alt} className={`service-image ${cls}`}/><div className="service-body"><div className="service-title"><Icon size={25} strokeWidth={1.5} aria-hidden="true"/><h3>{title}</h3></div><p>{text}</p><ul className="service-list">{features.map(f => <li key={f}><Check aria-hidden="true"/>{f}</li>)}</ul><QuoteButton service={title} label={`Consultar servicio: ${title}`}>Consultar servicio</QuoteButton></div></article>)}</div>; }
export function Process() { return <section className="process-band"><div className="container-site section"><div className="section-heading"><div><div className="eyebrow">Así de sencillo</div><h2>Nosotros nos encargamos.</h2></div><p>Menos pendientes para ti.<br/>Más cuidado para tu propiedad.</p></div><ol className="process-grid">{[['Cuéntanos qué necesitas','Cada espacio es diferente. Empezamos por conocer el tuyo.'],['Encuentra tu solución','Definimos el servicio y una fecha que se ajuste a tus necesidades.'],['Disfruta el resultado','Ventanas relucientes y accesos despejados, sin complicaciones.']].map(([title, text],i) => <li key={title}><span className="step-number" aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>; }
export function FinalCTA() { return <section className="container-site final-band"><div><h2>Tu propiedad, en buenas manos.</h2><p>Un nuevo comienzo para tus ventanas. Un camino libre para tu invierno.</p></div><QuoteButton/></section>; }
export function TrustStrip() { return <section className="trust-strip" aria-label="Nuestro compromiso"><ul className="container-site trust-inner">{[[ShieldCheck,'Cuidado de tu propiedad'],[Sparkles,'Atención al detalle'],[Leaf,'Limpieza responsable'],[Snowflake,'En cada estación']].map(([Icon,text]) => { const I = Icon as typeof ShieldCheck; return <li className="trust-item" key={String(text)}><I strokeWidth={1.6} aria-hidden="true"/><span>{String(text)}</span></li>; })}</ul></section>; }
export const sitePhoto = heroPhoto;
export function pageMeta(title: string, description: string) { return { meta: [{title: `${title} | Clara`},{name:'description',content:description},{property:'og:title',content:`${title} | Clara`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}] }; }
