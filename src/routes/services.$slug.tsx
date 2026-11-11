import { createFileRoute, notFound } from "@tanstack/react-router";

import { PACKAGES, SERVICES } from "@/components/upca/content";
import { CtaBand, PageHero, PageShell } from "@/components/upca/page-shell";
import { getServiceDetail } from "@/components/upca/service-details";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const detail = getServiceDetail(params.slug);
    const base = SERVICES.find((s) => s.slug === params.slug);
    if (!detail || !base) throw notFound();
    return { detail, base };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const title = `${loaderData.base.title} | UPCA Real Estate Marketing and Media`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.detail.metaDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.detail.metaDescription },
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { detail, base } = Route.useLoaderData();
  const pkgs = PACKAGES.filter((p) => detail.packages.includes(p.name));
  const others = SERVICES.filter((s) => s.slug !== base.slug);

  return (
    <PageShell>
      <PageHero crumb={{ href: "/services", label: "All services" }} eyebrow="Service" image={base.img} lede={detail.lead} title={detail.tagline} />

      <section className="u-section u-detail">
        <div className="u-wrap u-detail__grid">
          <div className="u-detail__main">
            <h2 className="u-areas__sub">{base.title}</h2>
            <ul className="u-hl">
              {detail.highlights.map((h, i) => (
                <li key={h.title}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{h.title}</h3>
                    <p>{h.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <h2 className="u-areas__sub u-detail__gap">What is included</h2>
            <ul className="u-checks">
              {detail.includes.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>

          <aside className="u-detail__side">
            <img alt={base.title} height={540} loading="lazy" src={base.img} width={960} />
            <div className="u-detail__card">
              <small>{detail.from.label} from</small>
              <strong>{detail.from.price}</strong>
              <p>Recommended: {detail.recommended}</p>
              <a className="u-callfirst__btn" href="/contact">
                Book Free Consultation
              </a>
            </div>
            <h2 className="u-areas__sub">Best for</h2>
            <ul className="u-callfirst__tags">
              {detail.bestFor.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="u-section u-detail__pk u-bgsec" style={{ ["--bg" as string]: "url(/assets/img/aerial.jpg)" }}>
        <div className="u-wrap">
          <p className="u-eyebrow">Packages</p>
          <h2 className="u-h2 u-h2--sm u-draw">Included in these packages.</h2>
          <ul className="u-pkgcards">
            {pkgs.map((p) => (
              <li key={p.id}>
                <small>{p.band}</small>
                <h3>{p.name}</h3>
                <strong>{p.price}</strong>
                <a href="/contact">{p.cta}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="u-section u-more">
        <div className="u-wrap">
          <h2 className="u-areas__sub">More services</h2>
          <ul className="u-more__list">
            {others.map((s) => (
              <li key={s.slug}>
                <a href={`/services/${s.slug}`}>
                  <span>{s.title}</span>
                  <i aria-hidden="true">&rarr;</i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand text="Share a few details and we will reply with the package that fits the property." title={`Ready for ${base.title.toLowerCase()}?`} />
    </PageShell>
  );
}
