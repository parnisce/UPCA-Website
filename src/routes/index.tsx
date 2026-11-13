import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { About } from "@/components/upca/about";
import { Areas } from "@/components/upca/areas";
import { Marquee } from "@/components/upca/marquee";
import { LatestPosts } from "@/components/upca/latest-posts";
import { Faq } from "@/components/upca/faq";
import { Services } from "@/components/upca/services";
import { Testimonials } from "@/components/upca/testimonials";
import { FinalCTA } from "@/components/upca/final-cta";
import { SiteFooter } from "@/components/upca/footer";
import { SiteNav } from "@/components/upca/nav";
import { Packages } from "@/components/upca/packages";
import { Process } from "@/components/upca/process";
import { Why } from "@/components/upca/why";
import { Reveal } from "@/components/upca/reveal";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  component: Index,
});

// The page is the journey first: the scrub controller owns media time while each
// chapter stays server-rendered in normal flow. The sections after it follow the
// same route-and-waypoint language.
function Index() {
  // Hero chapter copy can be edited from the admin. The scenes array only changes
  // identity when the saved copy actually differs, so the scrub engine rebuilds at most once.
  const hero = useSiteContent().hero;
  const heroKey = JSON.stringify(hero ?? null);
  const scenes = useMemo(() => {
    if (!hero) return scrollScrubScenes;
    return scrollScrubScenes.map((sc, i) => {
      const h = hero[i];
      return h ? { ...sc, title: h.title || sc.title, body: h.body || sc.body, tags: h.tag ? [h.tag] : sc.tags } : sc;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroKey]);
  return (
    <>
      <SiteNav />
      <Reveal />
      <main>
        <span id="home" />
        <ScrollScrub className="upca-journey" scenes={scenes} theme={scrollScrubTheme} />
        <Marquee />
        <Services />
        <About />
        <Why />
        <Process />
        <Packages />
        <Testimonials />
        <Areas />
        <LatestPosts />
        <Faq />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
