import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { createFileRoute } from "@tanstack/react-router";
import { Globe } from "@/components/ui/globe";
import { SiteShell, TrustStrip, FinalCTA, pageMeta } from "@/components/clean-site";
import { useI18n, usePageMeta } from "@/lib/i18n";
export const Route = createFileRoute("/nosotros")({
  head: () => pageMeta("about"),
  component: Nosotros,
});
function Nosotros() {
  usePageMeta("about");
  const { t } = useI18n();
  const a = t.about;
  return (
    <SiteShell>
      <section className="container-site">
        <div className="page-heading">
          <div className="eyebrow">{a.eyebrow}</div>
          <h1>
            <AnimatedGradientText>{a.h1}</AnimatedGradientText>
          </h1>
          <p>{a.p}</p>
        </div>
        <div className="about-layout">
          <div className="about-copy">
            <h2>
              <AnimatedGradientText>{a.h2a}</AnimatedGradientText>
            </h2>
            <p>{a.pa}</p>
            <h2>
              <AnimatedGradientText>{a.h2b}</AnimatedGradientText>
            </h2>
            <p>{a.pb}</p>
          </div>
          <figure className="about-globe">
            <Globe />
            <figcaption>{a.globe}</figcaption>
          </figure>
        </div>
      </section>
      <TrustStrip />
      <FinalCTA />
    </SiteShell>
  );
}
