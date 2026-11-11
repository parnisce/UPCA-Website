import { SERVICES } from "./content";

export function Services() {
  return (
    <section className="u-section u-services" id="services">
      <div className="u-wrap">
        <p className="u-eyebrow">Our services</p>
        <h2 className="u-h2 u-h2--sm">Complete real estate marketing solutions.</h2>
        <p className="u-lede">High-quality media and marketing services to help you showcase properties, attract more buyers and grow your real estate business.</p>
        <ol className="u-svc">
          {SERVICES.map((s, i) => (
            <li key={s.title}>
              <span aria-hidden="true" className="u-svc__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href="#packages">See packages</a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
