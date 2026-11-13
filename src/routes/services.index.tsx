import { createFileRoute } from "@tanstack/react-router";

import { CtaBand, PageHero, PageShell } from "@/components/upca/page-shell";
import { SERVICE_DETAILS } from "@/components/upca/service-details";
import { useServices } from "@/lib/site-content";

const DESC = "Real estate photography, property video tours, 360 virtual tours, drone photo and video, agent websites and full-service marketing in Niagara, Hamilton and Burlington.";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services | UPCA Real Estate Marketing and Media" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Services | UPCA Real Estate Marketing and Media" },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const SERVICES = useServices();
  return (
    <PageShell>
      <PageHero
        eyebrow="Our services"
        image="/assets/world/scene-04-poster.jpg"
        lede="High-quality media and marketing services to help you showcase properties, attract more buyers and grow your real estate business."
        title="Complete real estate marketing solutions."
      />
      <section className="u-section u-services u-bgsec" style={{ ["--bg" as string]: "url(/assets/world/scene-01-poster.jpg)" }}>
        <div className="u-wrap">
          <ol className="u-svc">
            {SERVICES.map((s, i) => {
              const d = SERVICE_DETAILS.find((x) => x.slug === s.slug);
              return (
                <li key={s.slug} style={{ ["--i" as string]: i }}>
                  <a className="u-svc__card" href={`/services/${s.slug}`}>
                    <span className="u-svc__img">
                      <img alt="" height={540} loading="lazy" src={s.img} width={960} />
                      <span aria-hidden="true" className="u-svc__num">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <h3>{s.title}</h3>
                    <p>{d?.tagline ?? s.text}</p>
                    <p className="u-svc__from">{d ? `${d.from.label} from ${d.from.price}` : ""}</p>
                    <span className="u-svc__go">View service</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
      <CtaBand text="Tell us about your property and we will recommend the right package." title="Not sure what you need?" />
    </PageShell>
  );
}
