import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { createFileRoute } from '@tanstack/react-router';
import { SiteShell, Services, Process, FinalCTA, pageMeta } from '@/components/clean-site';
import { useI18n, usePageMeta } from '@/lib/i18n';
export const Route = createFileRoute('/servicios')({head: () => pageMeta('services'),component: Servicios});
function Servicios() { usePageMeta('services'); const { t } = useI18n(); const s = t.servicesPage; return <SiteShell><section className="container-site"><div className="page-heading"><div className="eyebrow">{s.eyebrow}</div><h1><AnimatedGradientText>{s.h1}</AnimatedGradientText></h1><p>{s.p}</p></div><div className="pb-16"><Services/></div></section><Process/><FinalCTA/></SiteShell>; }
