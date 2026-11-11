import { ABOUT } from "./content";

export function About() {
  return (
    <section className="u-section u-about" id="about">
      <div className="u-wrap u-about__grid">
        <div>
          <h2 className="u-h2 u-h2--sm">{ABOUT.title}</h2>
          {ABOUT.paragraphs.map((p) => (
            <p className="u-lede" key={p}>{p}</p>
          ))}
        </div>
        <dl className="u-facts">
          {ABOUT.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.value}</dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
