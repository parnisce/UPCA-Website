import { createFileRoute } from "@tanstack/react-router";

import { Areas } from "@/components/upca/areas";
import { FinalCTA } from "@/components/upca/final-cta";
import { SiteFooter } from "@/components/upca/footer";
import { SiteNav } from "@/components/upca/nav";
import { Packages } from "@/components/upca/packages";
import { Process } from "@/components/upca/process";
import { Why } from "@/components/upca/why";
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
      <main>
        <ScrollScrub className="upca-journey" scenes={scrollScrubScenes} theme={scrollScrubTheme} />
        <Packages />
        <Process />
        <Why />
        <Areas />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
