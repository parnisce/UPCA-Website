import { SERVICES } from "./content";

export function Services() {
  return (
    <section className="u-section u-services u-bgsec" id="services" style={{ ["--bg" as string]: "url(/assets/world/scene-01-poster.jpg)" }}>
      <div className="u-wrap">
        <p className="u-eyebrow">Our services</p>
        <h2 className="u-h2 u-h2--sm u-draw">Complete real estate marketing solutions.</h2>
        <p className="u-lede">High-quality media and marketing services to help you showcase properties, attract more buyers and grow your real estate business.</p>
        <ol className="u-svc">
          {SERVICES.map((s, i) => (
            <li key={s.title} style={{ ["--i" as string]: i }}>
              <a className="u-svc__card" href={`/services/${s.slug}`}>
                <span className="u-svc__img">
                  <img alt="" height={540} loading="lazy" src={s.img} width={960} />
                  <span aria-hidden="true" className="u-svc__num">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="u-svc__go">View service</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
