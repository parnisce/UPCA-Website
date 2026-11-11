import { REASONS } from "./content";

export function Why() {
  return (
    <section className="u-section u-why u-bgsec" id="why" style={{ ["--bg" as string]: "url(/assets/world/scene-06-poster.jpg)" }}>
      <div className="u-wrap u-why__grid">
        <div>
          <p className="u-eyebrow">Why UPCA</p>
          <h2 className="u-h2 u-draw u-why__title">
            Marketing that makes your <em>listing stand out.</em>
          </h2>
          <p className="u-lede">We combine creativity, technology and local marketing expertise to deliver results that help you sell faster and for more.</p>
        </div>
        <ul className="u-reasons">
          {REASONS.map((r) => (
            <li key={r.title}>
              <img alt="" height={48} src={`/assets/icons/${r.icon}.png`} width={48} />
              <div>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
