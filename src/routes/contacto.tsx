import { createFileRoute } from '@tanstack/react-router';
import { SiteShell, QuoteForm, pageMeta } from '@/components/clean-site';
export const Route = createFileRoute('/contacto')({head: () => pageMeta('Contacto y presupuesto','Prepara tu solicitud de presupuesto para limpieza de ventanas o retiro de nieve con Clara.'),component: Contacto});
function Contacto() { return <SiteShell><section className="container-site"><div className="page-heading"><div className="eyebrow">Hablemos de tu espacio</div><h1>¿En qué podemos ayudarte?</h1><p>Completa los detalles de tu propiedad y del servicio que buscas para preparar una solicitud de presupuesto.</p></div><div className="contact-form"><QuoteForm/></div></section></SiteShell>; }
