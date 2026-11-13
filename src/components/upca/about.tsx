import { useAbout } from "@/lib/site-content";

export function About() {
  const ABOUT = useAbout();
  return (
    <section className="u-section u-about u-bgsec" id="about" style={{ ["--bg" as string]: "url(/assets/world/scene-04-poster.jpg)" }}>
      <div className="u-wrap u-about__grid">
        <div>
          <h2 className="u-h2 u-h2--sm u-draw">{ABOUT.title}</h2>
          {ABOUT.paragraphs.map((p) => (
            <p className="u-lede" key={p}>{p}</p>
          ))}
          <dl className="u-facts">
            {ABOUT.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.value}</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="u-collage">
          <img alt="Niagara Falls and the river gorge at blue hour" className="u-collage__a" height={688} loading="lazy" src="/assets/img/niagara.jpg" width={1024} />
          <img alt="Bright open-plan living room and kitchen" className="u-collage__b" height={688} loading="lazy" src="/assets/img/interior.jpg" width={1024} />
          <span aria-hidden="true" className="u-collage__ring" />
        </div>
      </div>
    </section>
  );
}
