import { createFileRoute } from "@tanstack/react-router";

import { About } from "@/components/upca/about";
import { Areas } from "@/components/upca/areas";
import { Marquee } from "@/components/upca/marquee";
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

export const Route = createFileRoute("/")({
  component: Index,
});

// The page is the journey first: the scrub controller owns media time while each
// chapter stays server-rendered in normal flow. The sections after it follow the
// same route-and-waypoint language.
function Index() {
  return (
    <>
      <SiteNav />
      <Reveal />
      <main>
        <span id="home" />
        <ScrollScrub className="upca-journey" scenes={scrollScrubScenes} theme={scrollScrubTheme} />
        <Marquee />
        <Services />
        <About />
        <Why />
        <Process />
        <Packages />
        <Testimonials />
        <Areas />
        <Faq />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
