import { TESTIMONIALS } from "./content";

export function Testimonials() {
  return (
    <section className="u-section u-reviews" id="testimonials">
      <div className="u-wrap">
        <p className="u-eyebrow">What our clients say</p>
        <h2 className="u-h2 u-h2--sm">Trusted by real estate professionals.</h2>
        <ul className="u-quotes">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <blockquote>{t.text}</blockquote>
              <p className="u-quotes__who"><strong>{t.name}</strong> {t.role}</p>
              <span className="u-quotes__tag">Sample review</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
