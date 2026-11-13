import { useContact } from "@/lib/site-content";
import { CALL_FIRST_AREAS, CORE_AREAS } from "./content";

function Pin() {
  return (
    <svg aria-hidden="true" className="u-town__pin" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Areas() {
  const CONTACT = useContact();
  return (
    <section className="u-section u-areas u-bgsec" id="areas" style={{ ["--bg" as string]: "url(/assets/img/niagara.jpg)" }}>
      <div className="u-wrap">
        <header className="u-areas__head">
          <div>
            <p className="u-eyebrow">Areas we serve</p>
            <h2 className="u-h2 u-h2--sm u-draw">Niagara, Hamilton and Burlington.</h2>
          </div>
          <p className="u-lede">We provide real estate media and marketing services across Niagara, Hamilton, Burlington and surrounding areas.</p>
        </header>

        <div className="u-areas__body">
          <figure className="u-areas__fig">
            <img alt="Niagara Falls and the Niagara River gorge at blue hour" className="u-areas__img" height={688} loading="lazy" src="/assets/img/niagara.jpg" width={1024} />
            <figcaption className="u-areas__badge">
              <strong>{CORE_AREAS.length}</strong>
              <span>core communities, one local team</span>
            </figcaption>
          </figure>

          <div className="u-areas__panel">
            <h3 className="u-areas__sub">Core service area</h3>
            <ul className="u-towns">
              {CORE_AREAS.map((a, i) => (
                <li key={a} style={{ ["--i" as string]: i }}>
                  <Pin />
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            <div className="u-callfirst">
              <div>
                <h3 className="u-areas__sub">Call us first</h3>
                <ul className="u-callfirst__tags">
                  {CALL_FIRST_AREAS.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <p>Nearby regions may be available on request.</p>
              </div>
              <a className="u-callfirst__btn" href={CONTACT.phoneHref}>
                {CONTACT.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
