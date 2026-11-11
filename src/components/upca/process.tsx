import { STEPS } from "./content";

export function Process() {
  return (
    <section className="u-section u-process" id="process">
      <div className="u-wrap">
        <h2 className="u-h2 u-h2--sm">Three steps from booking to live listing.</h2>
        <ol className="u-steps">
          <span aria-hidden="true" className="u-steps__route" />
          {STEPS.map((s, i) => (
            <li className="u-step" key={s.title}>
              <span aria-hidden="true" className="u-step__num">
                {i + 1}
              </span>
              <span aria-hidden="true" className="u-step__pin" />
              <img alt="" className="u-step__icon" height={56} src={`/assets/icons/${s.icon}.png`} width={56} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
