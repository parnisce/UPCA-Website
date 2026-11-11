import { FAQS } from "./content";

export function Faq() {
  return (
    <section className="u-section u-faq" id="faq">
      <div className="u-wrap u-faq__grid">
        <h2 className="u-h2 u-h2--sm">Questions, answered.</h2>
        <div className="u-faq__list">
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
