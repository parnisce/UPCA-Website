import { REASONS } from "./content";

export function Why() {
  return (
    <section className="u-section u-why" id="why">
      <div className="u-wrap u-why__grid">
        <h2 className="u-h2 u-why__title">
          Marketing that makes your <em>listing stand out.</em>
        </h2>
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
