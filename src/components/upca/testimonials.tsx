import { useTestimonials } from "@/lib/site-content";

export function Testimonials() {
  const TESTIMONIALS = useTestimonials();
  return (
    <section className="u-section u-reviews u-bgsec" id="testimonials" style={{ ["--bg" as string]: "url(/assets/world/scene-05-poster.jpg)" }}>
      <div className="u-wrap">
        <p className="u-eyebrow">What our clients say</p>
        <h2 className="u-h2 u-h2--sm u-draw">Trusted by real estate professionals.</h2>
        <ul className="u-quotes">
          {TESTIMONIALS.map((t) => (
            <li key={t.name + t.text.slice(0, 12)}>
              <blockquote>{t.text}</blockquote>
              <p className="u-quotes__who"><strong>{t.name}</strong> {t.role}</p>
              {t.sample ? <span className="u-quotes__tag">Sample review</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
