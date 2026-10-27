import { createFileRoute } from '@tanstack/react-router';
import { SiteShell, TrustStrip, FinalCTA, pageMeta } from '@/components/clean-site';
import { useI18n, usePageMeta } from '@/lib/i18n';
export const Route = createFileRoute('/nosotros')({head: () => pageMeta('about'),component: Nosotros});
function Nosotros() { usePageMeta('about'); const { t } = useI18n(); const a = t.about; return <SiteShell><section className="container-site"><div className="page-heading"><div className="eyebrow">{a.eyebrow}</div><h1>{a.h1}</h1><p>{a.p}</p></div><div className="about-copy"><h2>{a.h2a}</h2><p>{a.pa}</p><h2>{a.h2b}</h2><p>{a.pb}</p></div></section><TrustStrip/><FinalCTA/></SiteShell>; }
