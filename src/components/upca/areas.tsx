import { CALL_FIRST_AREAS, CORE_AREAS } from "./content";

export function Areas() {
  return (
    <section className="u-section u-areas" id="areas">
      <div className="u-wrap u-areas__grid">
        <div className="u-areas__copy">
          <p className="u-eyebrow">Areas we serve</p>
          <h2 className="u-h2 u-h2--sm">Niagara, Hamilton and Burlington.</h2>
          <p className="u-lede">Real estate media and marketing across the Niagara region, with Hamilton, Burlington and Haldimand by arrangement.</p>
          <ul className="u-towns">
            {CORE_AREAS.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="u-towns__note">Call us first for {CALL_FIRST_AREAS.join(", ")}. Nearby regions may be available on request.</p>
        </div>
        <div className="u-frames">
          <img alt="Niagara Falls and the Niagara River gorge at blue hour" className="u-frames__main" height={688} loading="lazy" src="/assets/img/niagara.jpg" width={1024} />
          <img alt="Aerial view of a suburban home with a pool at golden hour" className="u-frames__second" height={688} loading="lazy" src="/assets/img/aerial.jpg" width={1024} />
        </div>
      </div>
    </section>
  );
}
