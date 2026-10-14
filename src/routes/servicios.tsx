import { createFileRoute } from '@tanstack/react-router';
import { SiteShell, Services, Process, FinalCTA, pageMeta } from '@/components/clean-site';
export const Route = createFileRoute('/servicios')({head: () => pageMeta('Nuestros servicios','Limpieza de cristales interiores y exteriores y retiro de nieve en entradas, caminos y espacios comerciales.'),component: Servicios});
function Servicios() { return <SiteShell><section className="container-site"><div className="page-heading"><div className="eyebrow">Servicios Clara</div><h1>Cuidamos tu espacio en cada estación.</h1><p>Una solución para dejar entrar la luz. Otra para mantener el camino libre. Elige el servicio que necesita tu propiedad.</p></div><div className="pb-16"><Services/></div></section><Process/><FinalCTA/></SiteShell>; }
