import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { createFileRoute } from '@tanstack/react-router';
import { SiteShell, QuoteForm, pageMeta } from '@/components/clean-site';
import { useI18n, usePageMeta } from '@/lib/i18n';
export const Route = createFileRoute('/contacto')({head: () => pageMeta('contact'),component: Contacto});
function Contacto() { usePageMeta('contact'); const { t } = useI18n(); const c = t.contact; return <SiteShell><section className="container-site contact-page"><div className="page-heading"><div className="eyebrow">{c.eyebrow}</div><h1><AnimatedGradientText>{c.h1}</AnimatedGradientText></h1><p>{c.p}</p></div><div className="contact-form"><QuoteForm/></div></section></SiteShell>; }
