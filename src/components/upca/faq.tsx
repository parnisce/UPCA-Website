import { useFaqs } from "@/lib/site-content";

export function Faq() {
  const FAQS = useFaqs();
  return (
    <section className="u-section u-faq u-bgsec" id="faq" style={{ ["--bg" as string]: "url(/assets/img/niagara.jpg)" }}>
      <div className="u-wrap u-faq__grid">
        <h2 className="u-h2 u-h2--sm u-draw">Questions, answered.</h2>
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
